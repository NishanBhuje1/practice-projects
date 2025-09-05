// services/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== AUTHENTICATION SERVICES =====
export const authService = {
  // Register new user
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone || null,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, userData);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Login user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Logout user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Create user profile after registration
  async createUserProfile(userId, userData) {
    try {
      const { data, error } = await supabase.from("user_profiles").insert({
        user_id: userId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        email: userData.email,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
};

// ===== PRODUCT SERVICES =====
export const productService = {
  // Get all products
  async getProducts(filters = {}) {
    try {
      let query = supabase.from("products").select(`
          *,
          product_images (*)
        `);

      // Apply filters
      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      if (filters.priceRange) {
        query = query
          .gte("price", filters.priceRange.min)
          .lte("price", filters.priceRange.max);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return { products: data, error: null };
    } catch (error) {
      return { products: [], error: error.message };
    }
  },

  // Get single product
  async getProduct(productId) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images (*)
        `
        )
        .eq("id", productId)
        .single();

      if (error) throw error;
      return { product: data, error: null };
    } catch (error) {
      return { product: null, error: error.message };
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images (*)
        `
        )
        .eq("category", category);

      if (error) throw error;
      return { products: data, error: null };
    } catch (error) {
      return { products: [], error: error.message };
    }
  },

  // Search products
  async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images (*)
        `
        )
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      if (error) throw error;
      return { products: data, error: null };
    } catch (error) {
      return { products: [], error: error.message };
    }
  },
};

// ===== CART SERVICES =====
export const cartService = {
  // Get user's cart
  async getCart(userId) {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          products (
            *,
            product_images (*)
          )
        `
        )
        .eq("user_id", userId);

      if (error) throw error;
      return { cartItems: data, error: null };
    } catch (error) {
      return { cartItems: [], error: error.message };
    }
  },

  // Add item to cart
  async addToCart(userId, productId, quantity = 1) {
    try {
      // First check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        // Update quantity if item exists
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
          .select();

        if (error) throw error;
        return { cartItem: data[0], error: null };
      } else {
        // Get product price
        const { data: product } = await supabase
          .from("products")
          .select("price")
          .eq("id", productId)
          .single();

        // Add new item to cart
        const { data, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
            price: product.price,
          })
          .select();

        if (error) throw error;
        return { cartItem: data[0], error: null };
      }
    } catch (error) {
      return { cartItem: null, error: error.message };
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId)
        .select();

      if (error) throw error;
      return { cartItem: data[0], error: null };
    } catch (error) {
      return { cartItem: null, error: error.message };
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId) {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Clear user's cart
  async clearCart(userId) {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
};

// ===== ORDER SERVICES =====
export const orderService = {
  // Create new order
  async createOrder(orderData) {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: orderData.userId,
          total_amount: orderData.totalAmount,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          payment_method: orderData.paymentMethod,
          payment_status: "pending",
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      await cartService.clearCart(orderData.userId);

      return { order, error: null };
    } catch (error) {
      return { order: null, error: error.message };
    }
  },

  // Get user's orders
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { orders: data, error: null };
    } catch (error) {
      return { orders: [], error: error.message };
    }
  },

  // Get single order
  async getOrder(orderId) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return { order: data, error: null };
    } catch (error) {
      return { order: null, error: error.message };
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return { order: data, error: null };
    } catch (error) {
      return { order: null, error: error.message };
    }
  },
};

// Add missing import for Login component

// ===== USER PROFILE SERVICES =====
export const userService = {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error: error.message };
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error: error.message };
    }
  },

  // Get user addresses
  async getUserAddresses(userId) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return { addresses: data, error: null };
    } catch (error) {
      return { addresses: [], error: error.message };
    }
  },

  // Add user address
  async addUserAddress(userId, addressData) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          ...addressData,
        })
        .select()
        .single();

      if (error) throw error;
      return { address: data, error: null };
    } catch (error) {
      return { address: null, error: error.message };
    }
  },
};
