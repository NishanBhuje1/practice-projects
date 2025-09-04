// src/hooks/useStore.js
import { useStore as useZustandStore } from "../store/useStore";

// Custom hooks for different parts of the store
export const useProducts = () => {
  return useZustandStore((state) => ({
    products: state.products,
    productsLoading: state.productsLoading,
    productsError: state.productsError,
    fetchProducts: state.fetchProducts,
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    updateProductStock: state.updateProductStock,
    searchProducts: state.searchProducts,
    getProductById: state.getProductById,
    getProductsByCategory: state.getProductsByCategory,
  }));
};

export const useCart = () => {
  return useZustandStore((state) => ({
    cart: state.cart,
    isCartOpen: state.isCartOpen,
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
    updateCartQuantity: state.updateCartQuantity,
    clearCart: state.clearCart,
    toggleCart: state.toggleCart,
    getCartTotal: state.getCartTotal,
    getCartItemCount: state.getCartItemCount,
  }));
};

export const useAuth = () => {
  return useZustandStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    loginUser: state.loginUser,
    registerUser: state.registerUser,
    logoutUser: state.logoutUser,
    setUser: state.setUser,
  }));
};

export const useOrders = () => {
  return useZustandStore((state) => ({
    orders: state.orders,
    ordersLoading: state.ordersLoading,
    ordersError: state.ordersError,
    createOrder: state.createOrder,
    fetchUserOrders: state.fetchUserOrders,
    addOrder: state.addOrder,
  }));
};

export const useCheckout = () => {
  return useZustandStore((state) => ({
    isCheckoutOpen: state.isCheckoutOpen,
    setCheckoutOpen: state.setCheckoutOpen,
    createOrder: state.createOrder,
    cart: state.cart,
    getCartTotal: state.getCartTotal,
    clearCart: state.clearCart,
  }));
};

export const useGlobalState = () => {
  return useZustandStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    initializeStore: state.initializeStore,
  }));
};

// Main useStore hook that gives access to everything
export const useStore = () => {
  return useZustandStore();
};

// Selector hooks for performance optimization
export const useProductsSelector = (selector) => {
  return useZustandStore(selector);
};

export const useCartSelector = (selector) => {
  return useZustandStore(selector);
};

export const useAuthSelector = (selector) => {
  return useZustandStore(selector);
};
