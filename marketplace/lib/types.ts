export interface Product {
  id: string
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  sku: string
  category: string
  subcategory?: string
  brand?: string
  image: string
  images: ProductImage[]
  stock: number
  lowStockThreshold: number
  inStock: boolean
  materials: string[]
  colors: string[]
  sizes: string[]
  tags: string[]
  isCustomizable: boolean
  isDIY: boolean
  isInstagramPick: boolean
  isHandmade: boolean
  isNew: boolean
  isTrending: boolean
  deliveryDays: number
  origin: string
  warranty?: Warranty
  returnPolicy?: ReturnPolicy
  dimensions?: Dimensions
  careInstructions: string[]
  certifications: string[]
  sustainabilityInfo?: string
  seoTitle?: string
  seoDescription?: string
  faq: FAQ[]
  sellerId: string
  rating: number
  reviews: number
  badges: string[]
  vendor?: Vendor
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock'
  views: number
  clicks: number
  orders: number
  createdAt: string
  updatedAt: string
  discountPercentage?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface ProductImage {
  url: string
  public_id: string
  alt: string
}

export interface Warranty {
  period: string
  description: string
  type: 'none' | 'manufacturer' | 'seller'
}

export interface ReturnPolicy {
  returnable: boolean
  period: string
  conditions: string[]
}

export interface Dimensions {
  length: number
  width: number
  height: number
  weight: number
  unit: 'cm' | 'inches' | 'kg' | 'lbs'
}

export interface FAQ {
  question: string
  answer: string
}

export interface Vendor {
  name: string
  location: string
  rating: number
}

export interface Seller {
  id: string
  _id: string
  email: string
  storeName: string
  contactNumber: string
  businessAddress: string
  gstNumber?: string
  bankDetails?: BankDetails
  isVerified: boolean
  status: 'active' | 'pending' | 'suspended'
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  rating: number
  reviewCount: number
  createdAt: string
  lastLogin?: string
  avatar?: string
  description?: string
  specialties?: string[]
  location?: string
}

export interface BankDetails {
  accountNumber: string
  ifscCode: string
  bankName: string
  accountHolderName: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
  customization?: CustomizationOptions
  addedAt: string
}

export interface CustomizationOptions {
  text?: string
  font?: string
  color?: string
  placement?: string
  image?: File
}

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}

export interface Order {
  id: string
  _id: string
  orderNumber: string
  customerId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  shippingAddress: Address
  billingAddress: Address
  estimatedDelivery: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  product: Product
  sellerId: string
  seller: Seller
  quantity: number
  price: number
  selectedColor?: string
  selectedSize?: string
  customization?: CustomizationOptions
}

export interface Address {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  landmark?: string
}

export interface Customer {
  id: string
  _id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  avatar?: string
  addresses: Address[]
  preferences: CustomerPreferences
  createdAt: string
  lastLogin?: string
}

export interface CustomerPreferences {
  newsletter: boolean
  smsUpdates: boolean
  categories: string[]
  priceRange: {
    min: number
    max: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: string
  children?: Category[]
  productCount: number
}

export interface SearchFilters {
  category?: string
  subcategory?: string
  priceRange?: {
    min: number
    max: number
  }
  colors?: string[]
  sizes?: string[]
  materials?: string[]
  tags?: string[]
  rating?: number
  isHandmade?: boolean
  isCustomizable?: boolean
  deliveryDays?: number
  inStock?: boolean
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular'
}

export interface SearchResponse {
  products: Product[]
  total: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  filters: {
    categories: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
    colors: Array<{ name: string; count: number }>
    materials: Array<{ name: string; count: number }>
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  pagination?: {
    current: number
    pages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Review {
  id: string
  _id: string
  productId: string
  customerId: string
  customer: {
    firstName: string
    lastName: string
    avatar?: string
  }
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: string
}

export interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  likes: number
  comments: number
  productTags: Product[]
  createdAt: string
}
