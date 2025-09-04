import express from "express";
import Joi from "joi";
import { query, transaction } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth.js";

const router = express.Router();

// Helper function to build product with images and variants
const buildProductWithDetails = async (productRows) => {
  if (productRows.length === 0) return [];

  const productIds = [...new Set(productRows.map((row) => row.id))];

  // Get all images for these products
  const imagesResult = await query(
    `
    SELECT product_id, image_url, alt_text, sort_order, is_primary
    FROM product_images 
    WHERE product_id = ANY($1)
    ORDER BY sort_order, created_at
  `,
    [productIds]
  );

  // Get all variants for these products
  const variantsResult = await query(
    `
    SELECT product_id, variant_type, variant_value, price_modifier, stock_quantity
    FROM product_variants 
    WHERE product_id = ANY($1) AND is_active = true
    ORDER BY variant_type, variant_value
  `,
    [productIds]
  );

  // Group images and variants by product
  const imagesByProduct = {};
  const variantsByProduct = {};

  imagesResult.rows.forEach((img) => {
    if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
    imagesByProduct[img.product_id].push(img.image_url);
  });

  variantsResult.rows.forEach((variant) => {
    if (!variantsByProduct[variant.product_id]) {
      variantsByProduct[variant.product_id] = {};
    }
    if (!variantsByProduct[variant.product_id][variant.variant_type]) {
      variantsByProduct[variant.product_id][variant.variant_type] = [];
    }
    variantsByProduct[variant.product_id][variant.variant_type].push(
      variant.variant_value
    );
  });

  // Build final product objects
  return productRows.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: parseFloat(product.price),
    description: product.description,
    category: product.category_name,
    images: imagesByProduct[product.id] || [],
    variants: variantsByProduct[product.id] || {},
    inStock: product.stock_quantity > 0,
    featured: product.is_featured,
    stockQuantity: product.stock_quantity,
    sku: product.sku,
    weight: product.weight ? parseFloat(product.weight) : null,
    dimensions: product.dimensions,
  }));
};

// Get all products with filtering and pagination
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      category,
      featured,
      search,
      sort = "name",
      order = "asc",
      page = 1,
      limit = 20,
      inStock,
    } = req.query;

    // Build WHERE clauses
    const conditions = ["p.is_active = true"];
    const values = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      values.push(category);
    }

    if (featured === "true") {
      conditions.push(`p.is_featured = $${paramIndex++}`);
      values.push(true);
    }

    if (inStock === "true") {
      conditions.push(`p.stock_quantity > $${paramIndex++}`);
      values.push(0);
    }

    if (search) {
      conditions.push(
        `(p.name ILIKE $${paramIndex++} OR p.description ILIKE $${paramIndex++})`
      );
      values.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }

    // Build ORDER BY clause
    const allowedSortFields = ["name", "price", "created_at", "stock_quantity"];
    const sortField = allowedSortFields.includes(sort) ? sort : "name";
    const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*)
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(" AND ")}
    `,
      values
    );

    const totalProducts = parseInt(countResult.rows[0].count);

    // Get products
    const productsResult = await query(
      `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.sku,
        p.stock_quantity, p.is_featured, p.weight, p.dimensions,
        c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
      [...values, parseInt(limit), offset]
    );

    const products = await buildProductWithDetails(productsResult.rows);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch products",
      message: "Could not retrieve products",
    });
  }
});

// Get single product by ID or slug
router.get("/:identifier", optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is UUID or slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        identifier
      );

    const field = isUUID ? "p.id" : "p.slug";

    const productResult = await query(
      `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.sku,
        p.stock_quantity, p.is_featured, p.weight, p.dimensions,
        c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${field} = $1 AND p.is_active = true
    `,
      [identifier]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "The requested product could not be found",
      });
    }

    const products = await buildProductWithDetails(productResult.rows);
    const product = products[0];

    // Get related products (same category, excluding current product)
    const relatedResult = await query(
      `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.sku,
        p.stock_quantity, p.is_featured, p.weight, p.dimensions,
        c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = (SELECT category_id FROM products WHERE ${field} = $1)
        AND p.id != (SELECT id FROM products WHERE ${field} = $2)
        AND p.is_active = true
      ORDER BY p.is_featured DESC, RANDOM()
      LIMIT 4
    `,
      [identifier, identifier]
    );

    const relatedProducts = await buildProductWithDetails(relatedResult.rows);

    res.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      message: "Could not retrieve product details",
    });
  }
});

