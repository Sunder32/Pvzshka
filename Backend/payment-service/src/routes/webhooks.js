import express from 'express';
import yookassaAdapter from '../adapters/yookassa.js';
import { logger } from '../utils/logger.js';
import { getPool } from '../config/database.js';
import { publishEvent } from '../config/kafka.js';

const router = express.Router();

/**
 * YooKassa webhook handler
 */
router.post('/yookassa', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = JSON.parse(req.body.toString());
    
    // Verify signature
    if (!yookassaAdapter.verifyWebhookSignature(payload, signature)) {
      logger.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { event, object } = payload;
    const webhookId = payload.id;
    
    // Check if already processed (idempotency)
    const existingWebhook = await getPool().query(
      'SELECT * FROM webhook_logs WHERE webhook_id = $1',
      [webhookId]
    );
    
    if (existingWebhook.rows.length > 0) {
      logger.info(`Webhook ${webhookId} already processed`);
      return res.json({ status: 'ok' });
    }
    
    // Log webhook
    await getPool().query(
      `INSERT INTO webhook_logs (webhook_id, provider, event_type, payload, signature)
       VALUES ($1, $2, $3, $4, $5)`,
      [webhookId, 'yookassa', event, JSON.stringify(payload), signature]
    );
    
    // Process webhook
    await processYooKassaWebhook(event, object, webhookId);
    
    // Mark as processed
    await getPool().query(
      'UPDATE webhook_logs SET processed = true, processed_at = NOW() WHERE webhook_id = $1',
      [webhookId]
    );
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function processYooKassaWebhook(event, payment, webhookId) {
  try {
    logger.info(`Processing webhook event: ${event}`);
    
    // Find payment in database
    const result = await getPool().query(
      'SELECT * FROM payments WHERE external_id = $1',
      [payment.id]
    );
    
    if (result.rows.length === 0) {
      logger.warn(`Payment not found for external_id: ${payment.id}`);
      return;
    }
    
    const dbPayment = result.rows[0];
    
    switch (event) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(dbPayment, payment);
        break;
        
      case 'payment.canceled':
        await handlePaymentCanceled(dbPayment, payment);
        break;
        
      case 'payment.waiting_for_capture':
        await handlePaymentWaitingForCapture(dbPayment, payment);
        break;
        
      case 'refund.succeeded':
        await handleRefundSucceeded(dbPayment, payment);
        break;
        
      default:
        logger.info(`Unhandled webhook event: ${event}`);
    }
    
  } catch (error) {
    logger.error('Webhook processing error:', error);
    
    // Save error for retry
    await getPool().query(
      `UPDATE webhook_logs 
       SET error_message = $1, retry_count = retry_count + 1 
       WHERE webhook_id = $2`,
      [error.message, webhookId]
    );
    
    throw error;
  }
}

async function handlePaymentSucceeded(dbPayment, yooPayment) {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    
    // Update payment status
    await client.query(
      `UPDATE payments 
       SET status = 'succeeded', captured_at = NOW(), metadata = $1 
       WHERE id = $2`,
      [JSON.stringify(yooPayment), dbPayment.id]
    );
    
    // Update order status
    await client.query(
      `UPDATE orders 
       SET payment_status = 'paid', status = 'processing' 
       WHERE id = $1`,
      [dbPayment.order_id]
    );
    
    // Update transfer statuses
    await client.query(
      `UPDATE payment_transfers 
       SET status = 'transferred', transferred_at = NOW() 
       WHERE payment_id = $1`,
      [dbPayment.id]
    );
    
    await client.query('COMMIT');
    
    // Publish event to Kafka
    await publishEvent('payments', {
      eventType: 'PAYMENT_SUCCEEDED',
      tenantId: dbPayment.tenant_id,
      paymentId: dbPayment.id,
      orderId: dbPayment.order_id,
      amount: dbPayment.amount,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`Payment succeeded: ${dbPayment.id}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentCanceled(dbPayment, yooPayment) {
  await getPool().query(
    `UPDATE payments 
     SET status = 'canceled', metadata = $1 
     WHERE id = $2`,
    [JSON.stringify(yooPayment), dbPayment.id]
  );
  
  await getPool().query(
    `UPDATE orders 
     SET payment_status = 'failed', status = 'cancelled' 
     WHERE id = $1`,
    [dbPayment.order_id]
  );
  
  await publishEvent('payments', {
    eventType: 'PAYMENT_CANCELED',
    tenantId: dbPayment.tenant_id,
    paymentId: dbPayment.id,
    orderId: dbPayment.order_id
  });
  
  logger.info(`Payment canceled: ${dbPayment.id}`);
}

async function handlePaymentWaitingForCapture(dbPayment, yooPayment) {
  await getPool().query(
    `UPDATE payments 
     SET status = 'authorized', authorized_at = NOW(), metadata = $1 
     WHERE id = $2`,
    [JSON.stringify(yooPayment), dbPayment.id]
  );
  
  await getPool().query(
    `UPDATE orders 
     SET payment_status = 'authorized' 
     WHERE id = $1`,
    [dbPayment.order_id]
  );
  
  logger.info(`Payment authorized: ${dbPayment.id}`);
}

async function handleRefundSucceeded(dbPayment, refundData) {
  await getPool().query(
    `UPDATE payments 
     SET status = 'refunded', refunded_at = NOW() 
     WHERE id = $1`,
    [dbPayment.id]
  );
  
  await publishEvent('payments', {
    eventType: 'PAYMENT_REFUNDED',
    tenantId: dbPayment.tenant_id,
    paymentId: dbPayment.id,
    orderId: dbPayment.order_id,
    amount: refundData.amount.value
  });
  
  logger.info(`Refund succeeded: ${dbPayment.id}`);
}

export default router;
