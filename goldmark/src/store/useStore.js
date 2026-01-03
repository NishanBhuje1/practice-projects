// src/store/useStore.js
import { create } from "zustand";



const useZustandStore = create((set, get) => ({
  // Products State
  products: [],
  productsLoading: false,
  productsError: null,

  // Cart State
  cart: [],
  isCartOpen: false,

  // Auth State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Orders State
  orders: [],
  ordersLoading: false,
  ordersError: null,

  // Checkout State
  isCheckoutOpen: false,

  // Admin State
  isAdminAuthenticated: false,

  // Global Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () =>
    set({ error: null, productsError: null, ordersError: null }),

  // Auth Actions
  initializeAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      if (token) {
        // Optionally verify token with server
        set({ isAuthenticated: true });
      }

      if (adminToken) {
        set({ isAdminAuthenticated: true });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Clear invalid tokens
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      set({
        isAuthenticated: false,
        isAdminAuthenticated: false,
        user: null,
      });
    }
  },

  loginUser: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store token
      if (data.token) {
        localStorage.setItem("token", data.token);
        set({ isAuthenticated: true });

        if (data.user.role === "admin") {
          localStorage.setItem("adminToken", data.token);
          set({ isAdminAuthenticated: true });
        }
      }

      set({
        user: data.user,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      set({
        isLoading: false,
        error: error.message || "Login failed",
      });
      throw error;
    }
  },

  registerUser: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      set({
        user: data.user,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      set({
        isLoading: false,
        error: error.message || "Registration failed",
      });
      throw error;
    }
  },

  logoutUser: async () => {
    try {
      // Clear tokens
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");

      // Reset state
      set({
        user: null,
        isAuthenticated: false,
        isAdminAuthenticated: false,
        cart: [],
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  setUser: (user) => set({ user }),

  // Products Actions
  fetchProducts: async (params = {}) => {
    set({ productsLoading: true, productsError: null });

    try {
      const queryParams = new URLSearchParams();

      // Add optional parameters
      if (params.category) queryParams.append("category", params.category);
      if (params.featured) queryParams.append("featured", params.featured);
      if (params.search) queryParams.append("search", params.search);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.order) queryParams.append("order", params.order);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.inStock) queryParams.append("inStock", params.inStock);

      const queryString = queryParams.toString();
      const url = `${API_BASE}/products${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Handle the API response structure from your products.js
      const products = data.products || data || [];

      set({
        products,
        productsLoading: false,
        productsError: null,
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({
        productsLoading: false,
        productsError: error.message || "Failed to fetch products",
      });
      throw error;
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true, error: null });

    try {
      // You need to map your form data to the API expected format
      const apiPayload = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        // You'll need to get categoryId from category name
        categoryId: await get().getCategoryIdByName(productData.category),
        sku: productData.sku || `SKU-${Date.now()}`,
        stockQuantity: productData.stock,
        isFeatured: productData.featured || false,
        images: productData.images || [],
        variants: productData.variants || {},
      };

      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      // Refresh products list
      await get().fetchProducts();

      set({ isLoading: false });
      return await response.json();
    } catch (error) {
      console.error("Failed to add product:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to add product",
      });
      throw error;
    }
  },

  updateProduct: async (productId, updateData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          name: updateData.name,
          description: updateData.description,
          price: updateData.price,
          stockQuantity: updateData.stockQuantity || updateData.stock,
          isFeatured: updateData.isFeatured || updateData.featured,
          images: updateData.images,
          variants: updateData.variants,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      // Refresh products to get updated data
      await get().fetchProducts();

      set({ isLoading: false });
      return await response.json();
    } catch (error) {
      console.error("Failed to update product:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to update product",
      });
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      // Remove from local state
      const currentProducts = get().products;
      const updatedProducts = currentProducts.filter(
        (product) => product.id !== productId
      );

      set({
        products: updatedProducts,
        isLoading: false,
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to delete product:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to delete product",
      });
      throw error;
    }
  },

  updateProductStock: async (productId, newStock) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ stockQuantity: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update stock");
      }

      // Update local state
      const currentProducts = get().products;
      const updatedProducts = currentProducts.map((product) =>
        product.id === productId
          ? { ...product, stockQuantity: newStock, inStock: newStock > 0 }
          : product
      );

      set({ products: updatedProducts });

      return await response.json();
    } catch (error) {
      console.error("Failed to update stock:", error);
      throw error;
    }
  },

  searchProducts: async (searchTerm, params = {}) => {
    set({ productsLoading: true, productsError: null });

    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(
        `${API_BASE}/products/search/${encodeURIComponent(
          searchTerm
        )}?${queryParams}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Search failed");
      }

      const data = await response.json();

      set({
        products: data.products || [],
        productsLoading: false,
        productsError: null,
      });

      return data;
    } catch (error) {
      console.error("Failed to search products:", error);
      set({
        productsLoading: false,
        productsError: error.message || "Search failed",
      });
      throw error;
    }
  },

  getProductById: (id) => {
    const products = get().products;
    return products.find((product) => product.id === id);
  },

  getProductsByCategory: (category) => {
    const products = get().products;
    return products.filter((product) => product.category === category);
  },

  // Helper function to get category ID by name
  getCategoryIdByName: async (categoryName) => {
    try {
      const response = await fetch(`${API_BASE}/products/categories/all`);
      const data = await response.json();
      const category = data.categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      return category ? category.id : null;
    } catch (error) {
      console.error("Failed to get category ID:", error);
      return null;
    }
  },

  // Cart Actions
  addToCart: (product, quantity = 1) => {
    const cart = get().cart;
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        cart: [...cart, { ...product, quantity }],
      });
    }
  },

  removeFromCart: (productId) => {
    const cart = get().cart;
    set({
      cart: cart.filter((item) => item.id !== productId),
    });
  },

  updateCartQuantity: (productId, quantity) => {
    const cart = get().cart;
    if (quantity <= 0) {
      get().removeFromCart(productId);
    } else {
      set({
        cart: cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
      });
    }
  },

  clearCart: () => set({ cart: [] }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  getCartTotal: () => {
    const cart = get().cart;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getCartItemCount: () => {
    const cart = get().cart;
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Orders Actions
  createOrder: async (orderData) => {
    set({ ordersLoading: true, ordersError: null });

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();

      // Clear cart after successful order
      set({
        cart: [],
        ordersLoading: false,
        ordersError: null,
      });

      return data;
    } catch (error) {
      console.error("Failed to create order:", error);
      set({
        ordersLoading: false,
        ordersError: error.message || "Failed to create order",
      });
      throw error;
    }
  },

  fetchUserOrders: async () => {
    set({ ordersLoading: true, ordersError: null });

    try {
      const response = await fetch(`${API_BASE}/orders/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();

      set({
        orders: data.orders || [],
        ordersLoading: false,
        ordersError: null,
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({
        ordersLoading: false,
        ordersError: error.message || "Failed to fetch orders",
      });
      throw error;
    }
  },

  addOrder: (order) => {
    const orders = get().orders;
    set({ orders: [...orders, order] });
  },

  // Checkout Actions
  setCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),

  // Initialize store (call this when app starts)
  initializeStore: async () => {
    try {
      // Check for stored tokens
      const token = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      if (adminToken) {
        set({ isAdminAuthenticated: true });
      }

      if (token) {
        set({ isAuthenticated: true });
      }

      // Fetch initial data - wrap in try/catch to prevent app crash
      try {
        await get().fetchProducts();
      } catch (error) {
        console.error("Failed to fetch initial products:", error);
        // Don't throw here to prevent app crash
      }
    } catch (error) {
      console.error("Failed to initialize store:", error);
    }
  },
}));

// Export both named and default exports
export { useZustandStore };
export { useZustandStore as useStore };
export default useZustandStore;
