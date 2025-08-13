import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { products } from "../data/products";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id.toString() === id);
  const { addToCart } = useStore();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif mb-4">Product not found</h1>
        <button
          onClick={() => navigate("/products")}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center text-gray-600 hover:text-amber-700 mb-6"
      >
        <ArrowLeft className="mr-2" size={18} /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="relative overflow-hidden aspect-square group">
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
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <p className="text-xl font-medium mb-2">
            Price:{" "}
            <span className="text-amber-700">${product.price.toFixed(2)}</span>
          </p>

          {!product.inStock ? (
            <p className="text-red-500 text-sm mb-6">Out of Stock</p>
          ) : (
            <p className="text-green-600 text-sm mb-6">In Stock</p>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-lg hover:bg-amber-600 hover:text-white flex items-center space-x-2 transition-all duration-300"
          >
            <ShoppingBag size={18} />
            <span className="text-sm font-medium">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
