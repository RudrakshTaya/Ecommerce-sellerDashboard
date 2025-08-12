import API_CONFIG, {
  createApiUrl,
  createAuthHeaders,
  createFormDataHeaders,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../config/api.js";

// Base API client class
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = createApiUrl(endpoint);
    const config = {
      timeout: this.timeout,
      ...options,
      headers: {
        ...createAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      // Handle authentication errors
      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized")
      ) {
        removeAuthToken();
        window.location.href = "/login";
        return;
      }

      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(createApiUrl(endpoint));
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: "GET",
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // Upload file(s)
  async upload(endpoint, formData) {
    const url = createApiUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: createFormDataHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  register: async (userData) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData,
    );
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  getProfile: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  },

  updateProfile: (data) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, data);
  },

  changePassword: (data) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  logout: () => {
    removeAuthToken();
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  },
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, params);
  },

  getById: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  create: (productData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, productData);
  },

  createWithImages: async (productData, images = []) => {
    const formData = new FormData();

    // Add product data
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (Array.isArray(productData[key])) {
          productData[key].forEach((item, index) => {
            if (typeof item === "object") {
              Object.keys(item).forEach((subKey) => {
                formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
              });
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (typeof productData[key] === "object") {
          Object.keys(productData[key]).forEach((subKey) => {
            formData.append(`${key}[${subKey}]`, productData[key][subKey]);
          });
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // Add images
    images.forEach((image, index) => {
      formData.append("images", image);
    });

    return apiClient.upload(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, formData);
  },

  update: (id, data) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id), data);
  },

  updateWithImages: async (
    id,
    productData,
    newImages = [],
    removeImages = [],
  ) => {
    const formData = new FormData();

    // Add product data
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });

    // Add new images
    newImages.forEach((image) => {
      formData.append("newImages", image);
    });

    // Add images to remove
    if (removeImages.length > 0) {
      formData.append("removeImages", JSON.stringify(removeImages));
    }

    return apiClient.upload(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id), formData);
  },

  delete: (id) => {
    return apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  updateStatus: (id, status) => {
    return apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCTS.STATUS(id), {
      status,
    });
  },

  getCategories: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
  },
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.BASE, params);
  },

  getById: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.BY_ID(id));
  },

  create: (orderData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.BASE, orderData);
  },

  updateStatus: (id, status, note, trackingNumber) => {
    return apiClient.patch(API_CONFIG.ENDPOINTS.ORDERS.STATUS(id), {
      status,
      note,
      trackingNumber,
    });
  },

  getAnalytics: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.ANALYTICS, params);
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD);
  },

  getSales: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.SALES, params);
  },

  getProducts: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.PRODUCTS);
  },

  getCustomers: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.CUSTOMERS);
  },

  getInventory: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS.INVENTORY);
  },
};

// Upload API
export const uploadAPI = {
  single: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.upload(API_CONFIG.ENDPOINTS.UPLOAD.SINGLE, formData);
  },

  multiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    return apiClient.upload(API_CONFIG.ENDPOINTS.UPLOAD.MULTIPLE, formData);
  },

  base64: (imageData, folder) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.UPLOAD.BASE64, {
      imageData,
      folder,
    });
  },

  delete: (publicId) => {
    return apiClient.delete(API_CONFIG.ENDPOINTS.UPLOAD.DELETE(publicId));
  },

  getInfo: (publicId) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.UPLOAD.INFO(publicId));
  },
};

export default apiClient;
