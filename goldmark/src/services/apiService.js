// src/services/apiService.js
import API_BASE_URL, { getAuthHeaders } from '../config/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new APIError(
      data.message || data.error || `HTTP ${response.status}`,
      response.status,
      data
    );
  }

  return data;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  if (
    config.body &&
    typeof config.body === 'object' &&
    config.headers['Content-Type'] === 'application/json'
  ) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(`Network error: ${error.message}`, 0, {
      originalError: error,
    });
  }
};

// Product API services
export const productAPI = {
  // Get all products with filtering
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
  },

  // Get single product
  async getProduct(id) {
    return await apiRequest(`/products/${id}`);
  },

  // Search products
  async searchProducts(term, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/products/search/${encodeURIComponent(term)}${
      queryString ? `?${queryString}` : ''
    }`;

    return await apiRequest(endpoint);
  },

  // Get categories
  async getCategories() {
    return await apiRequest('/products/categories/all');
  },

  // Admin: Create product
  async createProduct(productData) {
    return await apiRequest('/products', {
      method: 'POST',
      body: productData,
    });
  },

  // Admin: Update product
  async updateProduct(id, productData) {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  },

  // Admin: Delete product
  async deleteProduct(id) {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin: Update stock
  async updateStock(id, stockQuantity) {
    return await apiRequest(`/products/${id}/stock`, {
      method: 'PATCH',
      body: { stockQuantity },
    });
  },
};

// Authentication API services
export const authAPI = {
  // Login user
  async login(credentials) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register user
  async register(userData) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Refresh token
  async refreshToken() {
    return await apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },

  // Logout
  async logout() {
    return await apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user profile
  async getProfile() {
    return await apiRequest('/auth/profile');
  },

  // Update profile
  async updateProfile(profileData) {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  },
};

// Order API services
export const orderAPI = {
  // Create new order
  async createOrder(orderData) {
    return await apiRequest('/orders', {
      method: 'POST',
      body: orderData,
    });
  },

  // Get user orders
  async getUserOrders(userId, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/orders/user/${userId}${
      queryString ? `?${queryString}` : ''
    }`;

    return await apiRequest(endpoint);
  },

  // Get single order
  async getOrder(orderId) {
    return await apiRequest(`/orders/${orderId}`);
  },

  // Update order status (admin)
  async updateOrderStatus(orderId, status) {
    return await apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  // Get all orders (admin)
  async getAllOrders(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
  },
};

// Admin API services
export const adminAPI = {
  // Get dashboard analytics
  async getDashboardAnalytics(period = '30') {
    return await apiRequest(`/admin/dashboard/analytics?period=${period}`);
  },

  // Get all users
  async getUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
  },

  // Update user status
  async updateUserStatus(userId, statusData) {
    return await apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: statusData,
    });
  },

  // Get inventory alerts
  async getInventoryAlerts() {
    return await apiRequest('/admin/inventory/alerts');
  },

  // Bulk update stock
  async bulkUpdateStock(updates) {
    return await apiRequest('/admin/inventory/bulk-update', {
      method: 'PATCH',
      body: { updates },
    });
  },

  // Get system logs
  async getLogs(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/admin/logs${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(endpoint);
  },

  // Export reports
  async exportReport(type, params = {}) {
    const searchParams = new URLSearchParams({ type, ...params });
    const queryString = searchParams.toString();

    return await apiRequest(`/admin/reports/export?${queryString}`);
  },
};

// Payment API services
export const paymentAPI = {
  // Create payment intent
  async createPaymentIntent(orderData) {
    return await apiRequest('/payments/create-intent', {
      method: 'POST',
      body: orderData,
    });
  },

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    return await apiRequest('/payments/confirm', {
      method: 'POST',
      body: { paymentIntentId, paymentMethodId },
    });
  },

  // Get payment status
  async getPaymentStatus(paymentIntentId) {
    return await apiRequest(`/payments/status/${paymentIntentId}`);
  },

  // Process refund (admin)
  async processRefund(paymentIntentId, amount) {
    return await apiRequest('/payments/refund', {
      method: 'POST',
      body: { paymentIntentId, amount },
    });
  },
};

// Generic API service for custom endpoints
export const genericAPI = {
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const fullEndpoint = `${endpoint}${queryString ? `?${queryString}` : ''}`;

    return await apiRequest(fullEndpoint);
  },

  async post(endpoint, data) {
    return await apiRequest(endpoint, {
      method: 'POST',
      body: data,
    });
  },

  async put(endpoint, data) {
    return await apiRequest(endpoint, {
      method: 'PUT',
      body: data,
    });
  },

  async patch(endpoint, data) {
    return await apiRequest(endpoint, {
      method: 'PATCH',
      body: data,
    });
  },

  async delete(endpoint) {
    return await apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if error is authentication error
  isAuthError(error) {
    return (
      error instanceof APIError &&
      (error.status === 401 || error.status === 403)
    );
  },

  // Check if error is network error
  isNetworkError(error) {
    return error instanceof APIError && error.status === 0;
  },

  // Get error message for display
  getErrorMessage(error) {
    if (error instanceof APIError) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Handle token expiration
  handleTokenExpiration() {
    localStorage.removeItem('token');
    // Redirect to login or trigger re-authentication
    window.location.href = '/login';
  },
};

// Export the APIError class for use in components
export { APIError };
