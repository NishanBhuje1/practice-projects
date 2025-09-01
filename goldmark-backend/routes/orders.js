import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `GM${timestamp}${random}`;
};

// Helper function to build order with items
const buildOrderWithItems = async (orderRows) => {
  if (orderRows.length === 0) return [];

  const orderIds = [...new Set(orderRows.map(row => row.id))];
  
  // Get order items
  const itemsResult = await query(`
    SELECT 
      oi.*,
      p.name as current_product_name,
      p.slug as product_slug,
      pi.image_url
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
    WHERE oi.order_id = ANY($1)
    ORDER BY oi.created_at
  `, [orderIds]);

  // Group items by order
  const itemsByOrder = {};
  itemsResult.rows.forEach(item => {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      currentProductName: item.current_product_name,
      productSlug: item.product_slug,
      imageUrl: item.image_url,
      price: parseFloat(item.product_price),
      quantity: item.quantity,
      totalPrice: parseFloat(item.total_price),
      selectedVariants: {
        size: item.selected_size,
        material: item.selected_material,
        color: item.selected_color
      }
    });
  });

  // Build final order objects
  return orderRows.map(order => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    subtotal: parseFloat(order.subtotal),
    taxAmount: parseFloat(order.tax_amount),
    shippingAmount: parseFloat(order.shipping_amount),
    totalAmount: parseFloat(order.total_amount),
    currency: order.currency,
    shippingAddress: {
      firstName: order.shipping_first_name,
      lastName: order.shipping_last_name,
      street: order.shipping_street,
      city: order.shipping_city,
      state: order.shipping_state,
      zipCode: order.shipping_zip_code,
      country: order.shipping_country
    },
    trackingNumber: order.tracking_number,
    createdAt: order.created_at,
    shippedAt: order.shipped_at,
    deliveredAt: order.delivered_at,
    items: itemsByOrder[order.id] || []
  }));
};

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderSchema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().uuid().required(),
          quantity: Joi.number().integer().min(1).required(),
          selectedVariants: Joi.object({
            size: Joi.string().optional(),
            material: Joi.string().optional(),
            color: Joi.string().optional()
          }).optional()
        })
      ).min(1).required(),
      shippingAddress: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      billingAddress: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
      }).optional()
    });

    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { items, shippingAddress, billingAddress } = value;

    // Create order with transaction
    const result = await transaction(async (client) => {
      // Get product details and validate stock
      const productIds = items.map(item => item.productId);
      const productsResult = await client.query(`
        SELECT id, name, price, stock_quantity
        FROM products 
        WHERE id = ANY($1) AND is_active = true
      `, [productIds]);

      if (productsResult.rows.length !== items.length) {
        throw new Error('Some products are not available');
      }

      const productsMap = {};
      productsResult.rows.forEach(p => {
        productsMap[p.id] = p;
      });

      // Validate stock and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = productsMap[item.productId];
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
          selectedVariants: item.selectedVariants || {}
        });

        // Update stock
        await client.query(`
          UPDATE products 
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `, [item.quantity, item.productId]);
      }

      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = subtotal > 100 ? 0 : 15; // Free shipping over $100
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Create order
      const orderNumber = generateOrderNumber();
      const orderResult = await client.query(`
        INSERT INTO orders (
          user_id, order_number, subtotal, tax_amount, shipping_amount, total_amount,
          shipping_first_name, shipping_last_name, shipping_street, shipping_city,
          shipping_state, shipping_zip_code, shipping_country,
          billing_first_name, billing_last_name, billing_street, billing_city,
          billing_state, billing_zip_code, billing_country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        req.user.id, orderNumber, subtotal, taxAmount, shippingAmount, totalAmount,
        shippingAddress.firstName, shippingAddress.lastName, shippingAddress.street,
        shippingAddress.city, shippingAddress.state, shippingAddress.zipCode, shippingAddress.country,
        (billingAddress || shippingAddress).firstName, (billingAddress || shippingAddress).lastName,
        (billingAddress || shippingAddress).street, (billingAddress || shippingAddress).city,
        (billingAddress || shippingAddress).state, (billingAddress || shippingAddress).zipCode,
        (billingAddress || shippingAddress).country
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of orderItems) {
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, product_price, quantity,
            selected_size, selected_material, selected_color, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          order.id, item.productId, item.productName, item.productPrice, item.quantity,
          item.selectedVariants.size, item.selectedVariants.material, 
          item.selectedVariants.color, item.totalPrice
        ]);
      }

      // Clear user's cart
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

      return order;
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderNumber: result.order_number,
      orderId: result.id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message || 'Could not create order'
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get orders count
    const countResult = await query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1',
      [req.user.id]
    );

    const totalOrders = parseInt(countResult.rows[0].count);

    // Get orders
    const ordersResult = await query(`
      SELECT * FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    const orders = await buildOrderWithItems(ordersResult.rows);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'Could not retrieve your orders'
    });
  }
});

