import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Filter,
  Grid3X3,
  List,
  Search,
  ArrowLeft,
} from "lucide-react";
import { products } from "../data/products";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useStore();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  // Get search query and category from URL
  const searchQuery = searchParams.get("search");
  const categoryFromUrl = searchParams.get("category");

  useEffect(() => {
    let filtered = products;

    // Set initial category from URL
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }

    // Apply search filter if search query exists
    if (searchQuery) {
      setCurrentSearchQuery(searchQuery);
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      setCurrentSearchQuery("");
    }

    // Apply category filter
    const activeCategory = categoryFromUrl || selectedCategory;
    if (activeCategory && activeCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order for "featured"
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFromUrl, selectedCategory, sortBy]);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // Helper function to capitalize category names for display
  const formatCategoryName = (category) => {
    if (category === "All") return category;
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Update URL to reflect category selection
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === "All") {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", category);
    }
    navigate(`/products?${newSearchParams.toString()}`);
  };

  const clearSearch = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search");
    navigate(`/products?${newSearchParams.toString()}`);
    setCurrentSearchQuery("");
  };

  const clearAllFilters = () => {
    navigate("/products");
    setCurrentSearchQuery("");
    setSelectedCategory("All");
  };

  const activeCategory = categoryFromUrl || selectedCategory;
  const isFiltered =
    currentSearchQuery || (activeCategory && activeCategory !== "All");

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      {categoryFromUrl && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate("/categories")}
            className="hover:text-amber-600 transition-colors"
          >
            Categories
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {formatCategoryName(categoryFromUrl)}
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          {currentSearchQuery
            ? `Search Results`
            : categoryFromUrl
            ? `${formatCategoryName(categoryFromUrl)} Collection`
            : "Our Collection"}
        </h1>

        {currentSearchQuery && (
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
            <Search size={16} />
            <span>Showing results for "{currentSearchQuery}"</span>
            <button
              onClick={clearSearch}
              className="text-amber-600 hover:text-amber-700 underline ml-2"
            >
              Clear search
            </button>
          </div>
        )}

        {categoryFromUrl && !currentSearchQuery && (
          <p className="text-gray-600 mb-4">
            Discover our exquisite{" "}
            {formatCategoryName(categoryFromUrl).toLowerCase()} collection
          </p>
        )}

        <p className="text-gray-600">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"} found
        </p>

        {isFiltered && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center space-x-2 mt-4 text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>View All Products</span>
          </button>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {formatCategoryName(category)}
            </button>
          ))}
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            <option value="featured">Featured</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
          }
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`group cursor-pointer ${
                viewMode === "list"
                  ? "flex items-center space-x-6 p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                  : "bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              }`}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* Product Image */}
              <div
                className={`relative overflow-hidden ${
                  viewMode === "list"
                    ? "w-32 h-32 flex-shrink-0"
                    : "aspect-square"
                } group`}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                {product.images[1] && (
                  <img
                    src={product.images[1]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                )}

                {/* Quick Add to Cart - Grid View Only */}
                {viewMode === "grid" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="absolute bottom-4 right-4 bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-600 hover:text-white"
                  >
                    <ShoppingBag size={16} />
                  </button>
                )}
              </div>

              {/* Product Info */}
              <div className={viewMode === "list" ? "flex-1" : "p-6"}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                    {product.name}
                  </h3>
                  {viewMode === "list" && (
                    <span className="text-xl font-bold text-amber-700">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between items-center">
                  {viewMode === "grid" && (
                    <span className="text-lg font-bold text-amber-700">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {product.category}
                  </span>

                  {viewMode === "list" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors"
                    >
                      <ShoppingBag size={16} />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>

                {!product.inStock && (
                  <div className="mt-2">
                    <span className="text-red-500 text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
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
              {currentSearchQuery ? "No results found" : "No products found"}
            </h3>
            <p className="text-gray-600 mb-8">
              {currentSearchQuery
                ? `We couldn't find any products matching "${currentSearchQuery}". Try adjusting your search or browse our categories.`
                : activeCategory && activeCategory !== "All"
                ? `No products found in ${formatCategoryName(
                    activeCategory
                  )} category. Try browsing other categories.`
                : "No products match your current filters. Try adjusting your selection."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentSearchQuery && (
                <button
                  onClick={clearSearch}
                  className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors font-medium"
                >
                  Clear Search
                </button>
              )}
              {activeCategory && activeCategory !== "All" && (
                <button
                  onClick={() => handleCategoryChange("All")}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium"
                >
                  Show All Categories
                </button>
              )}
              <button
                onClick={() => navigate("/categories")}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full hover:from-amber-700 hover:to-orange-700 transition-colors font-medium"
              >
                Browse Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {currentSearchQuery && filteredProducts.length === 0 && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Search Suggestions
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              "rings",
              "necklaces",
              "earrings",
              "bracelets",
              "gold",
              "silver",
              "diamond",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => navigate(`/products?search=${suggestion}`)}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm hover:bg-amber-600 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Suggestions */}
      {!currentSearchQuery &&
        activeCategory === "All" &&
        filteredProducts.length > 0 && (
          <div className="mt-16 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
            <div className="text-center">
              <h3 className="text-2xl font-serif text-gray-900 mb-4">
                Shop by Category
              </h3>
              <p className="text-gray-600 mb-6">
                Discover our specialized collections designed for every style
                and occasion
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {categories
                  .filter((cat) => cat !== "All")
                  .map((category) => {
                    const productCount = products.filter(
                      (p) => p.category === category
                    ).length;
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-full hover:bg-amber-600 hover:text-white transition-colors font-medium shadow-sm hover:shadow-md"
                      >
                        {formatCategoryName(category)} ({productCount})
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ProductsPage;
