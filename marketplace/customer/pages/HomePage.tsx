import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingCart, Palette, Camera, Scissors, Flower } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, sellersAPI } from '../lib/api';
import { useCartStore, useWishlistStore } from '../lib/store';
import ProductCard from '../components/ProductCard';
import SellerCard from '../components/SellerCard';

const HomePage: React.FC = () => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: productsAPI.getFeaturedProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.log('Featured products error:', error);
    },
  });

  const { data: trendingProducts, isLoading: loadingTrending } = useQuery({
    queryKey: ['trendingProducts'],
    queryFn: productsAPI.getTrendingProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.log('Trending products error:', error);
    },
  });

  const { data: featuredSellers, isLoading: loadingSellers } = useQuery({
    queryKey: ['featuredSellers'],
    queryFn: sellersAPI.getFeaturedSellers,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.log('Featured sellers error:', error);
    },
  });

  const categories = [
    {
      name: 'Jewelry',
      icon: Palette,
      description: 'Handcrafted jewelry pieces',
      image: '/placeholder.svg',
      href: '/categories/jewelry',
    },
    {
      name: 'Home Decor',
      icon: Camera,
      description: 'Beautiful home decorations',
      image: '/placeholder.svg',
      href: '/categories/home-decor',
    },
    {
      name: 'Clothing',
      icon: Scissors,
      description: 'Handmade clothing & accessories',
      image: '/placeholder.svg',
      href: '/categories/clothing',
    },
    {
      name: 'Art',
      icon: Flower,
      description: 'Original artwork & prints',
      image: '/placeholder.svg',
      href: '/categories/art',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-craft-100 via-earth-50 to-warm-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-earth-900 leading-tight">
                Discover
                <span className="text-craft-600 block">Handmade</span>
                Treasures
              </h1>
              <p className="text-lg text-earth-700 mt-6 max-w-lg mx-auto lg:mx-0">
                Connect with talented artisans and find unique, one-of-a-kind crafts that tell a story. 
                Every purchase supports creativity and craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center justify-center space-x-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/sellers"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Meet Our Artisans
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/placeholder.svg"
                  alt="Handmade crafts showcase"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.9 Rating</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-craft-600">1000+</div>
                  <div className="text-sm text-earth-600">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-earth-600 max-w-2xl mx-auto">
              Explore our carefully curated categories of handmade crafts from talented artisans
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={category.href}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-warm-100 hover:shadow-lg transition-all duration-200 hover-lift"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-craft-100 to-earth-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-craft-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-earth-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-earth-600">{category.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-warm-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-earth-900 mb-4">Featured Products</h2>
              <p className="text-lg text-earth-600">Handpicked favorites from our artisan community</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center space-x-2 text-craft-600 hover:text-craft-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-12 h-12 text-warm-400" />
              </div>
              <h3 className="text-xl font-semibold text-earth-900 mb-2">No Featured Products</h3>
              <p className="text-earth-600 mb-6">We're working on adding amazing handmade crafts to showcase.</p>
              <Link to="/products" className="btn-primary">
                Browse All Products
              </Link>
            </div>
          )}

          <div className="text-center mt-12 sm:hidden">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-earth-900 mb-4">Trending Now</h2>
              <p className="text-lg text-earth-600">What everyone's talking about</p>
            </div>
            <Link
              to="/products?sort=trending"
              className="hidden sm:flex items-center space-x-2 text-craft-600 hover:text-craft-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingTrending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-warm-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-earth-900 mb-2">No Trending Products Yet</h3>
              <p className="text-earth-600">Check back soon for what's popular in our community!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Sellers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-earth-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth-900 mb-4">Meet Our Artisans</h2>
            <p className="text-lg text-earth-600 max-w-2xl mx-auto">
              Discover the talented creators behind our beautiful handmade crafts
            </p>
          </div>

          {loadingSellers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="w-20 h-20 bg-warm-200 rounded-full mx-auto mb-4" />
                  <div className="space-y-2 text-center">
                    <div className="h-4 bg-warm-200 rounded w-1/2 mx-auto" />
                    <div className="h-4 bg-warm-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-warm-200 rounded w-1/4 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredSellers && featuredSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSellers.slice(0, 3).map((seller) => (
                <SellerCard key={seller._id} seller={seller} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Flower className="w-16 h-16 text-warm-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-earth-900 mb-2">No Featured Artisans Yet</h3>
              <p className="text-earth-600">We're onboarding talented creators to showcase their work.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/sellers" className="btn-primary">
              View All Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-craft-600 to-earth-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Connected with Our Artisan Community
          </h2>
          <p className="text-lg text-craft-100 mb-8">
            Get updates on new collections, featured artisans, and exclusive offers
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 rounded-lg border-0 focus:ring-2 focus:ring-craft-300"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-craft-600 font-semibold rounded-lg hover:bg-craft-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm text-craft-200 mt-4">
            No spam, just beautiful crafts and inspiring stories. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
