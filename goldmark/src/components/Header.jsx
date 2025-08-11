import { useState } from "react";
import { Menu, X, Heart, ShoppingBag } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-100">
      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-serif text-gray-900">Goldmark</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <div className="relative group">
              <button className="text-gray-700 hover:text-gray-900 transition-colors">
                Shop
              </button>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a
                  href="/rings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Rings
                </a>
                <a
                  href="/earrings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Earrings
                </a>
                <a
                  href="/necklaces"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Necklaces
                </a>
                <a
                  href="/bracelets"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Bracelets
                </a>
              </div>
            </div>
            <a
              href="/our-story"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Our Story
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Heart size={20} />
            </button>
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile menu button */}
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
              <a
                href="/shop"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Shop
              </a>
              <a
                href="/rings"
                className="text-gray-700 hover:text-gray-900 transition-colors pl-4"
              >
                Rings
              </a>
              <a
                href="/earrings"
                className="text-gray-700 hover:text-gray-900 transition-colors pl-4"
              >
                Earrings
              </a>
              <a
                href="/necklaces"
                className="text-gray-700 hover:text-gray-900 transition-colors pl-4"
              >
                Necklaces
              </a>
              <a
                href="/bracelets"
                className="text-gray-700 hover:text-gray-900 transition-colors pl-4"
              >
                Bracelets
              </a>
              <a
                href="/our-story"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Our Story
              </a>
              <a
                href="/contact"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
