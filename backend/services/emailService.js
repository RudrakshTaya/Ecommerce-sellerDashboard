import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || "demo@example.com",
        pass: process.env.EMAIL_PASS || "demo_password",
      },
    });

    // Verify connection (in development mode)
    if (process.env.NODE_ENV === "development") {
      this.verifyConnection();
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("📧 Email service is ready");
    } catch (error) {
      console.log("⚠️ Email service not configured properly (using mock mode)");
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      // In development/demo mode, just log the email
      if (
        process.env.NODE_ENV === "development" ||
        process.env.EMAIL_USER === "demo@example.com"
      ) {
        console.log("📧 EMAIL SENT (Mock Mode):");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text || html.substring(0, 100)}...`);
        return { success: true, messageId: `mock_${Date.now()}` };
      }

      const mailOptions = {
        from: `"CraftMart" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Order confirmation email
  async sendOrderConfirmation(customerEmail, orderData) {
    const subject = `Order Confirmation - #${orderData.orderNumber}`;
    const html = this.generateOrderConfirmationHTML(orderData);
    return await this.sendEmail(customerEmail, subject, html);
  }

  // Order status update email
  async sendOrderStatusUpdate(customerEmail, orderData) {
    const subject = `Order Update - #${orderData.orderNumber}`;
    const html = this.generateOrderStatusHTML(orderData);
    return await this.sendEmail(customerEmail, subject, html);
  }

  // Welcome email for new customers
  async sendWelcomeEmail(customerEmail, customerName) {
    const subject = "Welcome to CraftMart!";
    const html = this.generateWelcomeHTML(customerName);
    return await this.sendEmail(customerEmail, subject, html);
  }

  // Low stock alert for sellers
  async sendLowStockAlert(sellerEmail, products) {
    const subject = "Low Stock Alert - CraftMart";
    const html = this.generateLowStockHTML(products);
    return await this.sendEmail(sellerEmail, subject, html);
  }

  // Payment confirmation email
  async sendPaymentConfirmation(customerEmail, paymentData) {
    const subject = `Payment Confirmation - ${paymentData.transactionId}`;
    const html = this.generatePaymentConfirmationHTML(paymentData);
    return await this.sendEmail(customerEmail, subject, html);
  }

  // Generate HTML templates
  generateOrderConfirmationHTML(orderData) {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dd9658 0%, #c46030 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Thank you for your order, ${orderData.customerName}!</h2>
          <p>Your order #${orderData.orderNumber} has been confirmed and is being prepared.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dd9658; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
            <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery || "5-7 business days"}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dd9658; margin-top: 0;">Items Ordered</h3>
            ${orderData.items
              .map(
                (item) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>${item.productName}</strong></p>
                <p>Quantity: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}</p>
              </div>
            `,
              )
              .join("")}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.MARKETPLACE_URL}/orders/${orderData._id}" 
               style="background: #dd9658; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track Your Order
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 CraftMart. All rights reserved.</p>
          <p>Questions? Contact us at support@craftmart.com</p>
        </div>
      </div>
    `;
  }

  generateOrderStatusHTML(orderData) {
    const statusColors = {
      confirmed: "#28a745",
      processing: "#ffc107",
      shipped: "#17a2b8",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };

    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: ${statusColors[orderData.status] || "#dd9658"}; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Update</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Order #${orderData.orderNumber}</h2>
          <p>Your order status has been updated to: <strong style="color: ${statusColors[orderData.status] || "#dd9658"};">${orderData.status.toUpperCase()}</strong></p>
          
          ${
            orderData.trackingNumber
              ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dd9658; margin-top: 0;">Tracking Information</h3>
              <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
            </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.MARKETPLACE_URL}/orders/${orderData._id}" 
               style="background: #dd9658; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 CraftMart. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  generateWelcomeHTML(customerName) {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dd9658 0%, #c46030 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to CraftMart!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${customerName}!</h2>
          <p>Thank you for joining CraftMart, your one-stop destination for handcrafted artisan products.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dd9658; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666;">
              <li>Explore our curated collection of handmade products</li>
              <li>Follow your favorite artisans</li>
              <li>Save products to your wishlist</li>
              <li>Enjoy secure checkout and fast delivery</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.MARKETPLACE_URL}" 
               style="background: #dd9658; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Shopping
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 CraftMart. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  generateLowStockHTML(products) {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #dc3545; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Low Stock Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Attention Required!</h2>
          <p>The following products are running low on stock:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${products
              .map(
                (product) => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                <span><strong>${product.name}</strong></span>
                <span style="color: #dc3545;">${product.stock} remaining</span>
              </div>
            `,
              )
              .join("")}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/products" 
               style="background: #dd9658; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Inventory
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 CraftMart. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  generatePaymentConfirmationHTML(paymentData) {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #28a745; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dd9658; margin-top: 0;">Payment Details</h3>
            <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
            <p><strong>Amount:</strong> ₹${paymentData.amount}</p>
            <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 CraftMart. All rights reserved.</p>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
