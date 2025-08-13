'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CreditCard, Truck, Shield, ChevronRight } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCartStore, useAuthStore } from '@/lib/store'
import { OrdersApi, CustomersApi } from '@/lib/api/client'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const CheckoutPage: React.FC = () => {
  const router = useRouter()
  const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore()
  const { isAuthenticated, customer } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Review
  
  const [shippingAddress, setShippingAddress] = useState({
    firstName: customer?.name?.split(' ')[0] || '',
    lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: customer?.phone || '',
  })
  
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue with checkout')
      router.push('/login')
      return
    }
    
    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }
  }, [isAuthenticated, items, router])

  const subtotal = getTotalPrice()
  const shipping = subtotal > 999 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'pincode', 'phone']
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return
      }
    }
    
    // Validate pincode
    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }
    
    // Validate phone
    if (!/^[0-9]{10,15}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }
    
    setStep(2)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true)
    
    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          customization: item.customization,
        })),
        shippingAddress,
        paymentMethod,
        notes,
      }

      const response = await OrdersApi.createOrder(orderData)
      
      if (response.success) {
        clearCart()
        toast.success(`Order placed successfully! Order count: ${response.data.orderCount}`)
        
        // Redirect to order confirmation with the first order ID
        const firstOrderId = response.data.orders[0]?._id
        router.push(`/orders/${firstOrderId}?success=true`)
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isAuthenticated || items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-craft-200 border-t-craft-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-craft-600">Redirecting...</p>
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
          <h1 className="text-3xl font-serif font-bold text-craft-800">Checkout</h1>
          <p className="text-craft-600 mt-1">Complete your order for {getTotalItems()} handmade items</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, label: 'Shipping Address', icon: MapPin },
              { step: 2, label: 'Payment Method', icon: CreditCard },
              { step: 3, label: 'Review Order', icon: Shield },
            ].map((stepInfo, index) => (
              <React.Fragment key={stepInfo.step}>
                <div className={`flex items-center space-x-2 ${
                  step >= stepInfo.step ? 'text-craft-700' : 'text-craft-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepInfo.step ? 'bg-craft-500 text-white' : 'bg-craft-200'
                  }`}>
                    {step > stepInfo.step ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <stepInfo.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{stepInfo.label}</span>
                </div>
                {index < 2 && (
                  <ChevronRight className="h-4 w-4 text-craft-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-craft-800 mb-6">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    placeholder="House number, building, street"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      required
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-craft-800 mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
                      { id: 'card', label: 'Credit/Debit Card', description: 'Visa, MasterCard, Rupay' },
                      { id: 'upi', label: 'UPI', description: 'Pay using any UPI app' },
                      { id: 'netbanking', label: 'Net Banking', description: 'Pay using internet banking' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                          paymentMethod === method.id 
                            ? 'border-craft-500 bg-craft-50' 
                            : 'border-craft-200 hover:border-craft-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-craft-800">{method.label}</div>
                          <div className="text-sm text-craft-600">{method.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back to Address
                    </Button>
                    <Button type="submit" className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-craft-800 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-craft-100 last:border-b-0">
                        <div className="w-16 h-16 bg-craft-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎨</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-craft-800">{item.product.name}</h3>
                          <p className="text-sm text-craft-600">by {item.product.vendor?.name}</p>
                          <p className="text-sm text-craft-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-craft-800">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-craft-800 mb-4">Shipping Address</h2>
                  <div className="text-craft-600">
                    <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    <p>Phone: {shippingAddress.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="mt-3"
                  >
                    Edit Address
                  </Button>
                </div>

                {/* Payment Method */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-craft-800 mb-4">Payment Method</h2>
                  <p className="text-craft-600 capitalize">{paymentMethod.replace('_', ' ')}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                    className="mt-3"
                  >
                    Change Payment Method
                  </Button>
                </div>

                {/* Order Notes */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-craft-800 mb-4">Order Notes (Optional)</h2>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    className="w-full p-3 border border-craft-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-craft-300"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-craft-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-craft-600">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-craft-600">
                  <span>Tax (18% GST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-craft-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-craft-800">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {step === 3 && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  isLoading={isLoading}
                >
                  Place Order
                </Button>
              )}

              {/* Trust Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-craft-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure checkout
                </div>
                <div className="flex items-center text-sm text-craft-600">
                  <Truck className="h-4 w-4 mr-2" />
                  Free shipping over ₹999
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

export default CheckoutPage
