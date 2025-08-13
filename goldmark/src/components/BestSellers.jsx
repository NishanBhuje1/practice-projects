import { useEffect } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore"; // Your zustand store
import { products } from "../data/products";
import toast from "react-hot-toast";

const BestSellers = () => {
  const { setProducts, addToCart } = useStore();
  const navigate = useNavigate();

  const featuredProducts = products.filter((product) => product.featured);

  useEffect(() => {
    setProducts(products);
  }, [setProducts]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleShopAll = () => {
    navigate("/products");
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">
            Best Sellers
          </h2>

          <button
            onClick={handleShopAll}
            className="text-gray-700 hover:text-gray-900 transition-colors underline text-sm"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Shop All</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden mb-4 aspect-square">
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

                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleQuickAdd(e, product)}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-600 hover:text-white flex items-center space-x-2 shadow-lg"
                >
                  <ShoppingBag size={16} />
                  <span className="text-sm font-medium">Quick Add</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600">
                  <span className="text-sm">Price</span>
                  <span className="ml-1 font-medium">
                    ${product.price.toFixed(2)}
                  </span>
                </p>
                {!product.inStock && (
                  <p className="text-red-500 text-sm mt-1">Out of Stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
