const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Get token from localStorage helper
const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("user_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// API calls utility
export const api = {
  // Products
  getProducts: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.category && filters.category !== "All") {
      query.append("category", filters.category);
    }
    if (filters.q) {
      query.append("q", filters.q);
    }
    if (filters.maxPrice) {
      query.append("maxPrice", filters.maxPrice);
    }
    if (filters.sortBy && filters.sortBy !== "default") {
      query.append("sortBy", filters.sortBy);
    }

    const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch products");
    }
    return response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch product details");
    }
    return response.json();
  },

  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(false),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to get user details");
    }
    return response.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create order");
    }
    return data;
  },

  getMyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
      method: "GET",
      headers: getHeaders(false),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to fetch orders");
    }
    return response.json();
  },
};
