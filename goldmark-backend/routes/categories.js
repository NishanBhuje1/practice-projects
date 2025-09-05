import { query as pgQuery } from "../config/database.js";
import express from "express";

const router = express.Router();

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim("-"); // Remove leading/trailing hyphens
};

// Validation middleware
const validateCategory = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      error: "Name is required and must be a non-empty string",
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      error: "Name must be 100 characters or less",
    });
  }

  next();
};

// GET /api/categories - Get all categories
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      is_active,
      sort_by = "sort_order",
      sort_order = "ASC",
    } = req.query;

    const offset = (page - 1) * limit;
    let query = "SELECT * FROM categories";
    let countQuery = "SELECT COUNT(*) FROM categories";
    const queryParams = [];
    const countParams = [];

    // Add filtering
    if (is_active !== undefined) {
      query += " WHERE is_active = $1";
      countQuery += " WHERE is_active = $1";
      queryParams.push(is_active === "true");
      countParams.push(is_active === "true");
    }

    // Add sorting
    const validSortColumns = ["name", "sort_order", "created_at"];
    const validSortOrders = ["ASC", "DESC"];

    if (
      validSortColumns.includes(sort_by) &&
      validSortOrders.includes(sort_order.toUpperCase())
    ) {
      query += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
    } else {
      query += " ORDER BY sort_order ASC";
    }

    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [categoriesResult, countResult] = await Promise.all([
      pgQuery(query, queryParams),
      pgQuery(countQuery, countParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: categoriesResult.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_count: totalCount,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/categories/:id - Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const result = await pgQuery("SELECT * FROM categories WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/categories/slug/:slug - Get category by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pgQuery("SELECT * FROM categories WHERE slug = $1", [
      slug,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories - Create new category
router.post("/", validateCategory, async (req, res) => {
  try {
    const {
      name,
      description,
      image_url,
      is_active = true,
      sort_order = 0,
    } = req.body;

    // Generate slug from name
    const slug = generateSlug(name);

    const query = `
      INSERT INTO categories (name, slug, description, image_url, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      name.trim(),
      slug,
      description,
      image_url,
      is_active,
      sort_order,
    ];

    const result = await pgQuery(query, values);

    res.status(201).json({
      message: "Category created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      if (error.constraint === "categories_name_key") {
        return res.status(409).json({ error: "Category name already exists" });
      }
      if (error.constraint === "categories_slug_key") {
        return res.status(409).json({ error: "Category slug already exists" });
      }
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/categories/:id - Update category
router.put("/:id", validateCategory, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, is_active, sort_order } = req.body;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    // Check if category exists
    const existingCategory = await pgQuery(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Generate new slug if name changed
    const slug = generateSlug(name);

    const query = `
      UPDATE categories 
      SET name = $1, slug = $2, description = $3, image_url = $4, is_active = $5, sort_order = $6
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      name.trim(),
      slug,
      description,
      image_url,
      is_active !== undefined ? is_active : existingCategory.rows[0].is_active,
      sort_order !== undefined
        ? sort_order
        : existingCategory.rows[0].sort_order,
      id,
    ];

    const result = await pgQuery(query, values);

    res.json({
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      if (error.constraint === "categories_name_key") {
        return res.status(409).json({ error: "Category name already exists" });
      }
      if (error.constraint === "categories_slug_key") {
        return res.status(409).json({ error: "Category slug already exists" });
      }
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/categories/:id - Partial update category
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    // Check if category exists
    const existingCategory = await pgQuery(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (
        !updates.name ||
        typeof updates.name !== "string" ||
        updates.name.trim().length === 0
      ) {
        return res.status(400).json({
          error: "Name must be a non-empty string",
        });
      }
      if (updates.name.length > 100) {
        return res.status(400).json({
          error: "Name must be 100 characters or less",
        });
      }
    }

    const allowedFields = [
      "name",
      "description",
      "image_url",
      "is_active",
      "sort_order",
    ];
    const updateFields = [];
    const updateValues = [];
    let valueIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === "name") {
          updateFields.push(
            `name = $${valueIndex}`,
            `slug = $${valueIndex + 1}`
          );
          updateValues.push(value.trim(), generateSlug(value));
          valueIndex += 2;
        } else {
          updateFields.push(`${key} = $${valueIndex}`);
          updateValues.push(value);
          valueIndex++;
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const query = `
      UPDATE categories 
      SET ${updateFields.join(", ")}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    updateValues.push(id);

    const result = await pgQuery(query, updateValues);

    res.json({
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      if (error.constraint === "categories_name_key") {
        return res.status(409).json({ error: "Category name already exists" });
      }
      if (error.constraint === "categories_slug_key") {
        return res.status(409).json({ error: "Category slug already exists" });
      }
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const result = await pgQuery(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      return res.status(409).json({
        error:
          "Cannot delete category because it is referenced by other records",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/categories/:id/toggle-active - Toggle category active status
router.put("/:id/toggle-active", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const result = await pgQuery(
      "UPDATE categories SET is_active = NOT is_active WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category status toggled successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error toggling category status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
