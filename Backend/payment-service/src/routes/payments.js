import express from 'express';
import yookassaAdapter from '../adapters/yookassa.js';
import { logger } from '../utils/logger.js';
import { getPool } from '../config/database.js';

const router = express.Router();

/**
 * Create payment
 */
router.post('/', async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const tenantId = req.tenantId;
    
    // Get order details
    const orderResult = await getPool().query(
      `SELECT o.*, t.commission_rate, t.config 
       FROM orders o 
       JOIN tenants t ON o.tenant_id = t.id 
       WHERE o.id = $1 AND o.tenant_id = $2`,
      [orderId, tenantId]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items with vendor info
    const itemsResult = await getPool().query(
      `SELECT oi.*, u.metadata->>'yookassa_account_id' as yookassa_account_id
       FROM order_items oi
       JOIN users u ON oi.vendor_id = u.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    order.items = itemsResult.rows;
    order.tenant = { commission_rate: order.commission_rate };
    
    // Calculate split transfers
    const transfers = yookassaAdapter.calculateTransfers(order);
    
    // Create payment
    const payment = await yookassaAdapter.createPayment(order, transfers);
    
    // Save payment to database
    const paymentResult = await getPool().query(
      `INSERT INTO payments (tenant_id, order_id, provider, external_id, amount, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenantId,
        orderId,
        'yookassa',
        payment.id,
        order.total_amount,
        payment.status,
        JSON.stringify({ confirmationUrl: payment.confirmationUrl })
      ]
    );
    
    // Save transfers
    for (const transfer of transfers) {
      await getPool().query(
        `INSERT INTO payment_transfers (tenant_id, payment_id, vendor_id, amount, platform_fee, vendor_payout)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          tenantId,
          paymentResult.rows[0].id,
          transfer.vendorId,
          transfer.amount + transfer.platformFee,
          transfer.platformFee,
          transfer.amount
        ]
      );
    }
    
    logger.info(`Payment created for order ${orderId}:`, payment.id);
    
    res.json({
      paymentId: paymentResult.rows[0].id,
      externalId: payment.id,
      confirmationUrl: payment.confirmationUrl,
      status: payment.status
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Get payment status
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const result = await getPool().query(
      'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    next(error);
  }
});

/**
 * Capture payment
 */
router.post('/:id/capture', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const result = await getPool().query(
      'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = result.rows[0];
    
    // Capture payment via YooKassa
    const captured = await yookassaAdapter.capturePayment(
      payment.external_id,
      payment.amount
    );
    
    // Update payment status
    await getPool().query(
      `UPDATE payments 
       SET status = $1, captured_at = NOW() 
       WHERE id = $2`,
      [captured.status, id]
    );
    
    // Update order status
    await getPool().query(
      `UPDATE orders 
       SET payment_status = 'paid', status = 'processing' 
       WHERE id = $1`,
      [payment.order_id]
    );
    
    logger.info(`Payment captured: ${id}`);
    
    res.json({ success: true, status: captured.status });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Refund payment
 */
router.post('/:id/refund', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const tenantId = req.tenantId;
    
    const result = await getPool().query(
      'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = result.rows[0];
    
    // Create refund via YooKassa
    const refund = await yookassaAdapter.refundPayment(
      payment.external_id,
      amount || payment.amount,
      reason
    );
    
    // Update payment status
    await getPool().query(
      `UPDATE payments 
       SET status = 'refunded', refunded_at = NOW() 
       WHERE id = $1`,
      [id]
    );
    
    // Update order status
    await getPool().query(
      `UPDATE orders 
       SET payment_status = 'refunded', status = 'refunded' 
       WHERE id = $1`,
      [payment.order_id]
    );
    
    logger.info(`Payment refunded: ${id}`);
    
    res.json({ success: true, refundId: refund.id });
    
  } catch (error) {
    next(error);
  }
});

export default router;
