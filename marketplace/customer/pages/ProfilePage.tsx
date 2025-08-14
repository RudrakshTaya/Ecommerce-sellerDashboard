import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Shield,
  Heart,
  Package,
  CreditCard,
} from "lucide-react";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { authAPI, addressesAPI, ordersAPI, wishlistAPI } from "../lib/api";
import { Customer, Address, Order, Product } from "../lib/types";
import { useUIStore } from "../lib/store";

const ProfilePage: React.FC = () => {
  const { customer, setCustomer } = useCustomerAuth();
  const { showNotification } = useUIStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "addresses" | "orders" | "wishlist" | "security"
  >("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  const [profileData, setProfileData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    dateOfBirth: customer?.dateOfBirth || "",
    gender: customer?.gender || "",
  });

  const [newAddress, setNewAddress] = useState({
    type: "home" as "home" | "work" | "other",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false,
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setProfileData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        dateOfBirth: customer.dateOfBirth || "",
        gender: customer.gender || "",
      });
    }
  }, [customer]);

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    } else if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    try {
      const data = await addressesAPI.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await wishlistAPI.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedCustomer = await authAPI.updateProfile(profileData);
      setCustomer(updatedCustomer);
      setEditingProfile(false);
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      showNotification("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      await addressesAPI.addAddress(newAddress);
      setAddingAddress(false);
      setNewAddress({
        type: "home",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        isDefault: false,
      });
      fetchAddresses();
      showNotification("Address added successfully!", "success");
    } catch (error) {
      showNotification("Failed to add address", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressesAPI.deleteAddress(addressId);
      fetchAddresses();
      showNotification("Address deleted successfully!", "success");
    } catch (error) {
      showNotification("Failed to delete address", "error");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await addressesAPI.setDefaultAddress(addressId);
      fetchAddresses();
      showNotification("Default address updated!", "success");
    } catch (error) {
      showNotification("Failed to update default address", "error");
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      fetchWishlist();
      showNotification("Removed from wishlist!", "success");
    } catch (error) {
      showNotification("Failed to remove from wishlist", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-earth-900 mb-4">
            Please log in
          </h1>
          <p className="text-earth-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-900 mb-2">My Profile</h1>
          <p className="text-earth-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-craft-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-craft-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-900">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-earth-600">{customer.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === "profile"
                      ? "bg-craft-100 text-craft-700"
                      : "text-earth-600 hover:bg-warm-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === "addresses"
                      ? "bg-craft-100 text-craft-700"
                      : "text-earth-600 hover:bg-warm-50"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === "orders"
                      ? "bg-craft-100 text-craft-700"
                      : "text-earth-600 hover:bg-warm-50"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === "wishlist"
                      ? "bg-craft-100 text-craft-700"
                      : "text-earth-600 hover:bg-warm-50"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === "security"
                      ? "bg-craft-100 text-craft-700"
                      : "text-earth-600 hover:bg-warm-50"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-earth-900">
                    Profile Information
                  </h2>
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center space-x-2 text-craft-600 hover:text-craft-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="flex items-center space-x-2 btn-primary"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex items-center space-x-2 text-earth-600 hover:text-earth-700"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Full Name
                    </label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                      />
                    ) : (
                      <p className="text-earth-600">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Email
                    </label>
                    <p className="text-earth-600 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {profileData.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
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
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                      />
                    ) : (
                      <p className="text-earth-600 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {profileData.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Date of Birth
                    </label>
                    {editingProfile ? (
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                      />
                    ) : (
                      <p className="text-earth-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {profileData.dateOfBirth
                          ? new Date(
                              profileData.dateOfBirth,
                            ).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Gender
                    </label>
                    {editingProfile ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                    ) : (
                      <p className="text-earth-600">
                        {profileData.gender || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-earth-900">
                      My Addresses
                    </h2>
                    <button
                      onClick={() => setAddingAddress(true)}
                      className="flex items-center space-x-2 btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {addingAddress && (
                    <div className="border border-warm-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-earth-900 mb-4">
                        Add New Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            Address Type
                          </label>
                          <select
                            value={newAddress.type}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                type: e.target.value as
                                  | "home"
                                  | "work"
                                  | "other",
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={newAddress.firstName}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={newAddress.lastName}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                pincode: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-900 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="default-address"
                          checked={newAddress.isDefault}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              isDefault: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="default-address"
                          className="text-sm text-earth-600"
                        >
                          Set as default address
                        </label>
                      </div>
                      <div className="flex items-center space-x-4 mt-6">
                        <button
                          onClick={handleAddAddress}
                          disabled={loading}
                          className="btn-primary"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setAddingAddress(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="border border-warm-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="badge badge-primary capitalize">
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="badge badge-secondary">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-earth-900">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-earth-600">{address.address}</p>
                            <p className="text-earth-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            <p className="text-earth-600">{address.phone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!address.isDefault && (
                              <button
                                onClick={() =>
                                  handleSetDefaultAddress(address._id)
                                }
                                className="text-sm text-craft-600 hover:text-craft-700"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {addresses.length === 0 && !addingAddress && (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-earth-900 mb-2">
                        No addresses added
                      </h3>
                      <p className="text-earth-600">
                        Add your first address to continue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">
                  My Orders
                </h2>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-warm-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-earth-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-earth-600">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`badge ${getStatusColor(order.status)} capitalize`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-earth-900">
                              Total Amount
                            </p>
                            <p className="text-lg font-bold text-craft-600">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-earth-900">
                              Items
                            </p>
                            <p className="text-earth-600">
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-earth-900">
                              Seller
                            </p>
                            <p className="text-earth-600">
                              {order.sellerId?.storeName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button className="btn-secondary">
                            View Details
                          </button>
                          {order.status === "pending" && (
                            <button className="text-red-600 hover:text-red-700">
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-earth-600">
                      Your orders will appear here once you make a purchase
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">
                  My Wishlist
                </h2>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                      <div
                        key={product._id}
                        className="border border-warm-200 rounded-lg p-4"
                      >
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-semibold text-earth-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-craft-600 mb-4">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button className="flex-1 btn-primary">
                            Add to Cart
                          </button>
                          <button
                            onClick={() =>
                              handleRemoveFromWishlist(product._id)
                            }
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-earth-600">
                      Save items you love to view them later
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">
                      Password
                    </h3>
                    <p className="text-earth-600 mb-4">
                      Change your password to keep your account secure.
                    </p>
                    <button className="btn-primary">Change Password</button>
                  </div>

                  <div className="border-t border-warm-200 pt-6">
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-earth-600 mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <button className="btn-secondary">Enable 2FA</button>
                  </div>

                  <div className="border-t border-warm-200 pt-6">
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">
                      Delete Account
                    </h3>
                    <p className="text-earth-600 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
