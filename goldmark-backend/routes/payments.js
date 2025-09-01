import express from 'express';
import Stripe from 'stripe';
import Joi from 'joi';
import { query, transaction } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const paymentSchema = Joi.object({
      orderId: Joi.string().uuid().required(),
      paymentMethodId: Joi.string().optional()
    });

    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { orderId, paymentMethodId } = value;

    // Get order details
    const orderResult = await query(`
      SELECT * FROM orders 
      WHERE id = $1 AND user_id = $2 AND payment_status = 'pending'
    `, [orderId, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or already paid'
      });
    }

    const order = orderResult.rows[0];

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: !!paymentMethodId,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        userId: req.user.id
      }
    });

    // Update order with payment intent ID
    await query(`
      UPDATE orders 
      SET stripe_payment_intent_id = $1, payment_method = 'stripe'
      WHERE id = $2
    `, [paymentIntent.id, orderId]);

    res.json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Payment processing failed',
      message: 'Could not create payment intent'
    });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const confirmSchema = Joi.object({
      paymentIntentId: Joi.string().required()
    });

    const { error, value } = confirmSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { paymentIntentId } = value;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        error: 'Payment intent not found',
        message: 'Could not find payment intent'
      });
    }

    // Get order from database
    const orderResult = await query(`
      SELECT * FROM orders 
      WHERE stripe_payment_intent_id = $1 AND user_id = $2
    `, [paymentIntentId, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Could not find associated order'
      });
    }

    const order = orderResult.rows[0];

    // Handle payment status
    let paymentStatus = 'pending';
    let orderStatus = order.status;

    switch (paymentIntent.status) {
      case 'succeeded':
        paymentStatus = 'paid';
        orderStatus = 'processing';
        break;
      case 'requires_action':
      case 'requires_source_action':
        // Payment requires additional action (3D Secure, etc.)
        return res.json({
          requiresAction: true,
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status
          }
        });
      case 'requires_payment_method':
        paymentStatus = 'failed';
        break;
      case 'canceled':
        paymentStatus = 'failed';
        break;
    }

    // Update order payment status
    await query(`
      UPDATE orders 
      SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [paymentStatus, orderStatus, order.id]);

    res.json({
      success: paymentStatus === 'paid',
      paymentStatus,
      orderStatus,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Payment confirmation failed',
      message: 'Could not confirm payment'
    });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update order status
        await query(`
          UPDATE orders 
          SET payment_status = 'paid', status = 'processing', updated_at = CURRENT_TIMESTAMP
          WHERE stripe_payment_intent_id = $1
        `, [paymentIntent.id]);

        console.log('Payment succeeded for payment intent:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        
        // Update order status
        await query(`
          UPDATE orders 
          SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE stripe_payment_intent_id = $1
        `, [failedPaymentIntent.id]);

        console.log('Payment failed for payment intent:', failedPaymentIntent.id);
        break;

      case 'charge.dispute.created':
        const dispute = event.data.object;
        console.log('Chargeback created:', dispute.id);
        // Handle chargeback logic here
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({error: 'Webhook processing failed'});
  }
});

// Get payment methods for user
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    // In a real app, you'd store customer ID in the user record
    // For now, we'll just return empty array since we don't store payment methods
    res.json({
      paymentMethods: []
    });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment methods',
      message: 'Could not retrieve payment methods'
    });
  }
});

// Refund payment (Admin only)
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.is_admin) {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'Only administrators can process refunds'
      });
    }

    const refundSchema = Joi.object({
      orderId: Joi.string().uuid().required(),
      amount: Joi.number().positive().optional(),
      reason: Joi.string().optional()
    });

    const { error, value } = refundSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { orderId, amount, reason } = value;

    // Get order details
    const orderResult = await query(`
      SELECT * FROM orders 
      WHERE id = $1 AND payment_status = 'paid'
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order not found or not eligible for refund'
      });
    }

    const order = orderResult.rows[0];

    // Create refund with Stripe
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.total_amount * 100);
    
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      amount: refundAmount,
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        processedBy: req.user.id
      }
    });

    // Update order status
    const newPaymentStatus = refund.amount === Math.round(order.total_amount * 100) ? 'refunded' : 'partially_refunded';
    
    await transaction(async (client) => {
      // Update order
      await client.query(`
        UPDATE orders 
        SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newPaymentStatus, orderId]);

      // If full refund, restore inventory
      if (newPaymentStatus === 'refunded') {
        const itemsResult = await client.query(`
          SELECT product_id, quantity FROM order_items WHERE order_id = $1
        `, [orderId]);

        for (const item of itemsResult.rows) {
          await client.query(`
            UPDATE products 
            SET stock_quantity = stock_quantity + $1
            WHERE id = $2
          `, [item.quantity, item.product_id]);
        }
      }
    });

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    
    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        error: 'Stripe error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Refund processing failed',
      message: 'Could not process refund'
    });
  }
});

// Get payment history for order
router.get('/order/:orderId/history', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order belongs to user (or user is admin)
    const orderResult = await query(`
      SELECT * FROM orders 
      WHERE id = $1 AND (user_id = $2 OR $3 = true)
    `, [orderId, req.user.id, req.user.is_admin]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'The requested order could not be found'
      });
    }

    const order = orderResult.rows[0];

    let paymentHistory = [];

    // Get payment intent details from Stripe if exists
    if (order.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        
        paymentHistory.push({
          type: 'payment',
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          created: new Date(paymentIntent.created * 1000)
        });

        // Get refunds if any
        const refunds = await stripe.refunds.list({
          payment_intent: order.stripe_payment_intent_id
        });

        refunds.data.forEach(refund => {
          paymentHistory.push({
            type: 'refund',
            status: refund.status,
            amount: refund.amount / 100,
            currency: refund.currency,
            reason: refund.reason,
            created: new Date(refund.created * 1000)
          });
        });

      } catch (stripeError) {
        console.error('Error fetching Stripe data:', stripeError);
      }
    }

    res.json({
      orderId,
      orderNumber: order.order_number,
      paymentHistory: paymentHistory.sort((a, b) => new Date(a.created) - new Date(b.created))
    });

  } catch (error) {
    console.error('Payment history fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: 'Could not retrieve payment history'
    });
  }
});

export default router;