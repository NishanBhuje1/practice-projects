// src/store/useStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, authService, userService, cartService } from '../services/supabase';

export const useStore = create(
  persist(
    (set, get) => ({
      // ===== USER & AUTHENTICATION STATE =====
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),

      // Initialize auth state from Supabase session
      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Get user profile
            const { profile } = await userService.getUserProfile(session.user.id);

            const userData = {
              id: session.user.id,
              email: session.user.email,
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              phone: profile?.phone || '',
              isAdmin: profile?.is_admin || false
            };

            set({ 
              user: userData, 
              isAuthenticated: true,
              isLoading: false 
            });

            // Load user's cart
            get().loadCartFromSupabase(session.user.id);
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      // Logout
      logout: async () => {
        try {
          await authService.signOut();
          set({ 
            user: null, 
            isAuthenticated: false,
            cartItems: [],
            cartCount: 0 
          });
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },

      // ===== CART STATE =====
      cartItems: [],
      cartCount: 0,
      isCartOpen: false,

      // Load cart from Supabase
      loadCartFromSupabase: async (userId) => {
        try {
          const { cartItems: fetchedItems, error } = await cartService.getCart(userId);

          if (error) {
            console.error('Error loading cart:', error);
            return;
          }

          const cartItems = fetchedItems.map(item => ({
            id: item.product_id,
            cartItemId: item.id,
            name: item.products.name,
            price: item.price,
            quantity: item.quantity,
            image: item.products.product_images?.[0]?.image_url || '/placeholder-product.jpg',
            maxStock: item.products.stock_quantity
          }));

          const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

          set({ cartItems, cartCount });
        } catch (error) {
          console.error('Error loading cart from Supabase:', error);
        }
      },

      // Set cart items (from external source)
      setCartItems: (items) => {
        const cartCount = items.reduce((total, item) => total + item.quantity, 0);
        set({ cartItems: items, cartCount });
      },

      // Add item to cart (local state update)
      addToCart: (product) => {
        const { cartItems } = get();
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
          const updatedItems = cartItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
          const cartCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
          set({ cartItems: updatedItems, cartCount });
        } else {
          const newItems = [...cartItems, { ...product, quantity: product.quantity || 1 }];
          const cartCount = newItems.reduce((total, item) => total + item.quantity, 0);
          set({ cartItems: newItems, cartCount });
        }
      },

      // Update cart item quantity (local state update)
      updateCartItem: (productId, quantity) => {
        const { cartItems } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const updatedItems = cartItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        const cartCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
        set({ cartItems: updatedItems, cartCount });
      },

      // Remove item from cart (local state update)
      removeFromCart: (productId) => {
        const { cartItems } = get();
        const updatedItems = cartItems.filter(item => item.id !== productId);
        const cartCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
        set({ cartItems: updatedItems, cartCount });
      },

      // Clear cart (local state update)
      clearCart: () => set({ cartItems: [], cartCount: 0 }),

      // Get cart total
      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      // Toggle cart modal
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      // ===== PRODUCT STATE =====
      products: [],
      featuredProducts: [],
      categories: [
        { id: 'all', name: 'All Products' },
        { id: 'rings', name: 'Rings' },
        { id: 'necklaces', name: 'Necklaces' },
        { id: 'earrings', name: 'Earrings' },
        { id: 'bracelets', name: 'Bracelets' }
      ],

      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),

      // ===== UI STATE =====
      error: null,
      
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // ===== ADMIN STATE =====
      isAdminAuthenticated: false,
      adminUser: null,

      setAdminAuth: (isAuthenticated, adminUser = null) => 
        set({ isAdminAuthenticated: isAuthenticated, adminUser }),

      // ===== SEARCH & FILTERS =====
      searchQuery: '',
      selectedCategory: 'all',
      priceRange: { min: 0, max: 5000 },
      sortBy: 'newest',

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSortBy: (sortBy) => set({ sortBy }),

      // Reset filters
      resetFilters: () => set({
        searchQuery: '',
        selectedCategory: 'all',
        priceRange: { min: 0, max: 5000 },
        sortBy: 'newest'
      }),

      // ===== WISHLIST STATE =====
      wishlist: [],
      
      addToWishlist: (product) => {
        const { wishlist } = get();
        if (!wishlist.find(item => item.id === product.id)) {
          set({ wishlist: [...wishlist, product] });
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get();
        set({ wishlist: wishlist.filter(item => item.id !== productId) });
      },

      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(item => item.id === productId);
      }
    }),
    {
      name: 'goldmark-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cartItems: state.cartItems,
        cartCount: state.cartCount,
        wishlist: state.wishlist,
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser
      })
    }
  )
);

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    // User signed in - this will be handled by the login component
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    store.logout();
  } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    // Token refreshed - maintain current state
  }
});