// Get all categories
router.get("/categories/all", async (req, res) => {
  try {
    const categoriesResult = await query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.sort_order
      ORDER BY c.sort_order, c.name
    `);

    const categories = categoriesResult.rows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.image_url,
      productCount: parseInt(cat.product_count),
    }));

    res.json({ categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      message: "Could not retrieve categories",
    });
  }
});

// Search products
router.get("/search/:term", optionalAuth, async (req, res) => {
  try {
    const { term } = req.params;
    const { category, sort = "relevance", limit = 20 } = req.query;

    if (!term || term.length < 2) {
      return res.status(400).json({
        error: "Invalid search term",
        message: "Search term must be at least 2 characters long",
      });
    }

    const conditions = ["p.is_active = true"];
    const values = [`%${term}%`, `%${term}%`];
    let paramIndex = 3;

    // Add search condition
    conditions.push(`(p.name ILIKE $1 OR p.description ILIKE $2)`);

    if (category) {
      conditions.push(`c.slug = $${paramIndex++}`);
      values.push(category);
    }

    // Build ORDER BY based on sort parameter
    let orderBy = "p.name ASC";
    if (sort === "price_asc") orderBy = "p.price ASC";
    else if (sort === "price_desc") orderBy = "p.price DESC";
    else if (sort === "newest") orderBy = "p.created_at DESC";

    const productsResult = await query(
      `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.sku,
        p.stock_quantity, p.is_featured, p.weight, p.dimensions,
        c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `,
      [...values, parseInt(limit)]
    );

    const products = await buildProductWithDetails(productsResult.rows);

    res.json({
      products,
      searchTerm: term,
      totalResults: products.length,
    });
  } catch (error) {
    console.error("Product search error:", error);
    res.status(500).json({
      error: "Search failed",
      message: "Could not perform product search",
    });
  }
});

// Admin: Create new product
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productSchema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().positive().required(),
      categoryId: Joi.string().uuid().required(),
      sku: Joi.string().optional(),
      stockQuantity: Joi.number().integer().min(0).default(0),
      isFeatured: Joi.boolean().default(false),
      weight: Joi.number().positive().optional(),
      dimensions: Joi.object().optional(),
      images: Joi.array().items(Joi.string().uri()).min(1).required(),
      variants: Joi.object()
        .pattern(Joi.string(), Joi.array().items(Joi.string()))
        .optional(),
    });

    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    // Generate slug from name
    const slug = value.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    // Check if slug already exists
    const existingProduct = await query(
      "SELECT id FROM products WHERE slug = $1",
      [slug]
    );
    if (existingProduct.rows.length > 0) {
      return res.status(409).json({
        error: "Product slug already exists",
        message: "A product with this name already exists",
      });
    }

    // Create product with transaction
    const result = await transaction(async (client) => {
      // Insert product
      const productResult = await client.query(
        `
        INSERT INTO products (name, slug, description, price, category_id, sku, stock_quantity, is_featured, weight, dimensions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
        [
          value.name,
          slug,
          value.description,
          value.price,
          value.categoryId,
          value.sku,
          value.stockQuantity,
          value.isFeatured,
          value.weight,
          value.dimensions,
        ]
      );

      const product = productResult.rows[0];

      // Insert images
      for (let i = 0; i < value.images.length; i++) {
        await client.query(
          `
          INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
          VALUES ($1, $2, $3, $4)
        `,
          [product.id, value.images[i], i, i === 0]
        );
      }

      // Insert variants
      if (value.variants) {
        for (const [variantType, variantValues] of Object.entries(
          value.variants
        )) {
          for (const variantValue of variantValues) {
            await client.query(
              `
              INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
              VALUES ($1, $2, $3, $4)
            `,
              [product.id, variantType, variantValue, value.stockQuantity]
            );
          }
        }
      }

      return product;
    });

    res.status(201).json({
      message: "Product created successfully",
      productId: result.id,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({
      error: "Failed to create product",
      message: "Could not create product",
    });
  }
});