// Get single order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await query(`
      SELECT * FROM orders 
      WHERE id = $1 AND (user_id = $2 OR $3 = true)
    `, [id, req.user.id, req.user.is_admin]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order could not be found'
      });
    }

    const orders = await buildOrderWithItems(orderResult.rows);
    const order = orders[0];

    res.json({ order });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: 'Could not retrieve order details'
    });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: ' + allowedStatuses.join(', ')
      });
    }

    const updates = ['status = $2'];
    const values = [id, status];
    let paramIndex = 3;

    // Set shipped_at timestamp when status changes to shipped
    if (status === 'shipped') {
      updates.push(`shipped_at = CURRENT_TIMESTAMP`);
      if (trackingNumber) {
        updates.push(`tracking_number = ${paramIndex++}`);
        values.push(trackingNumber);
      }
    }

    // Set delivered_at timestamp when status changes to delivered
    if (status === 'delivered') {
      updates.push(`delivered_at = CURRENT_TIMESTAMP`);
    }

    const result = await query(`
      UPDATE orders 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The specified order does not exist'
      });
    }

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: 'Could not update order status'
    });
  }
});

// Get all orders (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      status, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      order = 'desc'
    } = req.query;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`o.status = ${paramIndex++}`);
      values.push(status);
    }

    if (search) {
      conditions.push(`(
        o.order_number ILIKE ${paramIndex++} OR 
        CONCAT(o.shipping_first_name, ' ', o.shipping_last_name) ILIKE ${paramIndex++}
      )`);
      values.push(`%${search}%`, `%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) FROM orders o ${whereClause}
    `, values);

    const totalOrders = parseInt(countResult.rows[0].count);
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'total_amount', 'status', 'order_number'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get orders with user info
    const ordersResult = await query(`
      SELECT 
        o.*,
        u.email as user_email,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.${sortField} ${sortOrder}
      LIMIT ${paramIndex++} OFFSET ${paramIndex++}
    `, [...values, parseInt(limit), offset]);

    const orders = await buildOrderWithItems(ordersResult.rows);

    // Add user info to orders
    orders.forEach((order, index) => {
      order.userEmail = ordersResult.rows[index].user_email;
      order.userName = ordersResult.rows[index].user_name;
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: 'Could not retrieve orders'
    });
  }
});

// Get order analytics (Admin only)
router.get('/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get overall stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Get recent orders
    const recentOrdersResult = await query(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.status, o.created_at,
        CONCAT(o.shipping_first_name, ' ', o.shipping_last_name) as customer_name
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Get top products
    const topProductsResult = await query(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    const stats = statsResult.rows[0];
    
    res.json({
      stats: {
        totalOrders: parseInt(stats.total_orders),
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        averageOrderValue: parseFloat(stats.average_order_value) || 0,
        pendingOrders: parseInt(stats.pending_orders),
        processingOrders: parseInt(stats.processing_orders),
        shippedOrders: parseInt(stats.shipped_orders),
        deliveredOrders: parseInt(stats.delivered_orders),
        cancelledOrders: parseInt(stats.cancelled_orders)
      },
      recentOrders: recentOrdersResult.rows.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: parseFloat(order.total_amount),
        status: order.status,
        customerName: order.customer_name,
        createdAt: order.created_at
      })),
      topProducts: topProductsResult.rows.map(product => ({
        name: product.product_name,
        quantity: parseInt(product.total_quantity),
        revenue: parseFloat(product.total_revenue)
      }))
    });

  } catch (error) {
    console.error('Order analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Could not retrieve order analytics'
    });
  }
});

// Cancel order (by user)
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await transaction(async (client) => {
      // Get order
      const orderResult = await client.query(`
        SELECT * FROM orders 
        WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'processing')
      `, [id, req.user.id]);

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found or cannot be cancelled');
      }

      // Get order items to restore stock
      const itemsResult = await client.query(`
        SELECT product_id, quantity FROM order_items WHERE order_id = $1
      `, [id]);

      // Restore stock
      for (const item of itemsResult.rows) {
        await client.query(`
          UPDATE products 
          SET stock_quantity = stock_quantity + $1
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      // Update order status
      await client.query(`
        UPDATE orders 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      return true;
    });

    res.json({
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message || 'Could not cancel order'
    });
  }
});

export default router;