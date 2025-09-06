import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  Edit3,
  Save,
  X,
  Eye,
  Truck,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { userService, orderService } from "../services/supabase";
import toast from "react-hot-toast";

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const { user, setUser, logout } = useStore();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Handle logout with proper navigation
  const handleLogout = async () => {
    try {
      await logout();
      // Force navigation to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      if (activeTab === "orders") {
        loadOrders();
      } else if (activeTab === "addresses") {
        loadAddresses();
      }
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { orders: fetchedOrders, error } = await orderService.getUserOrders(
        user.id
      );
      if (!error) {
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { addresses: fetchedAddresses, error } =
        await userService.getUserAddresses(user.id);
      if (!error) {
        setAddresses(fetchedAddresses);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { profile, error } = await userService.updateUserProfile(user.id, {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
      });

      if (error) {
        toast.error("Failed to update profile: " + error);
        return;
      }

      // Update local user state
      setUser({
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      });

      setEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "orders", name: "Orders", icon: Package },
    { id: "addresses", name: "Addresses", icon: MapPin },
    { id: "wishlist", name: "Wishlist", icon: Heart },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-gray-900">
                Welcome back, {user?.firstName || "Customer"}!
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {editingProfile ? <X size={16} /> : <Edit3 size={16} />}
                      <span>{editingProfile ? "Cancel" : "Edit"}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profileData.firstName || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profileData.lastName || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <p className="text-gray-900">{profileData.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        {editingProfile ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profileData.phone || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    {editingProfile && (
                      <div className="flex space-x-4">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                        >
                          <Save size={16} />
                          <span>{loading ? "Saving..." : "Save Changes"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order History
                  </h2>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Start shopping to see your orders here
                      </p>
                      <button
                        onClick={() => (window.location.href = "/products")}
                        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Placed on {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                              <p className="text-lg font-semibold text-gray-900 mt-1">
                                ${order.total_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3 mb-4">
                            {order.order_items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4"
                              >
                                <img
                                  src={
                                    item.products?.product_images?.[0]
                                      ?.image_url || "/placeholder-product.jpg"
                                  }
                                  alt={item.products?.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {item.products?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity} × $
                                    {item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Actions */}
                          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                            <button className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 text-sm">
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>
                            {order.status === "shipped" && (
                              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                                <Truck size={14} />
                                <span>Track Package</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Saved Addresses
                    </h2>
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                      Add New Address
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No saved addresses
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add an address for faster checkout
                      </p>
                      <button className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">
                              {address.type.charAt(0).toUpperCase() +
                                address.type.slice(1)}{" "}
                              Address
                            </h3>
                            {address.is_default && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>
                              {address.first_name} {address.last_name}
                            </p>
                            <p>{address.address_line_1}</p>
                            {address.address_line_2 && (
                              <p>{address.address_line_2}</p>
                            )}
                            <p>
                              {address.city}, {address.state}{" "}
                              {address.postal_code}
                            </p>
                            <p>{address.country}</p>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button className="text-amber-600 hover:text-amber-700 text-sm">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Wishlist
                  </h2>
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Save items you love for later
                    </p>
                    <button
                      onClick={() => (window.location.href = "/products")}
                      className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Browse Products
                    </button>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Password & Security
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Order Updates
                            </h4>
                            <p className="text-sm text-gray-600">
                              Get notified about your order status
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Promotional Emails
                            </h4>
                            <p className="text-sm text-gray-600">
                              Receive special offers and new arrivals
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className="border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-red-900 mb-4">
                        Danger Zone
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Delete Account
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                          </p>
                          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
