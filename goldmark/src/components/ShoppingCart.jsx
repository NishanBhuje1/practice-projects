import { useState } from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useStore } from "../store/useStore";
import StripeProvider from "./StripeProvider";

const ShoppingCart = () => {
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
  } = useStore();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-400">
                  Add some beautiful jewelry to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${JSON.stringify(
                      item.selectedVariants
                    )}`}
                    className="flex space-x-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toFixed(2)}
                      </p>

                      {/* Variants */}
                      {item.selectedVariants && (
                        <div className="text-xs text-gray-400 mt-1">
                          {item.selectedVariants.size && (
                            <span>Size: {item.selectedVariants.size}</span>
                          )}
                          {item.selectedVariants.size &&
                            item.selectedVariants.material && <span> • </span>}
                          {item.selectedVariants.material && (
                            <span>
                              Material: {item.selectedVariants.material}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-300"
              >
                Proceed to Checkout
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
