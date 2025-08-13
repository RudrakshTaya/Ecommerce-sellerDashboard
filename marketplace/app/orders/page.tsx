'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Eye, RotateCcw, Truck } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/store'
import { OrdersApi } from '@/lib/api/client'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  estimatedDelivery: string
  items: Array<{
    product: {
      name: string
      image: string
    }
    quantity: number
    price: number
  }>
  sellerId: {
    storeName: string
  }
}

const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const loadOrders = async () => {
      try {
        const response = await OrdersApi.getOrders({ status: filter === 'all' ? undefined : filter })
        if (response.success && response.data) {
          setOrders(response.data)
        }
      } catch (error) {
        console.error('Error loading orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, filter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, label: 'Order Placed' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      processing: { variant: 'default' as const, label: 'Processing' },
      packed: { variant: 'default' as const, label: 'Packed' },
      shipped: { variant: 'default' as const, label: 'Shipped' },
      out_for_delivery: { variant: 'default' as const, label: 'Out for Delivery' },
      delivered: { variant: 'new' as const, label: 'Delivered' },
      cancelled: { variant: 'sale' as const, label: 'Cancelled' },
      returned: { variant: 'sale' as const, label: 'Returned' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'default' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-serif font-bold text-craft-800 mb-4">
              Please Login
            </h2>
            <p className="text-craft-600 mb-6">
              You need to be logged in to view your orders.
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-craft-200 border-t-craft-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-craft-600">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-craft-800">My Orders</h1>
          <p className="text-craft-600 mt-1">Track and manage your handmade treasures</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.value
                    ? 'bg-craft-500 text-white'
                    : 'bg-white text-craft-600 border border-craft-200 hover:bg-craft-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-craft-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-craft-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-craft-800 mb-4">
              No Orders Found
            </h3>
            <p className="text-craft-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No orders found with status: ${filter}`
              }
            </p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-craft-800">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-craft-500">
                      Placed on {formatDate(order.createdAt)} • {order.items.length} items
                    </p>
                    <p className="text-sm text-craft-500">
                      from {order.sellerId.storeName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <div className="text-lg font-bold text-craft-800">
                        {formatPrice(order.total)}
                      </div>
                      <div className="text-sm text-craft-500">
                        Total Amount
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-12 h-12 bg-craft-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🎨</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-craft-800 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-craft-500">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-craft-500 flex-shrink-0">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-craft-100">
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  
                  {order.status === 'shipped' && (
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  )}
                  
                  {['pending', 'confirmed'].includes(order.status) && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Cancel Order
                    </Button>
                  )}
                  
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Return Items
                    </Button>
                  )}
                </div>

                {/* Delivery Information */}
                {order.status !== 'cancelled' && order.status !== 'returned' && (
                  <div className="mt-4 p-3 bg-craft-50 rounded-lg">
                    <div className="flex items-center text-sm text-craft-600">
                      <Truck className="h-4 w-4 mr-2" />
                      {order.status === 'delivered' 
                        ? 'Delivered'
                        : `Expected delivery: ${formatDate(order.estimatedDelivery)}`
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default OrdersPage
