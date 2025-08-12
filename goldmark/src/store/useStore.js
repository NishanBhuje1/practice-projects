import { create } from "zustand";
import { persist } from "zustand/middleware";

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

/**
 * @typedef {Object} StoreState
 * @property {Product[]} products
 * @property {CartItem[]} cart
 * @property {boolean} isCartOpen
 * @property {User|null} user
 * @property {Order[]} orders
 * @property {boolean} isCheckoutOpen
 * @property {(product: Product, quantity?: number, variants?: CartItem['selectedVariants']) => void} addToCart
 * @property {(productId: string) => void} removeFromCart
 * @property {(productId: string, quantity: number) => void} updateCartQuantity
 * @property {() => void} clearCart
 * @property {() => void} toggleCart
 * @property {(user: User|null) => void} setUser
 * @property {(open: boolean) => void} setCheckoutOpen
 * @property {(order: Order) => void} addOrder
 * @property {(products: Product[]) => void} setProducts
 * @property {(id: string) => Product|undefined} getProductById
 * @property {(category: string) => Product[]} getProductsByCategory
 * @property {() => number} getCartTotal
 * @property {() => number} getCartItemCount
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

      // Cart actions
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

      // User actions
      setUser: (user) => set({ user }),

      // Checkout actions
      setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

      addOrder: (order) => set({ orders: [...get().orders, order] }),

      // Product actions
      setProducts: (products) => set({ products }),

      getProductById: (id) =>
        get().products.find((product) => product.id === id),

      getProductsByCategory: (category) =>
        get().products.filter((product) => product.category === category),

      // Computed values
      getCartTotal: () =>
        get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getCartItemCount: () =>
        get().cart.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "goldmark-store",
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        orders: state.orders,
      }),
    }
  )
);
