import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, WishlistItem, Customer, Product, SearchFilters } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, options?: {
    selectedColor?: string
    selectedSize?: string
    customization?: any
  }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

interface AuthStore {
  customer: Customer | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, customer: Customer) => void
  logout: () => void
  updateCustomer: (customer: Partial<Customer>) => void
}

interface SearchStore {
  query: string
  filters: SearchFilters
  results: Product[]
  isLoading: boolean
  totalResults: number
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  setResults: (results: Product[], total: number) => void
  setLoading: (loading: boolean) => void
  clearSearch: () => void
}

interface UIStore {
  isMobileMenuOpen: boolean
  isCartOpen: boolean
  isSearchOpen: boolean
  isWishlistOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  setCartOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setWishlistOpen: (open: boolean) => void
  closeAllModals: () => void
}

// Cart Store
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, options = {}) => {
        const existingItemIndex = get().items.findIndex(
          item => 
            item.productId === product.id &&
            item.selectedColor === options.selectedColor &&
            item.selectedSize === options.selectedSize
        )

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          set(state => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }))
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            selectedColor: options.selectedColor,
            selectedSize: options.selectedSize,
            customization: options.customization,
            addedAt: new Date().toISOString(),
          }
          set(state => ({ items: [...state.items, newItem] }))
        }
      },
      removeItem: (itemId) => {
        set(state => ({ items: state.items.filter(item => item.id !== itemId) }))
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Wishlist Store
export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const exists = get().items.find(item => item.productId === product.id)
        if (!exists) {
          const newItem: WishlistItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            addedAt: new Date().toISOString(),
          }
          set(state => ({ items: [...state.items, newItem] }))
        }
      },
      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(item => item.productId !== productId) }))
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId)
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

// Auth Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      customer: null,
      token: null,
      isAuthenticated: false,
      login: (token, customer) => {
        localStorage.setItem('auth-token', token)
        set({ token, customer, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth-token')
        set({ token: null, customer: null, isAuthenticated: false })
      },
      updateCustomer: (customerUpdate) => {
        set(state => ({
          customer: state.customer ? { ...state.customer, ...customerUpdate } : null
        }))
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Search Store
export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: {},
  results: [],
  isLoading: false,
  totalResults: 0,
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  setResults: (results, total) => set({ results, totalResults: total }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSearch: () => set({ query: '', filters: {}, results: [], totalResults: 0 }),
}))

// UI Store
export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isWishlistOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setWishlistOpen: (open) => set({ isWishlistOpen: open }),
  closeAllModals: () => set({
    isMobileMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false,
    isWishlistOpen: false,
  }),
}))
