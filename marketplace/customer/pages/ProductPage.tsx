import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Share,
  Badge
} from 'lucide-react';
import { productsAPI } from '../lib/api';
import { useCartStore, useWishlistStore, useUIStore } from '../lib/store';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { showNotification } = useUIStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id!),
    enabled: !!id,
    retry: 1,
  });

  const isWishlisted = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      showNotification(`Added ${product.name} to cart!`, 'success');
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      if (isWishlisted) {
        removeFromWishlist(product._id);
        showNotification('Removed from wishlist', 'info');
      } else {
        addToWishlist(product);
        showNotification('Added to wishlist!', 'success');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copy URL
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link copied to clipboard!', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="w-full h-96 bg-warm-200 rounded-xl animate-pulse" />
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-warm-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="h-8 bg-warm-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-warm-200 rounded w-1/2 animate-pulse" />
                <div className="h-6 bg-warm-200 rounded w-1/4 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-warm-200 rounded animate-pulse" />
                <div className="h-4 bg-warm-200 rounded animate-pulse" />
                <div className="h-4 bg-warm-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-earth-900 mb-4">Product Not Found</h1>
            <p className="text-lg text-earth-600 mb-8">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Go Back
              </button>
              <Link to="/products" className="btn-primary">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.svg'];
  const currentImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-earth-600 mb-8">
          <Link to="/" className="hover:text-craft-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-craft-600">Products</Link>
          <span>/</span>
          <span className="text-earth-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-warm-100">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-96 object-cover"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-earth-600" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-earth-600" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.isHandmade && (
                  <span className="bg-craft-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Handmade
                  </span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? 'border-craft-500'
                        : 'border-warm-200 hover:border-craft-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-earth-900">{product.name}</h1>
                <button
                  onClick={handleShare}
                  className="p-2 text-earth-600 hover:text-craft-600 transition-colors"
                >
                  <Share className="w-5 h-5" />
                </button>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={product.seller.avatar || '/placeholder.svg'}
                    alt={product.seller.name || 'Seller'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <Link
                    to={`/sellers/${product.seller._id}`}
                    className="font-medium text-craft-600 hover:text-craft-700"
                  >
                    {product.seller.businessName || product.seller.name || 'Unknown Seller'}
                  </Link>
                  {product.seller.isVerified && (
                    <Badge className="w-4 h-4 text-green-500" />
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-earth-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-earth-600">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-craft-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-earth-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-earth-900 mb-3">Description</h3>
              <p className="text-earth-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-earth-900 mb-3">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <span
                      key={index}
                      className="bg-sage-100 text-sage-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions */}
            {product.dimensions && (
              <div>
                <h3 className="text-lg font-semibold text-earth-900 mb-3">Dimensions</h3>
                <div className="bg-warm-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.dimensions.length && (
                      <div>
                        <span className="text-earth-600">Length:</span>
                        <span className="ml-2 font-medium">{product.dimensions.length} cm</span>
                      </div>
                    )}
                    {product.dimensions.width && (
                      <div>
                        <span className="text-earth-600">Width:</span>
                        <span className="ml-2 font-medium">{product.dimensions.width} cm</span>
                      </div>
                    )}
                    {product.dimensions.height && (
                      <div>
                        <span className="text-earth-600">Height:</span>
                        <span className="ml-2 font-medium">{product.dimensions.height} cm</span>
                      </div>
                    )}
                    {product.dimensions.weight && (
                      <div>
                        <span className="text-earth-600">Weight:</span>
                        <span className="ml-2 font-medium">{product.dimensions.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.stock > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-earth-900">Quantity:</label>
                <div className="flex items-center space-x-3 bg-warm-50 rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-earth-600" />
                  </button>
                  <span className="font-medium text-earth-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-1 hover:bg-warm-200 rounded-md transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <ChevronRight className="w-4 h-4 text-earth-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-warm-200 text-earth-600 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-warm-200">
              <div className="flex items-center space-x-3 text-sm text-earth-600">
                <Truck className="w-5 h-5 text-craft-600" />
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-earth-600">
                <RotateCcw className="w-5 h-5 text-craft-600" />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-earth-600">
                <Shield className="w-5 h-5 text-craft-600" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
