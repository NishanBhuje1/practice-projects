import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, ArrowLeft, Heart, Star } from "lucide-react";
import { productService, cartService } from "../services/supabase";
import { useStore } from "../store/useStore";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, addToCart } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load product data from Supabase
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const { product: fetchedProduct, error: fetchError } = await productService.getProduct(id);

        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (!fetchedProduct) {
          setError('Product not found');
          return;
        }

        setProduct(fetchedProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock_quantity <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    setAddingToCart(true);

    try {
      // Add to Supabase cart
      const { cartItem, error } = await cartService.addToCart(
        user.id, 
        product.id, 
        1
      );

      if (error) {
        toast.error('Failed to add item to cart: ' + error);
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

      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif mb-4">
          {error || 'Product not found'}
        </h1>
        <button
          onClick={() => navigate("/products")}
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const productImages = product.product_images || [];
  const mainImage = productImages[selectedImageIndex]?.image_url || '/placeholder-product.jpg';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center text-gray-600 hover:text-amber-700 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2" size={18} /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative overflow-hidden aspect-square group">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-amber-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center space-x-4">
              <p className="text-3xl font-medium text-amber-700">
                ${product.price.toFixed(2)}
              </p>
              
              {/* Stock Status */}
              <div className="flex items-center">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 text-sm font-medium">
                    {product.stock_quantity <= 5 
                      ? `Only ${product.stock_quantity} left` 
                      : 'In Stock'
                    }
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Features/Details */}
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900">Product Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Premium quality materials</li>
              <li>• Handcrafted with attention to detail</li>
              <li>• 30-day return policy</li>
              <li>• Free shipping on all orders</li>
              <li>• 1-year warranty included</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-6">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock_quantity <= 0}
              className="w-full bg-amber-600 text-white px-6 py-4 rounded-full hover:bg-amber-700 flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              <span className="font-medium">
                {addingToCart 
                  ? 'Adding to Cart...' 
                  : product.stock_quantity <= 0 
                    ? 'Out of Stock' 
                    : 'Add to Cart'
                }
              </span>
            </button>

            <button className="w-full border border-gray-300 text-gray-700 px-6 py-4 rounded-full hover:bg-gray-50 flex items-center justify-center space-x-2 transition-all duration-300">
              <Heart size={18} />
              <span className="font-medium">Add to Wishlist</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">SKU:</span>
                <span className="text-gray-600 ml-2">{product.id.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Category:</span>
                <span className="text-gray-600 ml-2 capitalize">{product.category}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="flex text-amber-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span>(4.8) 124 reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section - Placeholder for future */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif text-center mb-8">You Might Also Like</h2>
        <div className="text-center text-gray-500">
          Related products will appear here
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;