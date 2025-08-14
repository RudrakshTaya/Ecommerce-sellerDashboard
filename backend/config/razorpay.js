import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "demo_razorpay_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "demo_razorpay_secret",
});

// Helper function to create order
export const createRazorpayOrder = async (
  amount,
  currency = "INR",
  receipt = null,
) => {
  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to verify payment signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "demo_razorpay_secret",
      )
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Helper function to fetch payment details
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error("Payment fetch error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to refund payment
export const refundPayment = async (paymentId, amount = null, notes = {}) => {
  try {
    const refundData = {
      notes,
    };

    if (amount) {
      refundData.amount = amount * 100; // Amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error("Payment refund error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to create transfer (for marketplace scenarios)
export const createTransfer = async (paymentId, transfers) => {
  try {
    const transfer = await razorpay.payments.transfer(paymentId, {
      transfers,
    });
    return {
      success: true,
      transfer,
    };
  } catch (error) {
    console.error("Transfer creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default razorpay;
