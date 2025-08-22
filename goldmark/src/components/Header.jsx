import { useState } from "react";
import { Menu, X, Heart, ShoppingBag, User } from "lucide-react";
import { useStore } from "../store/useStore";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import AuthForm from "./AuthForm";
import SearchBar from "./SearchBar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  const { getCartItemCount, toggleCart } = useStore();

  const toggleAuth = () => {
    setIsAuthOpen((prev) => !prev);
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <h1 className="text-4xl font-serif text-gray-900">Goldmark</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {/* Categories with Dropdown */}
            <div className="relative group">
              <Link
                to="/"
                className="text-2xl text-gray-700 hover:text-gray-900 transition-colors"
              >
                Categories
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100"
                >
                  View All Categories
                </Link>
                {["rings", "earrings", "necklaces", "bracelets"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleCategoryClick(item)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Link */}
            <Link
              to="/products"
              className="text-2xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              Shop All
            </Link>

            <Link
              to="/our-story"
              className="text-2xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              Our Story
            </Link>

            {/* Comment out Contact link until a route is added */}
            {/* <Link
              to="/contact"
              className="text-2xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link> */}
          </nav>

          {/* Icons with Search */}
          <div className="flex items-center space-x-4">
            {/* Search Component */}
            <SearchBar />

            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Heart size={20} />
            </button>
            <button
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
              onClick={toggleCart}
            >
              <ShoppingBag size={20} />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
            <button
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
              onClick={toggleAuth}
            >
              <User size={20} />
            </button>
            <button
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-left text-gray-700 hover:text-gray-900 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {["rings", "earrings", "necklaces", "bracelets"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleCategoryClick(item)}
                  className="text-left text-gray-700 hover:text-gray-900 transition-colors pl-4"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
              <Link
                to="/products"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop All
              </Link>
              <Link
                to="/our-story"
                className="text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Our Story
              </Link>
              {/* Comment out Contact link until a route is added */}
              {/* <Link
                to="/contact"
                className="text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link> */}
            </nav>
          </div>
        )}
      </div>

      {/* Auth Form Modal */}
      <AuthForm isAuthOpen={isAuthOpen} toggleAuth={toggleAuth} />
    </header>
  );
};

export default Header;