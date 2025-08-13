// Demo response interface (keep existing)
export interface DemoResponse {
  message: string;
}

// Address interface for orders
export interface Address {
  id: string;
  type: "home" | "work" | "other";
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

// Comprehensive Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  badges: string[];
  isCustomizable: boolean;
  isDIY: boolean;
  isInstagramPick: boolean;
  isHandmade: boolean;
  isNew: boolean;
  isTrending: boolean;
  materials: string[];
  colors: string[];
  sizes?: string[];
  tags: string[];
  stock: number;
  deliveryDays: number;
  sellerId: string;
  warranty?: {
    period: string;
    description: string;
    type: "manufacturer" | "seller" | "none";
  };
  returnPolicy?: {
    returnable: boolean;
    period: string;
    conditions: string[];
  };
  careInstructions?: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit: "cm" | "inches" | "kg" | "lbs";
  };
  sku: string;
  brand?: string;
  vendor?: {
    name: string;
    location: string;
    rating: number;
  };
  certifications?: string[];
  sustainabilityInfo?: string;
  origin: string;
  inStock: boolean;
  lowStockThreshold: number;
  seoTitle?: string;
  seoDescription?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  _id?: string;
  status?: "active" | "inactive" | "draft" | "out_of_stock";
  createdAt?: string;
  updatedAt?: string;
}

// Order item interface
export interface OrderItem {
  product: Product;
  quantity: number;
  customization?: {
    text?: string;
    color?: string;
    size?: string;
    image?: string;
  };
  price: number;
  sellerId: string;
}

// Order interface
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  shippingAddress: Address;
  paymentMethod: "cod" | "card" | "upi";
  deliveryMethod: "standard" | "express";
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

// Seller interfaces
export interface Seller {
  id: string;
  email: string;
  storeName: string;
  contactNumber: string;
  businessAddress: string;
  gstNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  isVerified: boolean;
  joinedDate: string;
}

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

// API response types
export interface LoginResponse {
  success: boolean;
  seller?: Seller;
  error?: string;
}

export interface ProductsResponse {
  products: Product[];
}

export interface OrdersResponse {
  orders: Order[];
}

export interface StatsResponse {
  stats: SellerStats;
}
