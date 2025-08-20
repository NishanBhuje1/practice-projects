import { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";

export const ProductModal = ({ isOpen, onClose, onSave, product, title }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Rings",
    stock: 10,
    inStock: true,
    images: ["/api/placeholder/400/400"]
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        stock: product.stock || 10
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Rings",
        stock: 10,
        inStock: true,
        images: ["/api/placeholder/400/400"]
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()]
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stock: e.target.value,
                  inStock: parseInt(e.target.value) > 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                />
                <span className="text-sm font-medium text-gray-700">In Stock</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            
            {/* Current Images */}
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

            {/* Add Image */}
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

          {/* Actions */}
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

// InventoryManagement.jsx - Inventory tracking component
export const InventoryManagement = ({ products, onStockUpdate }) => {
  const [bulkAction, setBulkAction] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStockValue, setBulkStockValue] = useState("");

  const lowStockProducts = products.filter(p => (p.stock || 10) < 5);
  const outOfStockProducts = products.filter(p => !p.inStock);

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = () => {
    if (bulkAction === "update-stock" && bulkStockValue) {
      selectedProducts.forEach(productId => {
        onStockUpdate(productId, parseInt(bulkStockValue));
      });
      setSelectedProducts([]);
      setBulkStockValue("");
      setBulkAction("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
              {lowStockProducts.length} items
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.stock || 10} left</p>
                  </div>
                </div>
                <button
                  onClick={() => onStockUpdate(product.id, 20)}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No low stock items</p>
            )}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Out of Stock</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {outOfStockProducts.length} items
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {outOfStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-red-600">Out of stock</p>
                  </div>
                </div>
                <button
                  onClick={() => onStockUpdate(product.id, 10)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
            {outOfStockProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">All items in stock</p>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Stock Management</h3>
        
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            <option value="">Select action...</option>
            <option value="update-stock">Update Stock</option>
          </select>

          {bulkAction === "update-stock" && (
            <input
              type="number"
              placeholder="New stock amount"
              value={bulkStockValue}
              onChange={(e) => setBulkStockValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          )}

          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedProducts.length === 0 || (bulkAction === "update-stock" && !bulkStockValue)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply to {selectedProducts.length} selected
          </button>
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                />
                <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock || 10}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AnalyticsView.jsx - Analytics and reporting component
export const AnalyticsView = ({ products }) => {
  const categoryData = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const priceRanges = {
    "Under $100": products.filter(p => p.price < 100).length,
    "$100 - $500": products.filter(p => p.price >= 100 && p.price < 500).length,
    "$500 - $1000": products.filter(p => p.price >= 500 && p.price < 1000).length,
    "Over $1000": products.filter(p => p.price >= 1000).length,
  };

  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock || 10)), 0);
  const averagePrice = products.reduce((sum, product) => sum + product.price, 0) / products.length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Inventory Value</h3>
          <p className="text-3xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Price</h3>
          <p className="text-3xl font-bold text-blue-600">${averagePrice.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-purple-600">{Object.keys(categoryData).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Products by Category</h3>
          <div className="space-y-4">
            {Object.entries(categoryData).map(([category, count]) => {
              const percentage = (count / products.length) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
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

        {/* Price Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Price Distribution</h3>
          <div className="space-y-4">
            {Object.entries(priceRanges).map(([range, count]) => {
              const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
              return (
                <div key={range}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{range}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Highest Value Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products
                .sort((a, b) => (b.price * (b.stock || 10)) - (a.price * (a.stock || 10)))
                .slice(0, 5)
                .map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded object-cover" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock || 10}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(product.price * (product.stock || 10)).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;