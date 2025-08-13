import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../lib/types';
import { useCartStore, useWishlistStore } from '../lib/store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link 
      to={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-sm border border-warm-100 hover:shadow-lg transition-all duration-200 hover-lift block"
    >
      <div className="relative">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {/* Handmade Badge */}
          {product.isHandmade && (
            <div className="absolute top-2 right-2 bg-craft-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Handmade
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              product.isHandmade ? 'top-10' : ''
            } ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-earth-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add to Cart Button */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full bg-white text-earth-800 py-2 px-4 rounded-lg font-medium hover:bg-craft-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={product.seller.avatar || '/placeholder.svg'}
                alt={product.seller.name || 'Seller'}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs text-earth-600">
                {product.seller.businessName || product.seller.name || 'Unknown Seller'}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-earth-900 mb-2 line-clamp-2 group-hover:text-craft-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-earth-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-earth-600">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-craft-600">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-earth-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Materials */}
          {product.materials && product.materials.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {product.materials.slice(0, 3).map((material, index) => (
                  <span
                    key={index}
                    className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full"
                  >
                    {material}
                  </span>
                ))}
                {product.materials.length > 3 && (
                  <span className="text-xs text-earth-500">
                    +{product.materials.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
