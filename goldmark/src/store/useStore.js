import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  productAPI,
  authAPI,
  orderAPI,
  adminAPI,
  apiUtils,
} from "../services/apiService";

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {'rings'|'earrings'|'necklaces'|'bracelets'} category
 * @property {string[]} images
 * @property {{size?: string[], material?: string[]}=} variants
 * @property {boolean} inStock
 * @property {boolean} featured
 * @property {number} stock
 */

/**
 * @typedef {Object} CartItem
 * @property {Product} product
 * @property {number} quantity
 * @property {{size?: string, material?: string}=} selectedVariants
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {{street: string, city: string, state: string, zipCode: string, country: string}=} [address]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} userId
 * @property {CartItem[]} items
 * @property {number} total
 * @property {'pending'|'processing'|'shipped'|'delivered'|'cancelled'} status
 * @property {Date} createdAt
 * @property {User['address']} shippingAddress
 */

export const useStore = create(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      cart: [],
      isCartOpen: false,
      user: null,
      orders: [],
      isCheckoutOpen: false,

      // Loading states
      isLoading: false,
      productsLoading: false,
      ordersLoading: false,

      // Error states
      error: null,
      productsError: null,
      ordersError: null,

      // Loading actions
      setLoading: (isLoading) => set({ isLoading }),
      setProductsLoading: (loading) => set({ productsLoading: loading }),
      setOrdersLoading: (loading) => set({ ordersLoading: loading }),

      // Error actions
      setError: (error) => set({ error }),
      setProductsError: (error) => set({ productsError: error }),
      setOrdersError: (error) => set({ ordersError: error }),
      clearError: () => set({ error: null }),

      // Product actions
      fetchProducts: async (params = {}) => {
        set({ productsLoading: true, productsError: null });
        try {
          const response = await productAPI.getProducts(params);
          const products = response.products || response; // Handle different response formats
          set({ products, productsLoading: false });
          return products;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ productsError: errorMessage, productsLoading: false });

          // Handle auth errors
          if (apiUtils.isAuthError(error)) {
            apiUtils.handleTokenExpiration();
          }

          throw error;
        }
      },

      setProducts: (products) => set({ products }),

      getProductById: async (id) => {
        const product = get().products.find((product) => product.id === id);
        if (product) {
          return product;
        }

        // If not in local state, fetch from API
        try {
          const response = await productAPI.getProduct(id);
          return response.product || response;
        } catch (error) {
          throw new Error(apiUtils.getErrorMessage(error));
        }
      },

      getProductsByCategory: (category) =>
        get().products.filter((product) => product.category === category),

      searchProducts: async (term, params = {}) => {
        set({ productsLoading: true, productsError: null });
        try {
          const response = await productAPI.searchProducts(term, params);
          const products = response.products || response;
          return products;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ productsError: errorMessage, productsLoading: false });
          throw error;
        } finally {
          set({ productsLoading: false });
        }
      },

      // Admin product actions
      addProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
          // Transform frontend data to match backend schema
          const backendData = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            categoryId:
              productData.categoryId ||
              (await getCategoryIdByName(productData.category)),
            stockQuantity: productData.stock || productData.stockQuantity || 0,
            isFeatured: productData.featured || false,
            images: productData.images || [],
            variants: productData.variants || {},
          };

          const response = await productAPI.createProduct(backendData);

          // Refresh products list to get the new product with full details
          await get().fetchProducts();

          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProduct: async (id, productData) => {
        set({ isLoading: true, error: null });
        try {
          // Transform frontend data to match backend schema
          const backendData = {
            ...(productData.name && { name: productData.name }),
            ...(productData.description && {
              description: productData.description,
            }),
            ...(productData.price && { price: productData.price }),
            ...(productData.categoryId && {
              categoryId: productData.categoryId,
            }),
            ...(productData.category && {
              categoryId: await getCategoryIdByName(productData.category),
            }),
            ...(productData.stock !== undefined && {
              stockQuantity: productData.stock,
            }),
            ...(productData.stockQuantity !== undefined && {
              stockQuantity: productData.stockQuantity,
            }),
            ...(productData.featured !== undefined && {
              isFeatured: productData.featured,
            }),
            ...(productData.images && { images: productData.images }),
            ...(productData.variants && { variants: productData.variants }),
            ...(productData.inStock !== undefined && {
              isActive: productData.inStock,
            }),
          };

          const response = await productAPI.updateProduct(id, backendData);

          // Update local state optimistically
          set({
            products: get().products.map((product) => {
              if (product.id === id) {
                return { ...product, ...productData };
              }
              return product;
            }),
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          // Refresh products on error to ensure consistency
          get().fetchProducts();
          throw error;
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await productAPI.deleteProduct(id);

          // Remove from local state
          set({
            products: get().products.filter((product) => product.id !== id),
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProductStock: async (id, stockQuantity) => {
        try {
          const response = await productAPI.updateStock(id, stockQuantity);

          // Update local state
          set({
            products: get().products.map((product) => {
              if (product.id === id) {
                return {
                  ...product,
                  stockQuantity,
                  inStock: stockQuantity > 0,
                };
              }
              return product;
            }),
          });

          return response;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage });
          throw error;
        }
      },

      // Cart actions (local state, synced on order creation)
      addToCart: (product, quantity = 1, variants) => {
        const existingItem = get().cart.find(
          (item) =>
            item.product.id === product.id &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
        );

        if (existingItem) {
          set({
            cart: get().cart.map((item) =>
              item.product.id === product.id &&
              JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              { product, quantity, selectedVariants: variants },
            ],
          });
        }
      },

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.product.id !== productId),
        });
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),

      // Computed values
      getCartTotal: () =>
        get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getCartItemCount: () =>
        get().cart.reduce((count, item) => count + item.quantity, 0),

      // User actions
      loginUser: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response;

          // Store token
          localStorage.setItem("token", token);

          set({ user, isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      registerUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, token } = response;

          // Store token
          localStorage.setItem("token", token);

          set({ user, isLoading: false });
          return response;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logoutUser: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Even if logout fails, clear local state
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("token");
          set({ user: null, orders: [], cart: [] });
        }
      },

      setUser: (user) => set({ user }),

      // Order actions
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          const order = await orderAPI.createOrder({
            ...orderData,
            items: get().cart,
            total: get().getCartTotal(),
          });

          set({
            orders: [...get().orders, order],
            cart: [], // Clear cart after successful order
            isLoading: false,
            isCheckoutOpen: false,
          });

          return order;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUserOrders: async (userId) => {
        set({ ordersLoading: true, ordersError: null });
        try {
          const response = await orderAPI.getUserOrders(userId);
          const orders = response.orders || response;
          set({ orders, ordersLoading: false });
          return orders;
        } catch (error) {
          const errorMessage = apiUtils.getErrorMessage(error);
          set({ ordersError: errorMessage, ordersLoading: false });
          throw error;
        }
      },

      addOrder: (order) => set({ orders: [...get().orders, order] }),

      // Checkout actions
      setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

      // Initialize store (call this on app start)
      initializeStore: async () => {
        // Check for stored auth token
        const token = localStorage.getItem("token");
        if (token) {
          try {
            // Verify the token and get user profile
            const user = await authAPI.getProfile();
            set({ user });
          } catch (error) {
            // Token is invalid, remove it
            localStorage.removeItem("token");
            console.warn("Invalid token removed");
          }
        }

        // Fetch initial products
        try {
          await get().fetchProducts();
        } catch (error) {
          console.error("Failed to fetch initial products:", error);
        }
      },
    }),
    {
      name: "goldmark-store",
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        // Don't persist orders as they should be fetched fresh
      }),
    }
  )
);

// Helper function to get category ID from name (you'll need to implement this based on your categories)
const getCategoryIdByName = async (categoryName) => {
  try {
    const response = await productAPI.getCategories();
    const categories = response.categories || response;
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category?.id;
  } catch (error) {
    console.error("Failed to get category ID:", error);
    // Return a default category ID or throw error based on your needs
    return null;
  }
};
       