'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/lib/store'
import { formatPrice, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore()

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
    toast.success('Item removed from cart')
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
      toast.success('Cart cleared')
    }
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-craft-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-craft-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-craft-800 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-craft-600 mb-8">
              Looks like you haven't added any beautiful handmade items to your cart yet.
            </p>
            <Link href="/">
              <Button size="lg">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-craft-800">Shopping Cart</h1>
            <p className="text-craft-600 mt-1">{getTotalItems()} items in your cart</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-craft-100 rounded-xl overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-craft-800 mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-craft-500 mb-2">
                        by {item.product.vendor?.name || 'Artisan'}
                      </p>
                      
                      {/* Options */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex flex-wrap gap-2 mb-3">
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

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-craft-200 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-craft-50 rounded-l-lg"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4 text-craft-600" />
                            </button>
                            <span className="px-4 py-2 font-medium text-craft-800 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-craft-50 rounded-r-lg"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4 text-craft-600" />
                            </button>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.product.stock && (
                            <span className="text-xs text-orange-600">
                              Max stock: {item.product.stock}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-craft-800">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <div className="text-sm text-craft-500">
                            {formatPrice(item.product.price)} each
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-craft-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link href="/">
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-craft-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-craft-600">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Shipping</span>
                  <span>{getTotalPrice() > 999 ? 'Free' : formatPrice(99)}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Tax (18% GST)</span>
                  <span>{formatPrice(Math.round(getTotalPrice() * 0.18))}</span>
                </div>
                <div className="border-t border-craft-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-craft-800">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        getTotalPrice() + 
                        (getTotalPrice() > 999 ? 0 : 99) + 
                        Math.round(getTotalPrice() * 0.18)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {getTotalPrice() < 999 && (
                <div className="bg-craft-50 border border-craft-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-craft-700">
                    🚚 Add {formatPrice(999 - getTotalPrice())} more for free shipping!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-craft-600">
                  <span className="mr-2">🔒</span>
                  Secure checkout
                </div>
                <div className="flex items-center text-sm text-craft-600">
                  <span className="mr-2">↩️</span>
                  Easy returns within 30 days
                </div>
                <div className="flex items-center text-sm text-craft-600">
                  <span className="mr-2">🎨</span>
                  100% handmade guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CartPage
