'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/store'
import { OrdersApi } from '@/lib/api/client'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface OrderDetails {
  _id: string
  orderNumber: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  status: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  estimatedDelivery: string
  actualDelivery?: string
  trackingNumber?: string
  notes?: string
  items: Array<{
    _id: string
    product: {
      _id: string
      name: string
      image: string
      sku: string
    }
    quantity: number
    price: number
    selectedColor?: string
    selectedSize?: string
  }>
  sellerId: {
    _id: string
    storeName: string
    contactNumber: string
    businessAddress: string
  }
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  statusHistory: Array<{
    status: string
    timestamp: string
    note: string
    updatedBy: string
  }>
}

const OrderDetailPage: React.FC = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const orderId = params.id as string
  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    if (!isAuthenticated || !orderId) {
      return
    }

    const loadOrder = async () => {
      try {
        const response = await OrdersApi.getOrder(orderId)
        if (response.success && response.data) {
          setOrder(response.data)
          if (isSuccess) {
            toast.success('Order placed successfully! 🎉')
          }
        }
      } catch (error) {
        console.error('Error loading order:', error)
        toast.error('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [isAuthenticated, orderId, isSuccess])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'default' as const, label: 'Order Placed', color: 'text-orange-600' },
      confirmed: { variant: 'default' as const, label: 'Confirmed', color: 'text-blue-600' },
      processing: { variant: 'default' as const, label: 'Processing', color: 'text-purple-600' },
      packed: { variant: 'default' as const, label: 'Packed', color: 'text-indigo-600' },
      shipped: { variant: 'default' as const, label: 'Shipped', color: 'text-blue-600' },
      out_for_delivery: { variant: 'default' as const, label: 'Out for Delivery', color: 'text-green-600' },
      delivered: { variant: 'new' as const, label: 'Delivered', color: 'text-green-600' },
      cancelled: { variant: 'sale' as const, label: 'Cancelled', color: 'text-red-600' },
      returned: { variant: 'sale' as const, label: 'Returned', color: 'text-red-600' },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || { variant: 'default' as const, label: status, color: 'text-gray-600' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'cancelled':
      case 'returned':
        return <Package className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-orange-600" />
    }
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
              You need to be logged in to view order details.
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
            <p className="text-craft-600">Loading order details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-serif font-bold text-craft-800 mb-4">
              Order Not Found
            </h2>
            <p className="text-craft-600 mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const statusInfo = getStatusBadge(order.status)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center text-craft-600 hover:text-craft-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-craft-800">
                Order #{order.orderNumber}
              </h1>
              <p className="text-craft-600 mt-1">
                Placed on {formatDate(order.createdAt)} • {order.items.length} items
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {getStatusIcon(order.status)}
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Order Placed Successfully!</h3>
                <p className="text-green-600 text-sm">
                  Thank you for your order. You'll receive updates via email and SMS.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Status Timeline */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-craft-800 mb-6">Order Status</h2>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      index === 0 ? 'bg-craft-500' : 'bg-craft-200'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-craft-800 capitalize">
                          {history.status.replace('_', ' ')}
                        </p>
                        <span className="text-sm text-craft-500">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-craft-600">{history.note}</p>
                      <p className="text-xs text-craft-500">Updated by {history.updatedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-craft-800 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 py-4 border-b border-craft-100 last:border-b-0">
                    <div className="w-20 h-20 bg-craft-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-craft-800">{item.product.name}</h3>
                      <p className="text-sm text-craft-500">SKU: {item.product.sku}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-2 mt-1">
                          {item.selectedColor && (
                            <span className="text-xs bg-craft-100 text-craft-700 px-2 py-1 rounded">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-xs bg-craft-100 text-craft-700 px-2 py-1 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-craft-800">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-craft-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-craft-800 mb-4">Shipping Address</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-craft-500 mt-1" />
                <div className="text-craft-600">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-craft-800 mb-4">Order Notes</h2>
                <p className="text-craft-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-6">
            {/* Order Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-craft-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-craft-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Tax (GST)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="border-t border-craft-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-craft-800">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-craft-800 mb-4">Payment</h3>
              <div className="flex items-center space-x-3 mb-3">
                <CreditCard className="h-5 w-5 text-craft-500" />
                <span className="text-craft-600 capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <Badge variant={order.paymentStatus === 'paid' ? 'new' : 'default'}>
                {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
              </Badge>
            </div>

            {/* Seller Information */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-craft-800 mb-4">Seller</h3>
              <div className="space-y-2">
                <p className="font-medium text-craft-800">{order.sellerId.storeName}</p>
                <p className="text-sm text-craft-600">{order.sellerId.businessAddress}</p>
                <p className="text-sm text-craft-600">Phone: {order.sellerId.contactNumber}</p>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-craft-800 mb-4">Tracking</h3>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-craft-500" />
                  <div>
                    <p className="font-medium text-craft-800">Tracking Number</p>
                    <p className="text-sm text-craft-600">{order.trackingNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {['pending', 'confirmed'].includes(order.status) && (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  Cancel Order
                </Button>
              )}
              
              {order.status === 'delivered' && (
                <Button variant="outline" className="w-full">
                  Return Items
                </Button>
              )}
              
              <Button variant="ghost" className="w-full">
                Need Help?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default OrderDetailPage
