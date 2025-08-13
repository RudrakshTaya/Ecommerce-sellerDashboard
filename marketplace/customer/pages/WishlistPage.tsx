import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Grid, List, Share, Filter } from 'lucide-react';
import { useWishlistStore, useCartStore, useUIStore } from '../lib/store';
import ProductCard from '../components/ProductCard';

const WishlistPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('dateAdded');

  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showNotification } = useUIStore();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    showNotification(`Added ${product.name} to cart!`, 'success');
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
    showNotification('Removed from wishlist', 'info');
  };

  const handleShare = async (product: any) => {
    const url = `${window.location.origin}/products/${product._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url,
        });
      } catch (error) {
        navigator.clipboard.writeText(url);
        showNotification('Link copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(url);
      showNotification('Link copied to clipboard!', 'success');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case '-price':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case '-name':
        return b.name.localeCompare(a.name);
      case 'dateAdded':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-warm-400" />
            </div>
            <h1 className="text-3xl font-bold text-earth-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-lg text-earth-600 mb-8 max-w-md mx-auto">
              Save your favorite handmade crafts here for easy shopping later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                Discover Crafts
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
            <h1 className="text-3xl font-bold text-earth-900 mb-2">My Wishlist</h1>
            <p className="text-earth-600">{items.length} saved items</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Sort */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-earth-900">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name: A to Z</option>
                <option value="-name">Name: Z to A</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-warm-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-craft-600 shadow-sm'
                    : 'text-earth-600 hover:text-craft-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-craft-600 shadow-sm'
                    : 'text-earth-600 hover:text-craft-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Link
                          to={`/products/${product._id}`}
                          className="text-xl font-semibold text-earth-900 hover:text-craft-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-earth-600 mt-1">
                          by {product.seller.businessName || product.seller.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleShare(product)}
                          className="p-2 text-earth-600 hover:text-craft-600 transition-colors"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(product._id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-earth-700 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Materials */}
                    {product.materials && product.materials.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
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
                    )}

                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-craft-600">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-lg text-earth-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-2">
                      <span className={`text-xs font-medium ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
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

export default WishlistPage;
