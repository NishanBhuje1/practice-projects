import { useState } from 'react';
import { useStripe, useElements, CardElement, PaymentElement } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CreditCard, Truck, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';

// Form validation schema
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
  country: z.string().min(2, 'Please select a country'),
});



const CheckoutForm = ({ isOpen, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { cart, getCartTotal, clearCart, addOrder, user, setUser } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      address: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'United States',
    }
  });

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  const handlePayment = async (data) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      // In a real application, you would:
      // 1. Send cart data to your backend
      // 2. Create a payment intent on your server
      // 3. Return the client secret to the frontend
      // 4. Confirm the payment with Stripe

      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const order = {
        id: `order_${Date.now()}`,
        userId: user?.id || 'guest',
        items: [...cart],
        total: getCartTotal(),
        status: 'processing',
        createdAt: new Date(),
        shippingAddress: {
          street: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        }
      };

      // Update user if not exists
      if (!user) {
        setUser({
          id: `user_${Date.now()}`,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          address: {
            street: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          }
        });
      }

      addOrder(order);
      clearCart();
      setPaymentSuccess(true);

    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You'll receive a confirmation email shortly.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-full transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      {/* Checkout Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif text-gray-900">Checkout</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Order Summary */}
              <div className="p-6 bg-gray-50 border-r border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`} className="flex space-x-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        {item.selectedVariants && (
                          <p className="text-sm text-gray-500">
                            {item.selectedVariants.size && `Size: ${item.selectedVariants.size}`}
                            {item.selectedVariants.size && item.selectedVariants.material && ' • '}
                            {item.selectedVariants.material && `Material: ${item.selectedVariants.material}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${(getCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>${(getCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield size={16} />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck size={16} />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          {...register('firstName')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          {...register('lastName')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        {...register('address')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          {...register('city')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          {...register('state')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zip Code
                        </label>
                        <input
                          {...register('zipCode')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          {...register('country')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <CreditCard size={20} />
                      <span>Payment Information</span>
                    </h3>

                    {/* Demo Payment Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.
                        Click "Complete Order" to simulate a successful purchase.
                      </p>
                    </div>

                    <div className="border border-gray-300 rounded-md p-3">
                      <CardElement options={cardElementOptions} />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="text-red-500 text-sm">{paymentError}</div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : `Complete Order • $${(getCartTotal() * 1.08).toFixed(2)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;
