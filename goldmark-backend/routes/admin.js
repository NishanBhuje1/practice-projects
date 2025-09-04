import express from "express";
import Joi from "joi";
import { query, transaction } from "../config/database.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

// Dashboard analytics
router.get("/dashboard/analytics", async (req, res) => {
  try {
    const { period = "30" } = req.query; // days

    // Main statistics
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT u.id) as total_customers,
        COUNT(CASE WHEN p.stock_quantity < 5 THEN 1 END) as low_stock_products,
        COUNT(CASE WHEN p.stock_quantity = 0 THEN 1 END) as out_of_stock_products
      FROM orders o
      FULL OUTER JOIN products p ON true
      FULL OUTER JOIN users u ON u.id = o.user_id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '${period} days' OR o.created_at IS NULL
    `);

    // Orders by status
    const orderStatusResult = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY status
      ORDER BY count DESC
    `);

    // Daily revenue for the period
    const dailyRevenueResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
        AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Top selling products
    const topProductsResult = await query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '${period} days'
        AND o.payment_status = 'paid'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Recent activity
    const recentActivityResult = await query(`
      SELECT 
        'order' as type,
        o.id,
        o.order_number as reference,
        o.total_amount as amount,
        o.status,
        o.created_at,
        CONCAT(o.shipping_first_name, ' ', o.shipping_last_name) as customer_name
      FROM orders o
      WHERE o.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const stats = statsResult.rows[0];

    res.json({
      stats: {
        totalOrders: parseInt(stats.total_orders) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        avgOrderValue: parseFloat(stats.avg_order_value) || 0,
        totalProducts: parseInt(stats.total_products) || 0,
        totalCustomers: parseInt(stats.total_customers) || 0,
        lowStockProducts: parseInt(stats.low_stock_products) || 0,
        outOfStockProducts: parseInt(stats.out_of_stock_products) || 0,
      },
      ordersByStatus: orderStatusResult.rows.map((row) => ({
        status: row.status,
        count: parseInt(row.count),
        revenue: parseFloat(row.revenue),
      })),
      dailyRevenue: dailyRevenueResult.rows.map((row) => ({
        date: row.date,
        orders: parseInt(row.orders),
        revenue: parseFloat(row.revenue),
      })),
      topProducts: topProductsResult.rows.map((row) => ({
        name: row.product_name,
        totalSold: parseInt(row.total_sold),
        totalRevenue: parseFloat(row.total_revenue),
        orderCount: parseInt(row.order_count),
      })),
      recentActivity: recentActivityResult.rows.map((row) => ({
        type: row.type,
        id: row.id,
        reference: row.reference,
        amount: parseFloat(row.amount),
        status: row.status,
        customerName: row.customer_name,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      message: "Could not retrieve dashboard analytics",
    });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const {
      search,
      isAdmin,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const conditions = ["u.id IS NOT NULL"];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex++} OR 
        u.email ILIKE $${paramIndex++}
      )`);
      values.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }

    if (isAdmin === "true") {
      conditions.push(`u.is_admin = $${paramIndex++}`);
      values.push(true);
    } else if (isAdmin === "false") {
      conditions.push(`u.is_admin = $${paramIndex++}`);
      values.push(false);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) FROM users u ${whereClause}
    `,
      values
    );

    const totalUsers = parseInt(countResult.rows[0].count);
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort parameters
    const allowedSortFields = [
      "created_at",
      "email",
      "first_name",
      "last_name",
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Get users with order statistics
    const usersResult = await query(
      `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, 
        u.is_admin, u.is_active, u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
      ${whereClause}
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.is_admin, u.is_active, u.created_at
      ORDER BY u.${sortField} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
      [...values, parseInt(limit), offset]
    );

    const users = usersResult.rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      isAdmin: user.is_admin,
      isActive: user.is_active,
      createdAt: user.created_at,
      totalOrders: parseInt(user.total_orders),
      totalSpent: parseFloat(user.total_spent),
    }));

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message: "Could not retrieve users",
    });
  }
});

// Update user status
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isAdmin } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (typeof isActive === "boolean") {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (typeof isAdmin === "boolean") {
      updates.push(`is_admin = $${paramIndex++}`);
      values.push(isAdmin);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "No updates provided",
        message: "Please provide at least one field to update",
      });
    }

    values.push(id);

    const result = await query(
      `
      UPDATE users 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, is_admin, is_active
    `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "The specified user does not exist",
      });
    }

    res.json({
      message: "User status updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("User status update error:", error);
    res.status(500).json({
      error: "Failed to update user status",
      message: "Could not update user status",
    });
  }
});

