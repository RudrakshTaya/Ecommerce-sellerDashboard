// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  image?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  stock: number;
  sellerId?: {
    _id: string;
    storeName: string;
    name?: string;
    avatar?: string;
    rating?: number;
  };
  seller?: {
    _id: string;
    name?: string;
    storeName?: string;
    avatar?: string;
    rating?: number;
  };
  rating?: number;
  reviewCount?: number;
  isHandmade?: boolean;
  materials?: string[];
  sku?: string;
  deliveryDays?: number;
  status?: string;
  inStock?: boolean;
  orders?: number;
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
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
  segment: "new" | "regular" | "vip" | "inactive";
  preferences?: {
    communication?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    categories?: string[];
    brands?: string[];
  };
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  type: "home" | "work" | "other";
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
  customerId: string;
  sellerId?: {
    _id: string;
    storeName: string;
    email?: string;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  tracking?: {
    carrier: string;
    trackingNumber: string;
    url?: string;
  };
  notes?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id?: string;
  product: string | {
    _id: string;
    name: string;
    images?: string[];
    image?: string;
    price: number;
    sku?: string;
    category?: string;
  };
  productSnapshot?: {
    name: string;
    price: number;
    image: string;
    sku: string;
    category: string;
  };
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  customization?: any;
  deliveryDays?: number;
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
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
  name?: string;
  storeName: string;
  email: string;
  contactNumber?: string;
  logo?: string;
  coverImage?: string;
  description: string;
  businessAddress?: {
    street?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
  totalProducts?: number;
  memberSince?: string;
  joinedDate?: string;
  isVerified?: boolean;
  website?: string;
  certifications?: string[];
  policies?: {
    returns?: string;
    shipping?: string;
    exchanges?: string;
  };
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
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
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
  sortBy?: "price" | "rating" | "newest" | "popular" | "name";
  sortOrder?: "asc" | "desc";
}

export interface SearchParams {
  query?: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}
