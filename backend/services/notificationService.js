import { emailService } from './emailService.js';
import { smsService } from './smsService.js';

class NotificationService {
  constructor() {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // Send order confirmation notifications
  async sendOrderConfirmation(customerData, orderData) {
    const results = {};

    try {
      // Send email confirmation
      if (customerData.email) {
        results.email = await this.emailService.sendOrderConfirmation(
          customerData.email,
          { ...orderData, customerName: customerData.name }
        );
      }

      // Send SMS confirmation
      if (customerData.phone) {
        results.sms = await this.smsService.sendOrderConfirmationSMS(
          customerData.phone,
          { ...orderData, customerName: customerData.name }
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Order confirmation notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Send order status update notifications
  async sendOrderStatusUpdate(customerData, orderData) {
    const results = {};

    try {
      // Send email update
      if (customerData.email) {
        results.email = await this.emailService.sendOrderStatusUpdate(
          customerData.email,
          orderData
        );
      }

      // Send SMS update
      if (customerData.phone) {
        results.sms = await this.smsService.sendOrderStatusSMS(
          customerData.phone,
          orderData
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Order status notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Send welcome notifications for new customers
  async sendWelcomeNotifications(customerData) {
    const results = {};

    try {
      // Send welcome email
      if (customerData.email) {
        results.email = await this.emailService.sendWelcomeEmail(
          customerData.email,
          customerData.name
        );
      }

      // Send welcome SMS
      if (customerData.phone) {
        results.sms = await this.smsService.sendWelcomeSMS(
          customerData.phone,
          customerData.name
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Welcome notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Send payment confirmation notifications
  async sendPaymentConfirmation(customerData, paymentData) {
    const results = {};

    try {
      // Send payment confirmation email
      if (customerData.email) {
        results.email = await this.emailService.sendPaymentConfirmation(
          customerData.email,
          paymentData
        );
      }

      // Send payment confirmation SMS
      if (customerData.phone) {
        results.sms = await this.smsService.sendPaymentConfirmationSMS(
          customerData.phone,
          paymentData
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Payment confirmation notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Send low stock alerts to sellers
  async sendLowStockAlert(sellerData, products) {
    const results = {};

    try {
      // Send low stock email
      if (sellerData.email) {
        results.email = await this.emailService.sendLowStockAlert(
          sellerData.email,
          products
        );
      }

      // Send low stock SMS
      if (sellerData.contactNumber) {
        results.sms = await this.smsService.sendLowStockSMS(
          sellerData.contactNumber,
          products.length
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Low stock alert notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Send OTP for verification
  async sendOTP(phone, otp) {
    try {
      const result = await this.smsService.sendOTPSMS(phone, otp);
      return result;
    } catch (error) {
      console.error('OTP notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send promotional notifications
  async sendPromotionalNotification(customerData, offer) {
    const results = {};

    try {
      // Send promotional SMS
      if (customerData.phone && customerData.smsConsent) {
        results.sms = await this.smsService.sendPromotionalSMS(
          customerData.phone,
          customerData.name,
          offer
        );
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Promotional notification error:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  // Bulk notification for multiple customers
  async sendBulkNotifications(customers, type, data) {
    const results = [];
    const errors = [];

    for (const customer of customers) {
      try {
        let result;
        
        switch (type) {
          case 'promotional':
            result = await this.sendPromotionalNotification(customer, data);
            break;
          case 'welcome':
            result = await this.sendWelcomeNotifications(customer);
            break;
          default:
            throw new Error(`Unknown notification type: ${type}`);
        }

        results.push({
          customerId: customer._id,
          result
        });
      } catch (error) {
        errors.push({
          customerId: customer._id,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      processed: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
