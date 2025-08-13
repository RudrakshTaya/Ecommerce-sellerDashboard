// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  stock: number;
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    businessName?: string;
    rating?: number;
  };
  rating: number;
  reviewCount: number;
  isHandmade: boolean;
  materials: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Customer types
export interface Customer {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
  segment: 'new' | 'regular' | 'vip' | 'inactive';
  preferences?: {
    communication?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    categories?: string[];
    brands?: string[];
  };
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// Order types
export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress?: Address;
  tracking?: {
    carrier: string;
    trackingNumber: string;
    url?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  seller: {
    _id: string;
    name: string;
    businessName?: string;
  };
  quantity: number;
  price: number;
  total: number;
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Seller types
export interface Seller {
  _id: string;
  name: string;
  businessName: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  description: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  specialties: string[];
  rating: number;
  reviewCount: number;
  totalSales: number;
  joinedDate: string;
  isVerified: boolean;
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    etsy?: string;
  };
}

// Review types
export interface Review {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
  productCount: number;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  customer?: Customer;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Search and filter types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  isHandmade?: boolean;
  materials?: string[];
  seller?: string;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}
