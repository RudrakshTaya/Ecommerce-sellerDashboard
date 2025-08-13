import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../lib/store';

const CartSidebar: React.FC = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getCartTotal, 
    getCartCount 
  } = useCartStore();

  const total = getCartTotal();
  const itemCount = getCartCount();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-warm-200">
            <h2 className="text-lg font-semibold text-earth-800 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Shopping Cart ({itemCount})</span>
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-earth-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-earth-300 mb-4" />
                <h3 className="text-lg font-medium text-earth-600 mb-2">Your cart is empty</h3>
                <p className="text-earth-400 mb-6">Discover amazing handmade crafts to fill it up!</p>
                <Link
                  to="/products"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex space-x-3 p-3 bg-warm-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-earth-800 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-earth-600 mt-1">
                        by {item.product.seller.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-craft-600">
                          ${item.product.price.toFixed(2)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3 text-earth-600" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3 text-earth-600" />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-1 hover:bg-red-100 rounded-md transition-colors ml-2"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-warm-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-earth-800">Total:</span>
                <span className="text-xl font-bold text-craft-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full btn-secondary block text-center"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full btn-primary block text-center"
                >
                  Checkout
                </Link>
              </div>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-earth-600 hover:text-craft-600 text-sm font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
