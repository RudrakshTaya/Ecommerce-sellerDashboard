// API Configuration for Backend Connection
const API_CONFIG = {
  // Backend API base URL
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://your-backend-domain.com"
      : "http://localhost:5050",

  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/signup",
      ME: "/api/auth/me",
      PROFILE: "/api/auth/profile",
      CHANGE_PASSWORD: "/api/auth/change-password",
      LOGOUT: "/api/auth/logout",
    },

    // Products
    PRODUCTS: {
      BASE: "/api/products",
      BY_ID: (id) => `/api/products/${id}`,
      STATUS: (id) => `/api/products/${id}/status`,
      CATEGORIES: "/api/products/categories",
    },

    // Orders
    ORDERS: {
      BASE: "/api/orders",
      BY_ID: (id) => `/api/orders/${id}`,
      STATUS: (id) => `/api/orders/${id}/status`,
      ANALYTICS: "/api/orders/analytics",
    },

    // Analytics
    ANALYTICS: {
      DASHBOARD: "/api/analytics/dashboard",
      SALES: "/api/analytics/sales",
      PRODUCTS: "/api/analytics/products",
      CUSTOMERS: "/api/analytics/customers",
      INVENTORY: "/api/analytics/inventory",
    },

    // Upload
    UPLOAD: {
      SINGLE: "/api/upload/single",
      MULTIPLE: "/api/upload/multiple",
      BASE64: "/api/upload/base64",
      DELETE: (publicId) => `/api/upload/${publicId}`,
      INFO: (publicId) => `/api/upload/info/${publicId}`,
    },

    // Test endpoints
    TEST: {
      PUBLIC: "/api/test/public",
      PROTECTED: "/api/test/protected",
    },
  },

  // Request timeout
  TIMEOUT: 30000,

  // Headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Create full URL
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Create auth headers
export const createAuthHeaders = (includeAuth = true) => {
  const headers = { ...API_CONFIG.HEADERS };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Create FormData headers for file upload
export const createFormDataHeaders = (includeAuth = true) => {
  const headers = {};

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Don't set Content-Type for FormData, let browser set it
  return headers;
};

export default API_CONFIG;
