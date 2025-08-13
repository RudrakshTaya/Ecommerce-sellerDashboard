import axios from 'axios'
import type { ApiResponse, Product, Seller, SearchFilters, SearchResponse } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export class ProductsApi {
  // Get all public products for marketplace
  static async getPublicProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sort?: string
    filters?: SearchFilters
  }): Promise<SearchResponse> {
    try {
      const response = await apiClient.get('/public/products', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching public products:', error)
      throw error
    }
  }

  // Get single product by ID
  static async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get(`/public/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string, params?: {
    page?: number
    limit?: number
    sort?: string
  }): Promise<SearchResponse> {
    try {
      const response = await apiClient.get(`/public/category/${category}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    try {
      const response = await apiClient.get('/public/search', {
        params: { q: query, ...filters }
      })
      return response.data
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }

  // Get trending products
  static async getTrendingProducts(limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/public/trending', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching trending products:', error)
      throw error
    }
  }

  // Get new products
  static async getNewProducts(limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get('/public/new', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching new products:', error)
      throw error
    }
  }

  // Get customizable products
  static async getCustomizableProducts(params?: {
    page?: number
    limit?: number
  }): Promise<SearchResponse> {
    try {
      const response = await apiClient.get('/public/customizable', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching customizable products:', error)
      throw error
    }
  }

  // Get all categories
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get('/public/categories')
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }
}

export class CustomersApi {
  // Customer registration
  static async register(data: {
    name: string
    email: string
    phone: string
    password: string
    dateOfBirth?: string
    gender?: string
  }): Promise<ApiResponse<{ token: string; customer: any }>> {
    try {
      const response = await apiClient.post('/customer-auth/register', data)
      return response.data
    } catch (error) {
      console.error('Error registering customer:', error)
      throw error
    }
  }

  // Customer login
  static async login(data: {
    email: string
    password: string
  }): Promise<ApiResponse<{ token: string; customer: any }>> {
    try {
      const response = await apiClient.post('/customer-auth/login', data)
      return response.data
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  // Get current customer profile
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/customer-auth/me')
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  // Update customer profile
  static async updateProfile(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put('/customer-auth/profile', data)
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Add customer address
  static async addAddress(data: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    type?: 'home' | 'work' | 'other'
    isDefault?: boolean
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/customer-auth/addresses', data)
      return response.data
    } catch (error) {
      console.error('Error adding address:', error)
      throw error
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/customer-auth/logout')
      localStorage.removeItem('auth-token')
    } catch (error) {
      console.error('Error logging out:', error)
      localStorage.removeItem('auth-token')
    }
  }
}

export class OrdersApi {
  // Create new order
  static async createOrder(data: {
    items: Array<{
      productId: string
      quantity: number
      selectedColor?: string
      selectedSize?: string
      customization?: any
    }>
    shippingAddress: {
      firstName: string
      lastName: string
      address: string
      city: string
      state: string
      pincode: string
      phone: string
    }
    paymentMethod: string
    notes?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/customer-orders', data)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Get customer orders
  static async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/customer-orders', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  // Get single order
  static async getOrder(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/customer-orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  // Cancel order
  static async cancelOrder(id: string, reason?: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch(`/customer-orders/${id}/cancel`, { reason })
      return response.data
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    }
  }

  // Request return
  static async requestReturn(id: string, data: {
    reason: string
    itemIds?: string[]
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch(`/customer-orders/${id}/return`, data)
      return response.data
    } catch (error) {
      console.error('Error requesting return:', error)
      throw error
    }
  }
}

export class SellersApi {
  // Get seller profile by ID
  static async getSeller(id: string): Promise<ApiResponse<Seller>> {
    try {
      const response = await apiClient.get(`/sellers/public/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching seller:', error)
      throw error
    }
  }

  // Get seller's products
  static async getSellerProducts(sellerId: string, params?: {
    page?: number
    limit?: number
    sort?: string
  }): Promise<SearchResponse> {
    try {
      const response = await apiClient.get(`/sellers/public/${sellerId}/products`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching seller products:', error)
      throw error
    }
  }

  // Get featured sellers
  static async getFeaturedSellers(limit = 6): Promise<ApiResponse<Seller[]>> {
    try {
      const response = await apiClient.get('/sellers/public/featured', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching featured sellers:', error)
      throw error
    }
  }
}

export default apiClient
