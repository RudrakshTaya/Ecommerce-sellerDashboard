import api from './api';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderDetails: {
    id: string;
    items: number;
    totalAmount: number;
  };
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  // Create payment order
  async createPaymentOrder(orderId: string, amount: number, currency = 'INR'): Promise<PaymentOrder> {
    try {
      const response = await api.post('/payments/create-order', {
        orderId,
        amount,
        currency
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Create payment order error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  }

  // Verify payment
  async verifyPayment(paymentData: PaymentVerification): Promise<any> {
    try {
      const response = await api.post('/payments/verify-payment', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10): Promise<{
    payments: Payment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const response = await api.get('/payments/history', {
        params: { page, limit }
      });

      return {
        payments: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Get payment history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get payment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }

  // Initialize Razorpay payment
  initializeRazorpay(options: {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    image?: string;
    handler: (response: any) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
  }) {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Razorpay can only be initialized in browser environment'));
        return;
      }

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          this.createRazorpayInstance(options, resolve, reject);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay SDK'));
        };
        document.head.appendChild(script);
      } else {
        this.createRazorpayInstance(options, resolve, reject);
      }
    });
  }

  private createRazorpayInstance(options: any, resolve: any, reject: any) {
    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      resolve(rzp);
    } catch (error) {
      reject(error);
    }
  }

  // Process payment with error handling
  async processPayment(orderDetails: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerContact: string;
  }) {
    try {
      // Create payment order
      const paymentOrder = await this.createPaymentOrder(
        orderDetails.orderId,
        orderDetails.amount
      );

      // Prepare Razorpay options
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        amount: paymentOrder.amount * 100, // Amount in paise
        currency: paymentOrder.currency,
        order_id: paymentOrder.orderId,
        name: 'CraftMart',
        description: 'Payment for your order',
        image: '/logo.png',
        handler: async (response: any) => {
          try {
            await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            return { success: true };
          } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
          }
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerContact,
        },
        theme: {
          color: '#dd9658', // Craft theme color
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          },
        },
      };

      // Initialize Razorpay
      await this.initializeRazorpay(razorpayOptions);

      return { success: true, paymentOrder };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      throw new Error(error.message || 'Payment processing failed');
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
