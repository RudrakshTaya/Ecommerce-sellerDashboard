import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Customer, CartItem, Cart, Address } from './types';

// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  token: string | null;
  login: (customer: Customer, token: string) => void;
  logout: () => void;
  updateCustomer: (customer: Customer) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      customer: null,
      token: null,
      login: (customer: Customer, token: string) => {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customer', JSON.stringify(customer));
        set({ isAuthenticated: true, customer, token });
      },
      logout: () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
        set({ isAuthenticated: false, customer: null, token: null });
      },
      updateCustomer: (customer: Customer) => {
        localStorage.setItem('customer', JSON.stringify(customer));
        set({ customer });
      },
    }),
    {
      name: 'customer-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        customer: state.customer,
        token: state.token,
      }),
    }
  )
);

// Cart Store
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getCart: () => Cart;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.productId === product._id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                product,
                quantity,
                addedAt: new Date().toISOString(),
              },
            ],
          });
        }
      },
      removeItem: (productId: string) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
      openCart: () => {
        set({ isOpen: true });
      },
      closeCart: () => {
        set({ isOpen: false });
      },
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      getCart: () => {
        const items = get().items;
        const subtotal = get().getCartTotal();
        const itemCount = get().getCartCount();
        return { items, subtotal, itemCount };
      },
    }),
    {
      name: 'customer-cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const items = get().items;
        const exists = items.find(item => item._id === product._id);
        
        if (!exists) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId: string) => {
        set({
          items: get().items.filter(item => item._id !== productId),
        });
      },
      isInWishlist: (productId: string) => {
        return get().items.some(item => item._id === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'customer-wishlist-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

// Search Store
interface SearchState {
  query: string;
  filters: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    isHandmade?: boolean;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  recentSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  clearFilters: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      filters: {},
      recentSearches: [],
      setQuery: (query: string) => {
        set({ query });
      },
      setFilters: (filters: Partial<SearchState['filters']>) => {
        set({ filters: { ...get().filters, ...filters } });
      },
      clearFilters: () => {
        set({ filters: {} });
      },
      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        
        const recentSearches = get().recentSearches;
        const filtered = recentSearches.filter(search => search !== query);
        const updated = [query, ...filtered].slice(0, 10); // Keep only last 10 searches
        
        set({ recentSearches: updated });
      },
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: 'customer-search-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// UI Store
interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  } | null;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  notification: null,
  toggleMobileMenu: () => {
    set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },
  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },
  toggleSearch: () => {
    set(state => ({ isSearchOpen: !state.isSearchOpen }));
  },
  closeSearch: () => {
    set({ isSearchOpen: false });
  },
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    set({
      notification: {
        message,
        type,
        isVisible: true,
      },
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      set(state => ({
        notification: state.notification ? { ...state.notification, isVisible: false } : null,
      }));
    }, 5000);
  },
  hideNotification: () => {
    set(state => ({
      notification: state.notification ? { ...state.notification, isVisible: false } : null,
    }));
  },
}));

// Address Store
interface AddressState {
  addresses: Address[];
  defaultAddress: Address | null;
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (address: Address) => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  defaultAddress: null,
  setAddresses: (addresses: Address[]) => {
    const defaultAddr = addresses.find(addr => addr.isDefault) || null;
    set({ addresses, defaultAddress: defaultAddr });
  },
  addAddress: (address: Address) => {
    const addresses = [...get().addresses, address];
    const defaultAddr = address.isDefault ? address : get().defaultAddress;
    set({ addresses, defaultAddress: defaultAddr });
  },
  updateAddress: (id: string, updatedAddress: Partial<Address>) => {
    const addresses = get().addresses.map(addr =>
      addr._id === id ? { ...addr, ...updatedAddress } : addr
    );
    const defaultAddr = addresses.find(addr => addr.isDefault) || null;
    set({ addresses, defaultAddress: defaultAddr });
  },
  removeAddress: (id: string) => {
    const addresses = get().addresses.filter(addr => addr._id !== id);
    const defaultAddr = addresses.find(addr => addr.isDefault) || null;
    set({ addresses, defaultAddress: defaultAddr });
  },
  setDefaultAddress: (address: Address) => {
    const addresses = get().addresses.map(addr => ({
      ...addr,
      isDefault: addr._id === address._id,
    }));
    set({ addresses, defaultAddress: address });
  },
}));
