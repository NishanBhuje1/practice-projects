// middleware/auth.js
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      message: "Please provide a valid authentication token",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: Check the structure of your JWT token
    // If your auth routes create tokens with { id, email, username }
    // then use decoded.id, not decoded.userId
    const userId = decoded.id || decoded.userId; // Support both formats

    if (!userId) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token missing user information",
      });
    }

    // Get user from database - check table name!
    // You're using 'users' here but 'user_profiles' in auth routes
    // Make sure this matches your actual database schema
    const result = await query(
      `SELECT 
        id, 
        email, 
        username,
        first_name, 
        last_name, 
        is_admin, 
        is_active,
        created_at,
        updated_at
      FROM user_profiles 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid token",
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // Check if user account is active
    if (user.is_active === false) {
      return res.status(401).json({
        error: "Account disabled",
        message: "Your account has been disabled. Please contact support.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token; // Optional: attach token for logout functionality

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Your session has expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        error: "Invalid token",
        message: "The provided token is invalid.",
        code: "INVALID_TOKEN",
      });
    }

    // Generic error
    return res.status(403).json({
      error: "Authentication failed",
      message: "Token verification failed",
    });
  }
};

/**
 * Middleware to require admin privileges
 * Must be used AFTER authenticateToken
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please authenticate before accessing this resource",
    });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({
      error: "Admin access required",
      message: "You do not have permission to access this resource",
      code: "INSUFFICIENT_PRIVILEGES",
    });
  }

  next();
};

/**
 * Optional authentication middleware
 * Attaches user if valid token exists, otherwise continues without user
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // No token provided - continue without user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      req.user = null;
      return next();
    }

    // Get user from database
    const result = await query(
      `SELECT 
        id, 
        email, 
        username,
        first_name, 
        last_name, 
        is_admin, 
        is_active 
      FROM user_profiles 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Only attach user if account is active
      if (user.is_active !== false) {
        req.user = user;
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (error) {
    // Token is invalid or expired - continue without user
    console.log("Optional auth - invalid token:", error.message);
    req.user = null;
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 * Useful for user-specific resources like profiles, orders, etc.
 */
export const requireOwnership = (resourceIdParam = "id") => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate before accessing this resource",
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    // Admin can access any resource
    if (req.user.is_admin) {
      return next();
    }

    // Check if the resource belongs to the user
    // This is a generic check - you might need to customize based on resource type
    if (resourceId && parseInt(resourceId) !== userId) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this resource",
        code: "FORBIDDEN",
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware for specific user
 * Prevents a single user from making too many requests
 */
const userRequestCounts = new Map();

export const userRateLimit = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();

    if (!userRequestCounts.has(userId)) {
      userRequestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userData = userRequestCounts.get(userId);

    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
      return next();
    }

    if (userData.count >= maxRequests) {
      const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
      return res.status(429).json({
        error: "Too many requests",
        message: `Please wait ${retryAfter} seconds before making another request`,
        retryAfter,
      });
    }

    userData.count++;
    next();
  };
};

/**
 * Middleware to log user activity
 * Useful for audit trails
 */
export const logActivity = (action) => {
  return async (req, res, next) => {
    if (req.user) {
      try {
        await query(
          `INSERT INTO user_activity_logs (user_id, action, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [req.user.id, action, req.ip, req.get("user-agent")]
        );
      } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't block the request if logging fails
      }
    }
    next();
  };
};

/**
 * Verify user has verified email (if you implement email verification)
 */
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please authenticate before accessing this resource",
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      error: "Email verification required",
      message: "Please verify your email address to access this resource",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  next();
};
