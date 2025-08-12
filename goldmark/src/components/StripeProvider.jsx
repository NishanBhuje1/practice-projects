import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

// Replace with your actual Stripe publishable key
// For demo purposes, using a test key (this won't process real payments)
const stripePromise = loadStripe('pk_test_51234567890abcdef');

import PropTypes from 'prop-types';

const StripeProvider = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm isOpen={isOpen} onClose={onClose} />
    </Elements>
  );
};

StripeProvider.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default StripeProvider;
