import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { cartService } from '../services/supabase';
import StripeProvider from "./StripeProvider";

const ShoppingCart = () => {
  const {
    cartItems,
    isCartOpen,
    toggleCart,
    setCartItems,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    user,
    isAuthenticated
  } = useStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [error, setError] = useState('');

  // Load cart items from Supabase when cart opens
  useEffect(() => {
    if (isCartOpen && isAuthenticated && user?.id) {
      loadCartItems();
    }
  }, [isCartOpen, isAuthenticated, user?.id]);

  const loadCartItems = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const { cartItems: fetchedItems, error: fetchError } = await cartService.getCart(user.id);

      if (fetchError) {
        setError(fetchError);
        return;
      }

      // Transform Supabase data to match store format
      const transformedItems = fetchedItems.map(item => ({
        id: item.product_id,
        cartItemId: item.id, // Keep track of cart item ID for updates
        name: item.products.name,
        price: item.price,
        quantity: item.quantity,
        image: item.products.product_images?.[0]?.image_url || '/placeholder-product.jpg',
        maxStock: item.products.stock_quantity
      }));

      setCartItems(transformedItems);
    } catch (err) {
      setError('Failed to load cart items');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId, productId);
      return;
    }

    // Add to updating set to show loading state
    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const { error } = await cartService.updateCartItem(cartItemId, newQuantity);

      if (error) {
        alert('Failed to update quantity: ' + error);
        return;
      }

      // Update local store
      updateCartItem(productId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    } finally {
      // Remove from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId, productId) => {
    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const { error } = await cartService.removeFromCart(cartItemId);

      if (error) {
        alert('Failed to remove item: ' + error);
        return;
      }

      // Update local store
      removeFromCart(productId);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please log in to checkout');
      return;
    }
    setIsCheckoutOpen(true);
    toggleCart();
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/50 z-40"
        onClick={toggleCart}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif text-gray-900">Shopping Cart</h2>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Please log in to view your cart</p>
                <button
                  onClick={() => {
                    toggleCart();
                    // Navigate to login - you'll need to add navigation logic
                  }}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Log In
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-400 mb-6">
                  Add some beautiful jewelry to get started
                </p>
                <button
                  onClick={toggleCart}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 bg-gray-50 rounded-lg p-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.cartItemId, item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id) || item.quantity <= 1}
                            className="p-1 hover:bg-gray-200 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          
                          <span className="w-8 text-center text-sm font-medium">
                            {updatingItems.has(item.id) ? '...' : item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(item.cartItemId, item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id) || item.quantity >= item.maxStock}
                            className="p-1 hover:bg-gray-200 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.cartItemId, item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= item.maxStock && (
                        <p className="text-xs text-orange-500 mt-1">
                          Maximum available quantity reached
                        </p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && isAuthenticated && (
            <div className="border-t border-gray-200 p-6">
              {/* Total */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${(getCartTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>${(getCartTotal() * 1.08).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Proceed to Checkout'}
              </button>

              {/* Continue Shopping */}
              <button
                onClick={toggleCart}
                className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 mt-2 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <StripeProvider
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};

export default ShoppingCart;