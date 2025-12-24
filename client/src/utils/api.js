/**
 * API Configuration
 * Centralized axios instance for all API calls
 */

import axios from "axios";

// Determine API URL based on environment
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use production URL in production, localhost in development
  return import.meta.env.PROD
    ? "https://sokoob.vercel.app/api"
    : "http://localhost:5000/api";
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized, but NOT for login attempts (which are expected to fail)
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateDetails: (userData) => api.put("/auth/updatedetails", userData),
  toggleWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
  forgotPassword: (email) => api.post("/auth/forgotpassword", { email }),
  resetPassword: (resetToken, password) =>
    api.put(`/auth/resetpassword/${resetToken}`, { password }),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getVendorProducts: () => api.get("/products/vendor"),
  addReview: (id, reviewData) => api.post(`/products/${id}/review`, reviewData),
  // File upload versions
  createWithImage: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateWithImage: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Cart API
export const cartAPI = {
  get: () => api.get("/cart"),
  addItem: (productId, quantity, variant) =>
    api.post("/cart", { productId, quantity, variant }),
  updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get("/orders"),
  getMyOrders: () => api.get("/orders/myorders"),
  getVendorOrders: () => api.get("/orders/vendor"),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post("/orders", orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Shops (Vendor) API
export const shopsAPI = {
  getAll: () => api.get("/shops"),
  getById: (id) => api.get(`/shops/${id}`),
  create: (shopData) => api.post("/shops", shopData),
  update: (id, shopData) => api.put(`/shops/${id}`, shopData),
};

// Analytics API
export const analyticsAPI = {
  getAdmin: () => api.get("/analytics/admin"),
  getVendor: () => api.get("/analytics/vendor"),
};

// Stripe API
export const stripeAPI = {
  createCheckoutSession: (data) =>
    api.post("/stripe/create-checkout-session", data),
  verifyPayment: (sessionId) =>
    api.post("/stripe/verify-payment", { sessionId }),
};

export default api;
