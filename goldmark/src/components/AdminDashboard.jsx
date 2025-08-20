import { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  Upload,
} from "lucide-react";
import { products as initialProducts } from "../data/products";

// ProductModal Component
const ProductModal = ({ isOpen, onClose, onSave, product, title }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Rings",
    stock: 10,
    inStock: true,
    images: ["/api/placeholder/400/400"],
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        stock: product.stock || 10,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Rings",
        stock: 10,
        inStock: true,
        images: ["/api/placeholder/400/400"],
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value,
                    inStock: parseInt(e.target.value) > 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  In Stock
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Add image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <button
                type="button"
                onClick={addImage}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload size={16} />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Product Row Component
const ProductRow = ({ product, onEdit, onDelete, onStockUpdate }) => {
  const [stockValue, setStockValue] = useState(product.stock || 10);
  const [isEditing, setIsEditing] = useState(false);

  const handleStockSave = () => {
    onStockUpdate(parseInt(stockValue));
    setIsEditing(false);
  };

  const getStockStatus = (stock, inStock) => {
    if (!inStock)
      return { text: "Out of Stock", color: "text-red-600 bg-red-100" };
    if (stock < 5)
      return { text: "Low Stock", color: "text-orange-600 bg-orange-100" };
    return { text: "In Stock", color: "text-green-600 bg-green-100" };
  };

  const status = getStockStatus(stockValue, product.inStock);

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {product.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{product.category}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          ${product.price.toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
            />
            <button
              onClick={handleStockSave}
              className="text-green-600 hover:text-green-800"
            >
              <CheckCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-900">{stockValue}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit size={14} />
            </button>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
        >
          {status.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [products, setProducts] = useState(initialProducts);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Calculate dashboard stats
  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce(
      (sum, product) => sum + product.price * (product.stock || 10),
      0
    ),
    lowStock: products.filter((product) => (product.stock || 10) < 5).length,
    outOfStock: products.filter((product) => !product.inStock).length,
    avgPrice:
      products.reduce((sum, product) => sum + product.price, 0) /
      products.length,
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "stock":
          aValue = a.stock || 10;
          bValue = b.stock || 10;
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // CRUD Operations
  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Math.max(...products.map((p) => p.id)) + 1,
      images: newProduct.images || ["/api/placeholder/400/400"],
    };
    setProducts([...products, product]);
    setShowAddModal(false);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const deleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  const bulkUpdateStock = (productId, newStock) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, stock: newStock, inStock: newStock > 0 }
          : product
      )
    );
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "goldmark-products.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif text-gray-900">
                Goldmark Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your jewelry inventory
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "products", label: "Products" },
              { id: "inventory", label: "Inventory" },
              { id: "analytics", label: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Low Stock
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.lowStock}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Out of Stock
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.outOfStock}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Price
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.avgPrice.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Product "Diamond Ring" stock updated to 15
                    </span>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      New product "Pearl Necklace" added
                    </span>
                    <span className="text-xs text-gray-400">5 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      Low stock alert for "Gold Bracelet"
                    </span>
                    <span className="text-xs text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="price-asc">Price Low-High</option>
                    <option value="price-desc">Price High-Low</option>
                    <option value="stock-asc">Stock Low-High</option>
                    <option value="stock-desc">Stock High-Low</option>
                  </select>
                </div>

                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onEdit={(product) => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                        onDelete={() => deleteProduct(product.id)}
                        onStockUpdate={(newStock) =>
                          bulkUpdateStock(product.id, newStock)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Inventory Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock Alert */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Low Stock Alert
                  </h3>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {
                      products.filter((product) => (product.stock || 10) < 5)
                        .length
                    }{" "}
                    items
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {products
                    .filter((product) => (product.stock || 10) < 5)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.stock || 10} left
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => bulkUpdateStock(product.id, 20)}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  {products.filter((product) => (product.stock || 10) < 5)
                    .length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No low stock items
                    </p>
                  )}
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Out of Stock
                  </h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    {products.filter((product) => !product.inStock).length}{" "}
                    items
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {products
                    .filter((product) => !product.inStock)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-red-600">Out of stock</p>
                          </div>
                        </div>
                        <button
                          onClick={() => bulkUpdateStock(product.id, 10)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  {products.filter((product) => !product.inStock).length ===
                    0 && (
                    <p className="text-gray-500 text-center py-4">
                      All items in stock
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Total Products
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Total Inventory Value
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Average Price
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${stats.avgPrice.toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Categories
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {categories.length - 1}
                </p>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Products by Category
              </h3>
              <div className="space-y-4">
                {categories
                  .filter((cat) => cat !== "All")
                  .map((category) => {
                    const count = products.filter(
                      (p) => p.category === category
                    ).length;
                    const percentage = (count / products.length) * 100;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {category}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={addProduct}
          title="Add New Product"
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSave={updateProduct}
          product={selectedProduct}
          title="Edit Product"
        />
      )}
    </div>
  );
};

export default AdminDashboard;
