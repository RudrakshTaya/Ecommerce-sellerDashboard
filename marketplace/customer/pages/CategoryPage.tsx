import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, List, ChevronDown, Filter, Star, Heart, ShoppingCart } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../lib/api';
import { Product, Category } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { useCartStore, useUIStore } from '../lib/store';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { addItem } = useCartStore();
  const { showNotification } = useUIStore();

  useEffect(() => {
    if (category) {
      fetchCategoryData();
      fetchProducts();
    }
  }, [category, sortBy, currentPage]);

  const fetchCategoryData = async () => {
    try {
      const data = await categoriesAPI.getCategory(category!);
      setCategoryData(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };
      
      const response = await productsAPI.getProductsByCategory(category!, params);
      setProducts(response.data);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product._id,
      product,
      quantity: 1,
      selectedColor: undefined,
      selectedSize: undefined,
    });
    showNotification(`${product.name} added to cart!`, 'success');
  };

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-warm-200 rounded w-1/3"></div>
            <div className="h-4 bg-warm-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="h-48 bg-warm-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-warm-200 rounded mb-2"></div>
                  <div className="h-6 bg-warm-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-earth-600 mb-4">
            <Link to="/" className="hover:text-craft-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{category}</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 mb-2 capitalize">
                {categoryData?.name || category}
              </h1>
              {categoryData?.description && (
                <p className="text-earth-600">{categoryData.description}</p>
              )}
            </div>
            
            {/* View Mode & Sort */}
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-craft-100 text-craft-700' : 'text-earth-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-craft-100 text-craft-700' : 'text-earth-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="appearance-none bg-white border border-warm-200 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-craft-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-earth-600 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border border-warm-200 rounded-lg px-4 py-2 hover:bg-warm-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-earth-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="mt-3 btn-secondary text-sm"
                >
                  Apply Price Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                viewMode === 'grid' ? (
                  <ProductCard key={product._id} product={product} />
                ) : (
                  <div key={product._id} className="bg-white rounded-xl shadow-sm border border-warm-100 p-6 flex space-x-6">
                    <img
                      src={product.images[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-earth-900 mb-2">
                            <Link to={`/products/${product._id}`} className="hover:text-craft-600">
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-earth-600 mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-earth-600 ml-1">
                                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                              </span>
                            </div>
                            <span className="text-sm text-earth-600">
                              {product.sellerId?.storeName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-craft-600">
                                ${product.price?.toFixed(2)}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-lg text-earth-400 line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 border border-warm-200 rounded-lg hover:bg-warm-50">
                                <Heart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex items-center space-x-2 btn-primary"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-craft-600 text-white border-craft-600'
                          : 'border-warm-200 hover:bg-warm-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : !loading && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-earth-900 mb-4">
              No products found in this category
            </h3>
            <p className="text-earth-600 mb-8">
              Try adjusting your filters or browse other categories
            </p>
            <Link to="/products" className="btn-primary">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
