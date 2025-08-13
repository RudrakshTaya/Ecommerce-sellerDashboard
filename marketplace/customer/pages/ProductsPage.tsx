import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Grid, List, SlidersHorizontal, Search } from 'lucide-react';
import { productsAPI } from '../lib/api';
import { useSearchStore } from '../lib/store';
import ProductCard from '../components/ProductCard';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { query, setQuery, filters, setFilters } = useSearchStore();

  const searchQuery = searchParams.get('search') || query;
  const category = searchParams.get('category') || filters.category;
  const sortBy = searchParams.get('sort') || filters.sortBy || 'createdAt';
  const page = parseInt(searchParams.get('page') || '1');

  const queryParams = {
    query: searchQuery,
    filters: {
      category,
      sortBy,
      sortOrder: filters.sortOrder || 'desc' as 'desc',
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      isHandmade: filters.isHandmade,
      inStock: filters.inStock,
    },
    page,
    limit: 12,
  };

  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsAPI.getProducts(queryParams),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  const handleSearch = (searchValue: string) => {
    setQuery(searchValue);
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set('search', searchValue);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value.toString());
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-earth-900 mb-4">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-earth-600">
            Discover unique handmade crafts from talented artisans
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for handmade crafts..."
                  value={searchQuery || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-lg focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400 w-5 h-5" />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="border border-warm-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
              >
                <option value="createdAt">Newest</option>
                <option value="-createdAt">Oldest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
                <option value="-name">Name: Z to A</option>
              </select>

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

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-warm-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Category
                  </label>
                  <select
                    value={category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Art">Art</option>
                    <option value="Bath & Body">Bath & Body</option>
                    <option value="Baby & Kids">Baby & Kids</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="$0"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="$999"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                  />
                </div>

                {/* Handmade Filter */}
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">
                    Product Type
                  </label>
                  <select
                    value={filters.isHandmade === true ? 'handmade' : filters.isHandmade === false ? 'manufactured' : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('isHandmade', value === 'handmade' ? true : value === 'manufactured' ? false : undefined);
                    }}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-craft-500 focus:border-craft-500"
                  >
                    <option value="">All Products</option>
                    <option value="handmade">Handmade Only</option>
                    <option value="manufactured">Manufactured</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-earth-600">
              {pagination ? (
                <>
                  Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalItems)} of {pagination.totalItems} products
                </>
              ) : (
                `${products.length} products found`
              )}
            </p>
          </div>
        )}

        {/* Products Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="w-full h-48 bg-warm-200 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-warm-200 rounded w-3/4" />
                  <div className="h-4 bg-warm-200 rounded w-1/2" />
                  <div className="h-4 bg-warm-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">Error Loading Products</h3>
            <p className="text-earth-600 mb-6">Sorry, we couldn't load the products. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-warm-400" />
            </div>
            <h3 className="text-xl font-semibold text-earth-900 mb-2">No Products Found</h3>
            <p className="text-earth-600 mb-6">
              {searchQuery
                ? `No products match your search for "${searchQuery}"`
                : 'No products available at the moment'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="btn-primary"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50 transition-colors"
                >
                  Previous
                </button>

                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  const pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === pagination.currentPage
                          ? 'bg-craft-600 text-white'
                          : 'border border-warm-200 hover:bg-warm-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
