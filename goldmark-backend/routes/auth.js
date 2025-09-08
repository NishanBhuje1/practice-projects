import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { query, transaction } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
  const userResult = await query(
    `
    SELECT 
      u.id, u.email, u.first_name, u.last_name, u.phone, u.is_admin,
      json_agg(
        json_build_object(
          'id', a.id,
          'type', a.type,
          'street', a.street,
          'city', a.city,
          'state', a.state,
          'zipCode', a.zip_code,
          'country', a.country,
          'isDefault', a.is_default
        )
      ) FILTER (WHERE a.id IS NOT NULL) as addresses
    FROM user_profiles u
    LEFT JOIN user_addresses a ON u.id = a.user_id
    WHERE u.id = $1
    GROUP BY u.id
  `,
    [userId]
  );

  if (userResult.rows.length === 0) return null;

  const user = userResult.rows[0];
  return {
    id: user.id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    isAdmin: user.is_admin,
    addresses: user.addresses || [],
  };
};

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password, firstName, lastName, phone } = value;

    // Check if user already exists
    const existingUser = await query(
      "SELECT id FROM user_profiles WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists",
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await query(
      `
      INSERT INTO user_profiles (email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, phone, is_admin, created_at
    `,
      [email, passwordHash, firstName, lastName, phone]
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password)
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration",
    });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password } = value;

    // Find user
    const userResult = await query(
      "SELECT id, email, password_hash, first_name, last_name, phone, is_admin, is_active FROM user_profiles WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: "Account disabled",
        message: "Your account has been disabled",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Get full user profile
    const userProfile = await getUserProfile(user.id);

    res.json({
      message: "Login successful",
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "An error occurred during login",
    });
  }
});

// Admin login endpoint (separate for admin dashboard)
router.post("/admin/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { email, password } = value;

    // Find admin user
    const userResult = await query(
      "SELECT id, email, password_hash, first_name, last_name, is_admin, is_active FROM user_profiles WHERE email = $1 AND is_admin = true",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Access denied",
        message: "Admin credentials required",
      });
    }

    const admin = userResult.rows[0];

    if (!admin.is_active) {
      return res.status(401).json({
        error: "Account disabled",
        message: "Admin account has been disabled",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token
    const token = generateToken(admin.id);

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: `${admin.first_name} ${admin.last_name}`,
        isAdmin: admin.is_admin,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "An error occurred during admin login",
    });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.id);

    if (!userProfile) {
      return res.status(404).json({
        error: "User not found",
        message: "User profile could not be retrieved",
      });
    }

    res.json({ user: userProfile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      error: "Profile fetch failed",
      message: "Could not retrieve user profile",
    });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const updateSchema = Joi.object({
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      phone: Joi.string().optional(),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (value.firstName) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(value.firstName);
    }
    if (value.lastName) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(value.lastName);
    }
    if (value.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(value.phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "No updates provided",
        message: "Please provide at least one field to update",
      });
    }

    values.push(req.user.id);

    await query(
      `
      UPDATE user_profiles 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
    `,
      values
    );

    const updatedProfile = await getUserProfile(req.user.id);

    res.json({
      message: "Profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "Profile update failed",
      message: "Could not update user profile",
    });
  }
});

// Add/Update user address
router.post("/addresses", authenticateToken, async (req, res) => {
  try {
    const addressSchema = Joi.object({
      type: Joi.string().valid("shipping", "billing").default("shipping"),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
      isDefault: Joi.boolean().default(false),
    });

    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    await transaction(async (client) => {
      // If this is set as default, remove default from other addresses
      if (value.isDefault) {
        await client.query(
          "UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND type = $2",
          [req.user.id, value.type]
        );
      }

      // Add new address
      const newAddress = await client.query(
        `
        INSERT INTO user_addresses (user_id, type, street, city, state, zip_code, country, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [
          req.user.id,
          value.type,
          value.street,
          value.city,
          value.state,
          value.zipCode,
          value.country,
          value.isDefault,
        ]
      );

      return newAddress.rows[0];
    });

    res.status(201).json({
      message: "Address added successfully",
    });
  } catch (error) {
    console.error("Address creation error:", error);
    res.status(500).json({
      error: "Address creation failed",
      message: "Could not add address",
    });
  }
});

// Verify token endpoint
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.id);
    res.json({
      valid: true,
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      error: "Verification failed",
      message: "Could not verify token",
    });
  }
});

// Logout endpoint (optional - JWT is stateless)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
