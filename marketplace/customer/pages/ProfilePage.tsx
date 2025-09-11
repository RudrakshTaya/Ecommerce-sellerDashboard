import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Package,
  Heart,
  Trash2,
  XCircle,
} from "lucide-react";
import { authAPI, ordersAPI, wishlistAPI } from "../lib/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-earth-100 text-earth-800";
  }
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "addresses" | "orders" | "wishlist" | "security"
  >("profile");

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["current-customer"],
    queryFn: authAPI.getCurrentCustomer,
    retry: 1,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: ordersAPI.getOrders,
    retry: 1,
  });

  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ["customer-wishlist"],
    queryFn: wishlistAPI.getWishlist,
    retry: 1,
  });

  if (customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-craft-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-900 mb-2">My Account</h1>
          <p className="text-earth-600">Manage your profile, orders and wishlist</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-white rounded-xl shadow-sm border border-input p-6">
            <div className="text-sm space-y-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "profile" ? "bg-craft-50 text-craft-600 font-medium" : "text-earth-600"}`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "addresses" ? "bg-craft-50 text-craft-600 font-medium" : "text-earth-600"}`}
              >
                Addresses
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "orders" ? "bg-craft-50 text-craft-600 font-medium" : "text-earth-600"}`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "wishlist" ? "bg-craft-50 text-craft-600 font-medium" : "text-earth-600"}`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "security" ? "bg-craft-50 text-craft-600 font-medium" : "text-earth-600"}`}
              >
                Security
              </button>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-input p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-4">Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-earth-600">Name</p>
                    <p className="font-medium text-earth-900">{customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-earth-600">Email</p>
                    <p className="font-medium text-earth-900">{customer?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-sm border border-input p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-4">Addresses</h2>
                <div className="text-earth-600">Manage your saved addresses from here.</div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-input p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">My Orders</h2>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-input rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-earth-900">Order #{order.orderNumber}</h3>
                            <p className="text-sm text-earth-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-earth-900">Total Amount</p>
                            <p className="text-lg font-bold text-craft-600">${order.total.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-earth-900">Items</p>
                            <p className="text-earth-600">{order.items.length} item(s)</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-earth-900">Seller</p>
                            <p className="text-earth-600">{order.sellerId?.storeName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <Link to={`/orders/${order._id}`} className="btn-secondary">View Details</Link>
                          {order.status === "pending" && (
                            <button className="text-red-600 hover:text-red-700">Cancel Order</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">No orders yet</h3>
                    <p className="text-earth-600">Your orders will appear here once you make a purchase</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl shadow-sm border border-input p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">My Wishlist</h2>

                {wishlistLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse" />
                    ))}
                  </div>
                ) : wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                      <div key={product._id} className="border border-input rounded-lg p-4">
                        <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <h3 className="font-semibold text-earth-900 mb-2">{product.name}</h3>
                        <p className="text-lg font-bold text-craft-600 mb-4">${product.price.toFixed(2)}</p>
                        <div className="flex items-center space-x-2">
                          <Link to={`/products/${product._id}`} className="flex-1 btn-primary">View</Link>
                          <button className="p-2 text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-earth-600">Save items you love to view them later</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm border border-input p-8">
                <h2 className="text-2xl font-semibold text-earth-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">Password</h3>
                    <p className="text-earth-600 mb-4">Change your password to keep your account secure.</p>
                    <button className="btn-primary">Change Password</button>
                  </div>

                  <div className="border-t border-warm-200 pt-6">
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-earth-600 mb-4">Add an extra layer of security to your account.</p>
                    <button className="btn-secondary">Enable 2FA</button>
                  </div>

                  <div className="border-t border-warm-200 pt-6">
                    <h3 className="text-lg font-semibold text-earth-900 mb-4">Delete Account</h3>
                    <p className="text-earth-600 mb-4">Permanently delete your account and all associated data.</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Delete Account</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
