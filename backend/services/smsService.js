import twilio from "twilio";

class SMSService {
  constructor() {
    // Initialize Twilio client (or use mock in development)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.log("📱 SMS service running in mock mode");
      this.client = null;
    }
  }

  async sendSMS(to, message) {
    try {
      // In development/demo mode, just log the SMS
      if (!this.client || process.env.NODE_ENV === "development") {
        console.log("📱 SMS SENT (Mock Mode):");
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        return { success: true, sid: `mock_${Date.now()}` };
      }

      const response = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      return { success: true, sid: response.sid };
    } catch (error) {
      console.error("SMS sending error:", error);
      return { success: false, error: error.message };
    }
  }

  // Order confirmation SMS
  async sendOrderConfirmationSMS(phone, orderData) {
    const message = `Hi ${orderData.customerName}! Your order #${orderData.orderNumber} for ₹${orderData.totalAmount} has been confirmed. Track at: ${process.env.MARKETPLACE_URL}/orders/${orderData._id}`;
    return await this.sendSMS(phone, message);
  }

  // Order status update SMS
  async sendOrderStatusSMS(phone, orderData) {
    let message = `Order #${orderData.orderNumber} status: ${orderData.status.toUpperCase()}`;

    if (orderData.trackingNumber) {
      message += ` | Tracking: ${orderData.trackingNumber}`;
    }

    message += ` | Track: ${process.env.MARKETPLACE_URL}/orders/${orderData._id}`;

    return await this.sendSMS(phone, message);
  }

  // Payment confirmation SMS
  async sendPaymentConfirmationSMS(phone, paymentData) {
    const message = `Payment of ₹${paymentData.amount} received successfully. Transaction ID: ${paymentData.transactionId}. Thank you for shopping with CraftMart!`;
    return await this.sendSMS(phone, message);
  }

  // OTP for verification
  async sendOTPSMS(phone, otp) {
    const message = `Your CraftMart verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    return await this.sendSMS(phone, message);
  }

  // Welcome SMS for new customers
  async sendWelcomeSMS(phone, customerName) {
    const message = `Welcome to CraftMart, ${customerName}! Discover unique handcrafted products. Start shopping: ${process.env.MARKETPLACE_URL}`;
    return await this.sendSMS(phone, message);
  }

  // Low stock alert for sellers
  async sendLowStockSMS(phone, productCount) {
    const message = `CraftMart Alert: ${productCount} of your products are running low on stock. Login to your dashboard to update inventory.`;
    return await this.sendSMS(phone, message);
  }

  // Promotional SMS
  async sendPromotionalSMS(phone, customerName, offer) {
    const message = `Hi ${customerName}! ${offer} at CraftMart. Shop now: ${process.env.MARKETPLACE_URL}. Reply STOP to opt out.`;
    return await this.sendSMS(phone, message);
  }
}

export const smsService = new SMSService();
export default smsService;
