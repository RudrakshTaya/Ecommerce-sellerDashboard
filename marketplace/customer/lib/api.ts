import axios, { AxiosResponse } from 'axios';
import {
  Product,
  Customer,
  Order,
  Seller,
  Category,
  Review,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  Address,
} from './types';

const API_BASE_URL = 'http://localhost:5050/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customer');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/customer-auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/customer-auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/customer-auth/logout');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
  },

  getCurrentCustomer: async (): Promise<Customer> => {
    const response: AxiosResponse<{success: boolean, customer: Customer}> = await api.get('/customer-auth/me');
    return response.data.customer;
  },

  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    const response: AxiosResponse<{success: boolean, customer: Customer}> = await api.put('/customer-auth/profile', data);
    return response.data.customer;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: SearchParams): Promise<PaginatedResponse<Product>> => {
    const response: AxiosResponse<PaginatedResponse<Product>> = await api.get('/public/products', {
      params,
    });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response: AxiosResponse<ApiResponse<Product>> = await api.get(`/public/products/${id}`);
    return response.data.data!;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response: AxiosResponse<ApiResponse<Product[]>> = await api.get('/public/products/featured');
    return response.data.data!;
  },

  getTrendingProducts: async (): Promise<Product[]> => {
    const response: AxiosResponse<ApiResponse<Product[]>> = await api.get('/public/products/trending');
    return response.data.data!;
  },

  getProductsByCategory: async (category: string, params?: SearchParams): Promise<PaginatedResponse<Product>> => {
    const response: AxiosResponse<PaginatedResponse<Product>> = await api.get(`/public/products/category/${category}`, {
      params,
    });
    return response.data;
  },

  getProductsBySeller: async (sellerId: string, params?: SearchParams): Promise<PaginatedResponse<Product>> => {
    const response: AxiosResponse<PaginatedResponse<Product>> = await api.get(`/public/products/seller/${sellerId}`, {
      params,
    });
    return response.data;
  },

  searchProducts: async (query: string, params?: SearchParams): Promise<PaginatedResponse<Product>> => {
    const response: AxiosResponse<PaginatedResponse<Product>> = await api.get('/public/products/search', {
      params: { query, ...params },
    });
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getCategories: async (): Promise<Category[]> => {
    const response: AxiosResponse<ApiResponse<Category[]>> = await api.get('/public/categories');
    return response.data.data!;
  },

  getCategory: async (slug: string): Promise<Category> => {
    const response: AxiosResponse<ApiResponse<Category>> = await api.get(`/public/categories/${slug}`);
    return response.data.data!;
  },
};

// Sellers API
export const sellersAPI = {
  getSellers: async (): Promise<Seller[]> => {
    const response: AxiosResponse<ApiResponse<Seller[]>> = await api.get('/public/sellers');
    return response.data.data!;
  },

  getSeller: async (id: string): Promise<Seller> => {
    const response: AxiosResponse<ApiResponse<Seller>> = await api.get(`/public/sellers/${id}`);
    return response.data.data!;
  },

  getFeaturedSellers: async (): Promise<Seller[]> => {
    const response: AxiosResponse<ApiResponse<Seller[]>> = await api.get('/public/sellers/featured');
    return response.data.data!;
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
  }): Promise<Order> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.post('/customer-orders', orderData);
    return response.data.data!;
  },

  getOrders: async (): Promise<Order[]> => {
    const response: AxiosResponse<ApiResponse<Order[]>> = await api.get('/customer-orders');
    return response.data.data!;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.get(`/customer-orders/${id}`);
    return response.data.data!;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const response: AxiosResponse<ApiResponse<Order>> = await api.put(`/customer-orders/${id}/cancel`);
    return response.data.data!;
  },

  trackOrder: async (id: string): Promise<{ status: string; tracking?: any }> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/customer-orders/${id}/tracking`);
    return response.data.data!;
  },
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response: AxiosResponse<ApiResponse<Review[]>> = await api.get(`/public/products/${productId}/reviews`);
    return response.data.data!;
  },

  createReview: async (reviewData: {
    productId: string;
    rating: number;
    comment: string;
    images?: string[];
  }): Promise<Review> => {
    const response: AxiosResponse<ApiResponse<Review>> = await api.post('/reviews', reviewData);
    return response.data.data!;
  },

  updateReview: async (id: string, reviewData: Partial<Review>): Promise<Review> => {
    const response: AxiosResponse<ApiResponse<Review>> = await api.put(`/reviews/${id}`, reviewData);
    return response.data.data!;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

// Addresses API
export const addressesAPI = {
  getAddresses: async (): Promise<Address[]> => {
    const response: AxiosResponse<ApiResponse<Address[]>> = await api.get('/customer-auth/addresses');
    return response.data.data!;
  },

  addAddress: async (address: Omit<Address, '_id'>): Promise<Address> => {
    const response: AxiosResponse<ApiResponse<Address>> = await api.post('/customer-auth/addresses', address);
    return response.data.data!;
  },

  updateAddress: async (id: string, address: Partial<Address>): Promise<Address> => {
    const response: AxiosResponse<ApiResponse<Address>> = await api.put(`/customer-auth/addresses/${id}`, address);
    return response.data.data!;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/customer-auth/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<Address> => {
    const response: AxiosResponse<ApiResponse<Address>> = await api.put(`/customer-auth/addresses/${id}/default`);
    return response.data.data!;
  },
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: async (): Promise<Product[]> => {
    const response: AxiosResponse<ApiResponse<Product[]>> = await api.get('/customer-auth/wishlist');
    return response.data.data!;
  },

  addToWishlist: async (productId: string): Promise<void> => {
    await api.post('/customer-auth/wishlist', { productId });
  },

  removeFromWishlist: async (productId: string): Promise<void> => {
    await api.delete(`/customer-auth/wishlist/${productId}`);
  },
};

export default api;
