import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

class YooKassaAdapter {
  constructor() {
    this.shopId = process.env.YOOKASSA_SHOP_ID;
    this.secretKey = process.env.YOOKASSA_SECRET_KEY;
    this.apiUrl = 'https://api.yookassa.ru/v3';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      auth: {
        username: this.shopId,
        password: this.secretKey
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create payment with split transfers
   */
  async createPayment(order, transfers) {
    try {
      const idempotenceKey = `order_${order.id}_${Date.now()}`;
      
      const payload = {
        amount: {
          value: order.total_amount.toFixed(2),
          currency: 'RUB'
        },
        capture: false, // Authorize first, capture later
        description: `Заказ #${order.order_number}`,
        metadata: {
          order_id: order.id,
          tenant_id: order.tenant_id
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.WEB_APP_URL}/orders/${order.id}/success`
        }
      };

      // Add split transfers if marketplace mode
      if (transfers && transfers.length > 0) {
        payload.transfers = transfers.map(transfer => ({
          account_id: transfer.vendorAccountId,
          amount: {
            value: transfer.amount.toFixed(2),
            currency: 'RUB'
          },
          platform_fee_amount: {
            value: transfer.platformFee.toFixed(2),
            currency: 'RUB'
          }
        }));
      }

      const response = await this.client.post('/payments', payload, {
        headers: {
          'Idempotence-Key': idempotenceKey
        }
      });

      logger.info('YooKassa payment created:', response.data.id);
      
      return {
        id: response.data.id,
        status: response.data.status,
        confirmationUrl: response.data.confirmation?.confirmation_url,
        paid: response.data.paid,
        amount: response.data.amount.value,
        metadata: response.data.metadata
      };
    } catch (error) {
      logger.error('YooKassa create payment error:', error.response?.data || error.message);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Capture authorized payment
   */
  async capturePayment(paymentId, amount) {
    try {
      const response = await this.client.post(`/payments/${paymentId}/capture`, {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        }
      }, {
        headers: {
          'Idempotence-Key': `capture_${paymentId}_${Date.now()}`
        }
      });

      logger.info('YooKassa payment captured:', paymentId);
      
      return {
        id: response.data.id,
        status: response.data.status,
        paid: response.data.paid
      };
    } catch (error) {
      logger.error('YooKassa capture payment error:', error.response?.data || error.message);
      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId) {
    try {
      const response = await this.client.post(`/payments/${paymentId}/cancel`, {}, {
        headers: {
          'Idempotence-Key': `cancel_${paymentId}_${Date.now()}`
        }
      });

      logger.info('YooKassa payment cancelled:', paymentId);
      
      return {
        id: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      logger.error('YooKassa cancel payment error:', error.response?.data || error.message);
      throw new Error('Failed to cancel payment');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, amount, reason) {
    try {
      const response = await this.client.post('/refunds', {
        payment_id: paymentId,
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        description: reason || 'Возврат средств'
      }, {
        headers: {
          'Idempotence-Key': `refund_${paymentId}_${Date.now()}`
        }
      });

      logger.info('YooKassa refund created:', response.data.id);
      
      return {
        id: response.data.id,
        status: response.data.status,
        amount: response.data.amount.value
      };
    } catch (error) {
      logger.error('YooKassa refund error:', error.response?.data || error.message);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Get payment info
   */
  async getPayment(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('YooKassa get payment error:', error.response?.data || error.message);
      throw new Error('Failed to get payment');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Calculate split transfers for vendors
   */
  calculateTransfers(order) {
    const itemsByVendor = {};
    
    // Group items by vendor
    order.items.forEach(item => {
      if (!itemsByVendor[item.vendor_id]) {
        itemsByVendor[item.vendor_id] = [];
      }
      itemsByVendor[item.vendor_id].push(item);
    });

    // Calculate transfers
    const transfers = [];
    const commissionRate = order.tenant.commission_rate || 0.10; // 10% default

    Object.entries(itemsByVendor).forEach(([vendorId, items]) => {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const platformFee = subtotal * commissionRate;
      const vendorPayout = subtotal - platformFee;

      transfers.push({
        vendorId,
        vendorAccountId: items[0].vendor.yookassa_account_id,
        amount: vendorPayout,
        platformFee: platformFee,
        items: items.map(i => i.id)
      });
    });

    return transfers;
  }
}

export default new YooKassaAdapter();
