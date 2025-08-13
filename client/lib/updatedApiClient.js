import API_CONFIG, {
  createApiUrl,
  createAuthHeaders,
  createFormDataHeaders,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../config/api.js";

// Helper function to transform _id to id for frontend compatibility
const transformData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      id: item._id || item.id,
    }));
  } else if (typeof data === "object" && data._id) {
    return {
      ...data,
      id: data._id,
    };
  }

  return data;
};

// Helper function to get the correct ID (handles both _id and id)
const getId = (idOrObject) => {
  if (typeof idOrObject === "string") return idOrObject;
  if (typeof idOrObject === "object") return idOrObject._id || idOrObject.id;
  return idOrObject;
};

// Base API client class with _id handling
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = createApiUrl(endpoint);

    // Ensure we always include auth headers unless explicitly disabled
    const includeAuth = options.includeAuth !== false;
    const authHeaders = createAuthHeaders(includeAuth);

    const config = {
      timeout: this.timeout,
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      console.log("API Request:", url, "Headers:", config.headers); // Debug log

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

      // Transform _id to id for frontend compatibility
      if (data && data.data) {
        data.data = transformData(data.data);
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

  // Upload file(s) with _id handling
  async upload(endpoint, formData) {
    const url = createApiUrl(endpoint);

    try {
      console.log("Upload Request:", url); // Debug log

      const response = await fetch(url, {
        method: "POST",
        headers: createFormDataHeaders(true), // Ensure auth headers included
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      // Transform _id to id for frontend compatibility
      if (data && data.data) {
        data.data = transformData(data.data);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API with _id handling
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    // Transform seller data
    if (response.seller) {
      response.seller = transformData(response.seller);
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
    // Transform seller data
    if (response.seller) {
      response.seller = transformData(response.seller);
    }
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    // Transform seller data
    if (response.seller) {
      response.seller = transformData(response.seller);
    }
    return response;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE,
      data,
    );
    // Transform seller data
    if (response.seller) {
      response.seller = transformData(response.seller);
    }
    return response;
  },

  changePassword: (data) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  logout: () => {
    removeAuthToken();
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  },
};

// Products API with _id handling
export const productsAPI = {
  getAll: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, params);
  },

  getById: (id) => {
    const productId = getId(id);
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(productId));
  },

  create: (productData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, productData);
  },

  createWithImages: async (productData, images = []) => {
    const formData = new FormData();

    // Add basic product data (excluding complex objects)
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (['warranty', 'returnPolicy', 'dimensions', 'faq'].includes(key)) {
          // Skip complex objects, handle them separately
          return;
        }

        if (Array.isArray(productData[key])) {
          // For arrays, join with commas (backend will split them)
          formData.append(key, productData[key].join(', '));
        } else if (typeof productData[key] === "object") {
          // Convert object to JSON string
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // Handle warranty separately
    if (productData.warranty) {
      formData.append('warrantyEnabled', 'true');
      formData.append('warrantyPeriod', productData.warranty.period || '');
      formData.append('warrantyDescription', productData.warranty.description || '');
      formData.append('warrantyType', productData.warranty.type || 'none');
    } else {
      formData.append('warrantyEnabled', 'false');
    }

    // Handle return policy separately
    if (productData.returnPolicy) {
      formData.append('returnPolicyEnabled', 'true');
      formData.append('returnPeriod', productData.returnPolicy.period || '');
      formData.append('returnConditions', Array.isArray(productData.returnPolicy.conditions)
        ? productData.returnPolicy.conditions.join(', ')
        : productData.returnPolicy.conditions || '');
    } else {
      formData.append('returnPolicyEnabled', 'false');
    }

    // Handle dimensions separately
    if (productData.dimensions) {
      formData.append('dimensionsLength', productData.dimensions.length || '');
      formData.append('dimensionsWidth', productData.dimensions.width || '');
      formData.append('dimensionsHeight', productData.dimensions.height || '');
      formData.append('dimensionsWeight', productData.dimensions.weight || '');
      formData.append('dimensionsUnit', productData.dimensions.unit || 'cm');
    }

    // Handle FAQ separately
    if (productData.faq && Array.isArray(productData.faq)) {
      const questions = productData.faq.map(item => item.question).filter(q => q);
      const answers = productData.faq.map(item => item.answer).filter(a => a);
      if (questions.length > 0 && answers.length > 0) {
        questions.forEach((question, index) => {
          formData.append(`faqQuestions[${index}]`, question);
        });
        answers.forEach((answer, index) => {
          formData.append(`faqAnswers[${index}]`, answer);
        });
      }
    }

    // Add images
    images.forEach((image, index) => {
      formData.append("images", image);
    });

    return apiClient.upload(API_CONFIG.ENDPOINTS.PRODUCTS.BASE, formData);
  },

  update: (id, data) => {
    const productId = getId(id);
    return apiClient.put(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(productId), data);
  },

  updateWithImages: async (
    id,
    productData,
    newImages = [],
    removeImages = [],
  ) => {
    const productId = getId(id);
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

    // Use custom upload with PUT method for updates
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(productId));

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: createFormDataHeaders(true), // Auth headers only, no Content-Type for FormData
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      // Transform _id to id for frontend compatibility
      if (data && data.data) {
        data.data = transformData(data.data);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  delete: (id) => {
    const productId = getId(id);
    return apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(productId));
  },

  updateStatus: (id, status) => {
    const productId = getId(id);
    return apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCTS.STATUS(productId), {
      status,
    });
  },

  getCategories: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES);
  },
};

// Orders API with _id handling
export const ordersAPI = {
  getAll: (params = {}) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.BASE, params);
  },

  getById: (id) => {
    const orderId = getId(id);
    return apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.BY_ID(orderId));
  },

  create: (orderData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.BASE, orderData);
  },

  updateStatus: (id, status, note, trackingNumber) => {
    const orderId = getId(id);
    return apiClient.patch(API_CONFIG.ENDPOINTS.ORDERS.STATUS(orderId), {
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

// Upload API with _id handling
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
