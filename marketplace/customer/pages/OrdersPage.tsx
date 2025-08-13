import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { ordersAPI } from "../lib/api";

const OrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersAPI.getOrders,
    retry: 1,
    onError: (error) => {
      console.error("Failed to fetch orders:", error);
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-earth-500" />;
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-900 mb-4">My Orders</h1>
          <p className="text-earth-600">
            Track and manage your handmade craft orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-warm-200 rounded-lg focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 w-4 h-4" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-earth-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-warm-200 rounded w-1/4" />
                  <div className="h-4 bg-warm-200 rounded w-1/2" />
                  <div className="h-4 bg-warm-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-warm-100 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-earth-900 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-earth-600">
              Failed to load your orders. Please try again.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-warm-100 text-center">
            <Package className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-earth-900 mb-2">
              {orders.length === 0 ? "No Orders Yet" : "No Orders Found"}
            </h3>
            <p className="text-earth-600 mb-6">
              {orders.length === 0
                ? "You haven't placed any orders yet. Start shopping for amazing handmade crafts!"
                : "No orders match your current filters."}
            </p>
            {orders.length === 0 && (
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-warm-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-warm-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-earth-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-earth-600">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-craft-600">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-earth-600">
                        {order.items.length} items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex space-x-3">
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-earth-900 text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-earth-600">
                            by {item.seller.businessName || item.seller.name}
                          </p>
                          <p className="text-xs text-earth-600">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-craft-600">
                            ${item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-warm-100">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-secondary text-center"
                    >
                      View Details
                    </Link>
                    {order.status === "shipped" && order.tracking && (
                      <a
                        href={order.tracking.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-center"
                      >
                        Track Package
                      </a>
                    )}
                    {order.status === "delivered" && (
                      <button className="btn-secondary">Leave Review</button>
                    )}
                    {(order.status === "pending" ||
                      order.status === "confirmed") && (
                      <button className="text-red-600 hover:text-red-700 px-4 py-2 text-sm font-medium">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
