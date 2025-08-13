import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { useCartStore, useAuthStore, useUIStore } from "../lib/store";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { customer } = useAuthStore();
  const { showNotification } = useUIStore();

  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: customer?.name?.split(" ")[0] || "",
    lastName: customer?.name?.split(" ").slice(1).join(" ") || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-earth-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-earth-600 mb-8">
              Add some items to your cart before checkout.
            </p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    try {
      // Simulate order processing
      showNotification("Order placed successfully!", "success");
      clearCart();
      navigate("/orders");
    } catch (error) {
      showNotification("Failed to place order. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-earth-900 mb-2">Checkout</h1>
            <p className="text-earth-600">Complete your order</p>
          </div>
          <Link
            to="/cart"
            className="flex items-center space-x-2 text-craft-600 hover:text-craft-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Step 1: Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1
                      ? "bg-craft-600 text-white"
                      : "bg-warm-200 text-warm-600"
                  }`}
                >
                  {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <h2 className="text-xl font-semibold text-earth-900">
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    placeholder="Street address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Country
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>

              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-6 btn-primary"
                >
                  Continue to Payment
                </button>
              )}
            </div>

            {/* Step 2: Payment Information */}
            {step >= 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= 2
                        ? "bg-craft-600 text-white"
                        : "bg-warm-200 text-warm-600"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-earth-900">
                    Payment Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          cardNumber: e.target.value,
                        }))
                      }
                      className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-earth-900 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) =>
                          setPaymentInfo((prev) => ({
                            ...prev,
                            expiryDate: e.target.value,
                          }))
                        }
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-earth-900 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) =>
                          setPaymentInfo((prev) => ({
                            ...prev,
                            cvv: e.target.value,
                          }))
                        }
                        className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-900 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          nameOnCard: e.target.value,
                        }))
                      }
                      className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6 p-4 bg-green-50 rounded-lg">
                  <Lock className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-700">
                    Your payment information is secure and encrypted
                  </span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  className="w-full mt-6 btn-primary"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
              <h2 className="text-xl font-semibold text-earth-900 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex space-x-3">
                    <img
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-earth-900 text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-earth-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-craft-600">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-warm-200">
                <div className="flex justify-between text-sm">
                  <span className="text-earth-600">Subtotal</span>
                  <span className="text-earth-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-earth-600">Shipping</span>
                  <span className="text-earth-900">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-earth-600">Tax</span>
                  <span className="text-earth-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-warm-200">
                  <span className="text-lg font-semibold text-earth-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-craft-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