// Admin: Update product
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const updateSchema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      price: Joi.number().positive().optional(),
      categoryId: Joi.string().uuid().optional(),
      stockQuantity: Joi.number().integer().min(0).optional(),
      isFeatured: Joi.boolean().optional(),
      isActive: Joi.boolean().optional(),
      weight: Joi.number().positive().optional(),
      dimensions: Joi.object().optional(),
      images: Joi.array().items(Joi.string().uri()).optional(),
      variants: Joi.object()
        .pattern(Joi.string(), Joi.array().items(Joi.string()))
        .optional(),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    // Check if product exists
    const existingProduct = await query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "The specified product does not exist",
      });
    }

    await transaction(async (client) => {
      // Update product
      const updates = [];
      const updateValues = [];
      let updateIndex = 1;

      for (const [key, val] of Object.entries(value)) {
        if (key === "images" || key === "variants") continue;

        const dbField =
          key === "categoryId"
            ? "category_id"
            : key === "stockQuantity"
            ? "stock_quantity"
            : key === "isFeatured"
            ? "is_featured"
            : key === "isActive"
            ? "is_active"
            : key.replace(/([A-Z])/g, "_$1").toLowerCase();

        updates.push(`${dbField} = $${updateIndex++}`);
        updateValues.push(val);
      }

      if (updates.length > 0) {
        updateValues.push(id);
        await client.query(
          `
          UPDATE products 
          SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${updateIndex}
        `,
          updateValues
        );
      }

      // Update images if provided
      if (value.images) {
        await client.query("DELETE FROM product_images WHERE product_id = $1", [
          id,
        ]);
        for (let i = 0; i < value.images.length; i++) {
          await client.query(
            `
            INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
            VALUES ($1, $2, $3, $4)
          `,
            [id, value.images[i], i, i === 0]
          );
        }
      }

      // Update variants if provided
      if (value.variants) {
        await client.query(
          "DELETE FROM product_variants WHERE product_id = $1",
          [id]
        );
        for (const [variantType, variantValues] of Object.entries(
          value.variants
        )) {
          for (const variantValue of variantValues) {
            await client.query(
              `
              INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
              VALUES ($1, $2, $3, $4)
            `,
              [id, variantType, variantValue, value.stockQuantity || 0]
            );
          }
        }
      }
    });

    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(500).json({
      error: "Failed to update product",
      message: "Could not update product",
    });
  }
});

// Admin: Delete product
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "UPDATE products SET is_active = false WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found",
        message: "The specified product does not exist",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product deletion error:", error);
    res.status(500).json({
      error: "Failed to delete product",
      message: "Could not delete product",
    });
  }
});

// Admin: Update stock quantity
router.patch(
  "/:id/stock",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { stockQuantity } = req.body;

      if (typeof stockQuantity !== "number" || stockQuantity < 0) {
        return res.status(400).json({
          error: "Invalid stock quantity",
          message: "Stock quantity must be a non-negative number",
        });
      }

      const result = await query(
        `
      UPDATE products 
      SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id, name, stock_quantity
    `,
        [stockQuantity, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "The specified product does not exist",
        });
      }

      res.json({
        message: "Stock updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Stock update error:", error);
      res.status(500).json({
        error: "Failed to update stock",
        message: "Could not update product stock",
      });
    }
  }
);

export default router;
