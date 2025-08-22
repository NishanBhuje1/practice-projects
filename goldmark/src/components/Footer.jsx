import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content*/}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Navigation Links */}
          <div>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/account"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/our-story"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  to="/profiles"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Customer Profiles
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="space-y-3 text-gray-300">
              <p>116 Pacific Hwy, North Sydney, NSW 2060</p>
              <p>Sydney, Australia</p>
              <p>goldmark@jewellery.com</p>
              <p>61-234-567-890</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-medium mb-4">Get on the list</h3>
            <p className="text-gray-300 text-sm mb-6">
              New arrivals, exclusive sales and much more
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white py-2 text-white placeholder-gray-400 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  required
                  className="w-4 h-4 text-amber-600 bg-transparent border border-gray-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-300">
                  Yes, subscribe me to your newsletter.
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-3 rounded-full hover:bg-gray-100 transition-colors font-medium"
              >
                {isSubscribed ? "Subscribed!" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Brand and Social Links */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-4xl font-serif text-white mb-4">Goldmark</h2>
              <div className="flex space-x-6">
                <a
                  href="https://instagram.com/goldmark"
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/goldmark"
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
                <a
                  href="https://x.com/goldmark"
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X
                </a>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© 2025 by Goldmark.</p>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden mt-8 border-t border-gray-800 pt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Shop</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/products?category=rings"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Rings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=earrings"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Earrings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=necklaces"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Necklaces
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=bracelets"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Bracelets
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/our-story"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Our Story
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
