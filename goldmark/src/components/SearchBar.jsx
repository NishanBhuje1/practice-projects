import { useState, useRef, useEffect } from "react";
import { Search, X, Upload, Camera, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { products } from "../data/products";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [searchMode, setSearchMode] = useState("text"); // "text" or "image"
  const [imageResults, setImageResults] = useState([]);

  const searchRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Text search functionality
  useEffect(() => {
    if (searchQuery.trim() && searchMode === "text") {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 6)); // Limit to 6 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchMode]);

  // Simulate image search (in real implementation, you'd use Google Vision API, etc.)
  const handleImageSearch = async (imageFile) => {
    setIsImageSearching(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock image search results - in real app, you'd analyze the image
    // and return similar products based on visual similarity
    const mockResults = products
      .filter((product) => Math.random() > 0.5) // Random selection for demo
      .slice(0, 4);

    setImageResults(mockResults);
    setIsImageSearching(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setSearchMode("image");
        handleImageSearch(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedImage(null);
    setImageResults([]);
    setSearchMode("text");
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    setIsOpen(false);
    clearSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      clearSearch();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Search size={20} />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

          {/* Search Modal */}
          <div className="fixed top-0 left-0 right-0 bg-white shadow-2xl z-50 border-b">
            <div className="container mx-auto px-4 py-6">
              {/* Search Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-gray-900">
                  Search Goldmark
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Modes */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => {
                    setSearchMode("text");
                    setSelectedImage(null);
                    setImageResults([]);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    searchMode === "text"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Search size={16} />
                  <span>Text Search</span>
                </button>
                <button
                  onClick={() => {
                    setSearchMode("image");
                    setSearchQuery("");
                    setSearchResults([]);
                    fileInputRef.current?.click();
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    searchMode === "image"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Camera size={16} />
                  <span>Image Search</span>
                </button>
              </div>

              {/* Text Search Input */}
              {searchMode === "text" && (
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search for rings, necklaces, earrings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-lg"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Image Upload Area */}
              {searchMode === "image" && (
                <div className="mb-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {!selectedImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-amber-600 transition-colors"
                    >
                      <Upload
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-600 text-lg">
                        Click to upload an image
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Upload a photo to find similar jewelry
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg">
                      <img
                        src={selectedImage}
                        alt="Uploaded"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          Image uploaded successfully
                        </p>
                        <p className="text-sm text-gray-600">
                          Finding similar products...
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImageResults([]);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {/* Text Search Results */}
                {searchMode === "text" && searchResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900">
                      Products ({searchResults.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ${product.price}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.category}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Search Results */}
                {searchMode === "image" && (
                  <div>
                    {isImageSearching ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2
                          size={32}
                          className="animate-spin text-amber-600"
                        />
                        <span className="ml-3 text-lg">Analyzing image...</span>
                      </div>
                    ) : imageResults.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-gray-900">
                          Similar Products ({imageResults.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {imageResults.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  ${product.price}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.category}
                                </p>
                                <div className="flex items-center mt-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                  <span className="text-xs text-green-600">
                                    95% match
                                  </span>
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedImage ? (
                      <div className="text-center py-8 text-gray-600">
                        <p>No similar products found. Try a different image.</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* No Results */}
                {searchMode === "text" &&
                  searchQuery &&
                  searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      <p>No products found for "{searchQuery}"</p>
                      <p className="text-sm mt-2">
                        Try different keywords or browse our categories
                      </p>
                    </div>
                  )}
              </div>

              {/* Search Footer */}
              {searchQuery && searchMode === "text" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      navigate(
                        `/products?search=${encodeURIComponent(searchQuery)}`
                      );
                      setIsOpen(false);
                      clearSearch();
                    }}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    View All Results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
