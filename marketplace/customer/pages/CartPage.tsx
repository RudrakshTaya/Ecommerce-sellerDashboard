import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCartStore, useAuthStore } from '../lib/store';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getCartCount
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-warm-400" />
            </div>
            <h1 className="text-3xl font-bold text-earth-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-earth-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any handmade treasures to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
              <Link to="/" className="btn-secondary">
                Browse Featured
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-earth-900 mb-2">Shopping Cart</h1>
            <p className="text-earth-600">{getCartCount()} items in your cart</p>
          </div>
          <Link
            to="/products"
            className="flex items-center space-x-2 text-craft-600 hover:text-craft-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-warm-100">
              <div className="p-6 border-b border-warm-200">
                <h2 className="text-lg font-semibold text-earth-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-warm-100">
                {items.map((item) => (
                  <div key={item.productId} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-earth-900 mb-1">
                              <Link
                                to={`/products/${item.product._id}`}
                                className="hover:text-craft-600 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-earth-600 mb-2">
                              by {item.product.seller.businessName || item.product.seller.name}
                            </p>

                            {/* Materials */}
                            {item.product.materials && item.product.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.product.materials.slice(0, 2).map((material, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full"
                                  >
                                    {material}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center space-x-2 mb-4">
                              <span className="text-lg font-semibold text-craft-600">
                                ${item.product.price.toFixed(2)}
                              </span>
                              {item.product.originalPrice && (
                                <span className="text-sm text-earth-400 line-through">
                                  ${item.product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3 bg-warm-50 rounded-lg p-2">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                              >
                                <Minus className="w-4 h-4 text-earth-600" />
                              </button>
                              <span className="font-medium text-earth-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                              >
                                <Plus className="w-4 h-4 text-earth-600" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-warm-100">
                          <span className="text-earth-600">Item Total:</span>
                          <span className="text-lg font-semibold text-earth-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 border-t border-warm-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-warm-100 sticky top-8">
              <div className="p-6 border-b border-warm-200">
                <h2 className="text-lg font-semibold text-earth-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-earth-600">Subtotal ({getCartCount()} items)</span>
                  <span className="font-medium text-earth-900">${subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-earth-600">Shipping</span>
                  <span className="font-medium text-earth-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Free Shipping Message */}
                {subtotal < 100 && (
                  <div className="text-sm text-craft-600 bg-craft-50 p-3 rounded-lg">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                {/* Tax */}
                <div className="flex justify-between">
                  <span className="text-earth-600">Tax</span>
                  <span className="font-medium text-earth-900">${tax.toFixed(2)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between pt-4 border-t border-warm-200">
                  <span className="text-lg font-semibold text-earth-900">Total</span>
                  <span className="text-xl font-bold text-craft-600">${total.toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary mt-6 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>

                {/* Security Message */}
                <p className="text-xs text-earth-500 text-center mt-4">
                  🔒 Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
