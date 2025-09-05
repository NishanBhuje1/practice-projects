// pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ShoppingBag, Star, Heart } from 'lucide-react';
import { productService, cartService } from '../services/supabase';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user, addToCart, isAuthenticated } = useStore();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'rings', name: 'Rings' },
    { id: 'necklaces', name: 'Necklaces' },
    { id: 'earrings', name: 'Earrings' },
    { id: 'bracelets', name: 'Bracelets' }
  ];

  // Fetch products from Supabase
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const filters = {
        category: selectedCategory,
        search: searchQuery,
        priceRange: priceRange.min > 0 || priceRange.max < 5000 ? priceRange : null
      };

      const { products: fetchedProducts, error: fetchError } = await productService.getProducts(filters);

      if (fetchError) {
        setError(fetchError);
        setProducts([]);
        return;
      }

      // Sort products based on selected option
      let sortedProducts = [...fetchedProducts];
      switch (sortBy) {
        case 'price-low':
          sortedProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sortedProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
        default:
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
      }

      setProducts(sortedProducts);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // Add to Supabase cart
      const { cartItem, error } = await cartService.addToCart(
        user.id, 
        product.id, 
        1
      );

      if (error) {
        alert('Failed to add item to cart: ' + error);
        return;
      }

      // Update local store
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.product_images?.[0]?.image_url || '/placeholder-product.jpg',
        quantity: 1
      });

      // Show success message (you can replace with toast notification)
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadProducts();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 5000 });
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Collection</h1>
              <p className="mt-1 text-gray-600">
                Discover our exquisite jewelry pieces ({products.length} products)
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-amber-100 text-amber-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Products Display */}
            {products.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {/* Product Image */}
                    <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} overflow-hidden`}>
                      <img
                        src={product.product_images?.[0]?.image_url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className={viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </h3>
                        {viewMode === 'list' && (
                          <span className="text-xl font-bold text-amber-700">
                            ${product.price?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center">
                        {viewMode === 'grid' && (
                          <span className="text-lg font-bold text-amber-700">
                            ${product.price?.toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                        
                        {viewMode === 'list' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.stock_quantity <= 0}
                            className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag size={16} />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {product.stock_quantity <= 0 ? (
                          <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                        ) : product.stock_quantity <= 5 ? (
                          <span className="text-orange-500 text-sm font-medium">
                            Only {product.stock_quantity} left
                          </span>
                        ) : (
                          <span className="text-green-500 text-sm font-medium">In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-serif text-gray-900 mb-4">
                    {searchQuery ? "No results found" : "No products found"}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {searchQuery
                      ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or browse our categories.`
                      : "No products match your current filters. Try adjusting your selection."}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;