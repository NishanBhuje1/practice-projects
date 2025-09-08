// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const router = express.Router();

// Middleware to verify JWT token (for protected routes)
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Registration endpoint
router.post("/register", async (req, res) => {
  const { email, username, password, first_name, last_name } = req.body;

  try {
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        error: "Email, username, and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await query(
      "SELECT id FROM user_profiles WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User with this email or username already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = `
      INSERT INTO user_profiles (email, username, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, first_name, last_name, created_at
    `;

    const result = await query(insertQuery, [
      email.toLowerCase(),
      username,
      hashedPassword,
      first_name || null,
      last_name || null,
    ]);

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific database errors
    if (error.code === "23505") {
      // Unique violation
      return res.status(409).json({
        error: "User with this email or username already exists",
      });
    }

    res.status(500).json({
      error: "An error occurred during registration",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email (case-insensitive)
    const result = await query(
      "SELECT id, email, username, password_hash, first_name, last_name FROM user_profiles WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Update last login timestamp (optional)
    await query(
      "UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data (without password)
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "An error occurred during login",
    });
  }
});

// Get current user profile (protected route)
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, username, first_name, last_name, created_at, updated_at FROM user_profiles WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile (protected route)
router.put("/profile", verifyToken, async (req, res) => {
  const { first_name, last_name, username } = req.body;

  try {
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }

    if (username !== undefined) {
      updates.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add user id as the last parameter
    values.push(req.user.id);

    const updateQuery = `
      UPDATE user_profiles 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, email, username, first_name, last_name, updated_at
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.code === "23505") {
      // Unique violation
      return res.status(409).json({
        error: "Username already taken",
      });
    }

    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password (protected route)
router.post("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    // Get current user's password hash
    const result = await query(
      "SELECT password_hash FROM user_profiles WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      "UPDATE user_profiles SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Logout endpoint (optional - mainly for client-side token removal)
router.post("/logout", verifyToken, (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage. This endpoint can be used
  // for logging purposes or to blacklist tokens if implemented.
  res.json({ message: "Logged out successfully" });
});

// Password reset request (sends reset email)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const result = await query(
      "SELECT id, email FROM user_profiles WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: "If the email exists, a password reset link has been sent",
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: "password-reset" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // TODO: Send email with reset link containing the token
    // For now, just return the token (remove this in production!)
    console.log("Password reset token:", resetToken);

    res.json({
      message: "If the email exists, a password reset link has been sent",
      // Remove this line in production:
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      if (decoded.type !== "password-reset") {
        throw new Error("Invalid token type");
      }
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const result = await query(
      "UPDATE user_profiles SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id",
      [hashedPassword, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
