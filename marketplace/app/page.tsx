'use client'

import React, { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import HeroSection from '@/components/layout/HeroSection'
import CategoriesSection from '@/components/layout/CategoriesSection'
import ProductGrid from '@/components/product/ProductGrid'
import FeaturedSellers from '@/components/seller/FeaturedSellers'
import { Product } from '@/lib/types'
import { ProductsApi } from '@/lib/api/client'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        // Load trending products
        const trendingResponse = await ProductsApi.getTrendingProducts(8)
        if (trendingResponse.success && trendingResponse.data) {
          setTrendingProducts(trendingResponse.data)
        }

        // Load new products
        const newResponse = await ProductsApi.getNewProducts(6)
        if (newResponse.success && newResponse.data) {
          setNewProducts(newResponse.data)
        }
      } catch (error) {
        console.error('Error loading homepage data:', error)
        toast.error('Failed to load products. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-craft-200 border-t-craft-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-craft-600">Loading beautiful crafts...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid
              products={trendingProducts}
              title="Trending Now"
              subtitle="Discover the most popular handcrafted items loved by our community"
              columns={4}
            />
          </div>
        </section>
      )}

      {/* Categories Section */}
      <CategoriesSection />

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid
              products={newProducts}
              title="New Arrivals"
              subtitle="Fresh handmade treasures just added by our talented artisans"
              columns={3}
            />
          </div>
        </section>
      )}

      {/* Customization Feature Highlight */}
      <section className="py-16 bg-gradient-to-r from-craft-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-craft-800 mb-4">
              Make It Uniquely Yours
            </h2>
            <p className="text-lg text-craft-600 mb-8 max-w-2xl mx-auto">
              Many of our products can be customized to your preferences. Add personal touches, choose colors, or request special modifications.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-craft-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✏️</span>
                </div>
                <h3 className="font-semibold text-craft-800 mb-2">Personalize</h3>
                <p className="text-craft-600 text-sm">Add custom text, names, or special messages</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold text-craft-800 mb-2">Choose Colors</h3>
                <p className="text-craft-600 text-sm">Select from available colors or request custom shades</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📏</span>
                </div>
                <h3 className="font-semibold text-craft-800 mb-2">Adjust Size</h3>
                <p className="text-craft-600 text-sm">Modify dimensions to fit your specific needs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      <FeaturedSellers />

      {/* Instagram/Social Picks */}
      <section className="py-16 bg-gradient-to-r from-sage-50 to-craft-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-craft-800 mb-4">
              Instagram Picks
            </h2>
            <p className="text-lg text-craft-600 max-w-2xl mx-auto">
              Curated selections featured on our social media, loved by thousands of craft enthusiasts
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-soft hover:shadow-warm transition-all duration-300 group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-craft-100 to-warm-100 flex items-center justify-center">
                  <span className="text-craft-400 text-2xl">📸</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/craftmart"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Follow @craftmart
            </a>
          </div>
        </div>
      </section>

      {/* No Products Fallback */}
      {!isLoading && trendingProducts.length === 0 && newProducts.length === 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-craft-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎨</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-craft-800 mb-4">
                Crafts Coming Soon
              </h3>
              <p className="text-craft-600 mb-6">
                Our talented artisans are preparing beautiful handmade treasures. Check back soon for amazing products!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}

export default HomePage