// Get inventory alerts
router.get("/inventory/alerts", async (req, res) => {
  try {
    // Low stock products (less than 5 items)
    const lowStockResult = await query(`
      SELECT 
        p.id, p.name, p.stock_quantity, p.price,
        pi.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity < 5 AND p.stock_quantity > 0 AND p.is_active = true
      ORDER BY p.stock_quantity ASC, p.name
    `);

    // Out of stock products
    const outOfStockResult = await query(`
      SELECT 
        p.id, p.name, p.stock_quantity, p.price,
        pi.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity = 0 AND p.is_active = true
      ORDER BY p.name
    `);

    res.json({
      lowStock: lowStockResult.rows.map((product) => ({
        id: product.id,
        name: product.name,
        stockQuantity: product.stock_quantity,
        price: parseFloat(product.price),
        imageUrl: product.image_url,
        categoryName: product.category_name,
      })),
      outOfStock: outOfStockResult.rows.map((product) => ({
        id: product.id,
        name: product.name,
        stockQuantity: product.stock_quantity,
        price: parseFloat(product.price),
        imageUrl: product.image_url,
        categoryName: product.category_name,
      })),
    });
  } catch (error) {
    console.error("Inventory alerts error:", error);
    res.status(500).json({
      error: "Failed to fetch inventory alerts",
      message: "Could not retrieve inventory alerts",
    });
  }
});

// Bulk update product stock
router.patch("/inventory/bulk-update", async (req, res) => {
  try {
    const bulkUpdateSchema = Joi.object({
      updates: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().uuid().required(),
            stockQuantity: Joi.number().integer().min(0).required(),
          })
        )
        .min(1)
        .required(),
    });

    const { error, value } = bulkUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { updates } = value;

    await transaction(async (client) => {
      for (const update of updates) {
        await client.query(
          `
          UPDATE products 
          SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND is_active = true
        `,
          [update.stockQuantity, update.productId]
        );
      }
    });

    res.json({
      message: `Successfully updated stock for ${updates.length} products`,
    });
  } catch (error) {
    console.error("Bulk stock update error:", error);
    res.status(500).json({
      error: "Failed to update stock",
      message: "Could not perform bulk stock update",
    });
  }
});

// Get system logs
router.get("/logs", async (req, res) => {
  try {
    const { type, page = 1, limit = 50, startDate, endDate } = req.query;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (type && type !== "all") {
      conditions.push(`action ILIKE $${paramIndex++}`);
      values.push(`%${type}%`);
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      values.push(endDate);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logsResult = await query(
      `
      SELECT 
        al.*,
        CONCAT(u.first_name, ' ', u.last_name) as admin_name,
        u.email as admin_email
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
      [...values, parseInt(limit), offset]
    );

    const logs = logsResult.rows.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      adminName: log.admin_name,
      adminEmail: log.admin_email,
      oldValues: log.old_values,
      newValues: log.new_values,
      ipAddress: log.ip_address,
      createdAt: log.created_at,
    }));

    res.json({ logs });
  } catch (error) {
    console.error("Admin logs fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch logs",
      message: "Could not retrieve system logs",
    });
  }
});

// Log admin action (utility function)
const logAdminAction = async (
  adminId,
  action,
  entityType = null,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null
) => {
  try {
    await query(
      `
      INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        adminId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req?.ip || null,
        req?.get("User-Agent") || null,
      ]
    );
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

// Export reports
router.get("/reports/export", async (req, res) => {
  try {
    const { type, startDate, endDate, format = "json" } = req.query;

    let data = [];
    let filename = "goldmark_report";

    switch (type) {
      case "orders":
        const ordersResult = await query(
          `
          SELECT 
            o.order_number, o.status, o.payment_status, o.total_amount,
            o.created_at, CONCAT(o.shipping_first_name, ' ', o.shipping_last_name) as customer_name,
            u.email as customer_email
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          WHERE ($1::date IS NULL OR o.created_at >= $1::date)
            AND ($2::date IS NULL OR o.created_at <= $2::date)
          ORDER BY o.created_at DESC
        `,
          [startDate || null, endDate || null]
        );

        data = ordersResult.rows;
        filename = "orders_report";
        break;

      case "products":
        const productsResult = await query(`
          SELECT 
            p.name, p.sku, p.price, p.stock_quantity, p.is_featured,
            c.name as category_name, p.created_at
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true
          ORDER BY p.name
        `);

        data = productsResult.rows;
        filename = "products_report";
        break;

      case "customers":
        const customersResult = await query(`
          SELECT 
            CONCAT(u.first_name, ' ', u.last_name) as name,
            u.email, u.phone, u.created_at,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
          WHERE u.is_admin = false
          GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at
          ORDER BY total_spent DESC
        `);

        data = customersResult.rows;
        filename = "customers_report";
        break;

      default:
        return res.status(400).json({
          error: "Invalid report type",
          message: "Supported types: orders, products, customers",
        });
    }

    if (format === "csv") {
      // Convert to CSV
      if (data.length === 0) {
        return res.status(404).json({
          error: "No data found",
          message: "No data available for the specified criteria",
        });
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((header) => JSON.stringify(row[header] || "")).join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`
      );
      res.send(csvContent);
    } else {
      res.json({
        type,
        generatedAt: new Date().toISOString(),
        totalRecords: data.length,
        data,
      });
    }

    // Log the export
    await logAdminAction(
      req.user.id,
      `EXPORT_${type.toUpperCase()}_REPORT`,
      "report",
      null,
      null,
      { type, format, recordCount: data.length },
      req
    );
  } catch (error) {
    console.error("Report export error:", error);
    res.status(500).json({
      error: "Failed to export report",
      message: "Could not generate the requested report",
    });
  }
});

export default router;
export { logAdminAction };
