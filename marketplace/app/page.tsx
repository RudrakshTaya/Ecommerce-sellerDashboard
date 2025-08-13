'use client'

import React, { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import HeroSection from '@/components/layout/HeroSection'
import CategoriesSection from '@/components/layout/CategoriesSection'
import ProductGrid from '@/components/product/ProductGrid'
import FeaturedSellers from '@/components/seller/FeaturedSellers'
import { Product } from '@/lib/types'

// Mock data for development - replace with actual API calls
const mockTrendingProducts: Product[] = [
  {
    id: '1',
    _id: '1',
    name: 'Handcrafted Ceramic Vase',
    description: 'Beautiful handmade ceramic vase with traditional patterns',
    price: 1299,
    originalPrice: 1599,
    sku: 'VAZ001',
    category: 'pottery',
    image: '/images/product-1.jpg',
    images: [],
    stock: 5,
    lowStockThreshold: 5,
    inStock: true,
    materials: ['Clay', 'Ceramic Glaze'],
    colors: ['Blue', 'White'],
    sizes: ['Medium'],
    tags: ['handmade', 'ceramic', 'vase'],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 5,
    origin: 'Jaipur, India',
    careInstructions: ['Hand wash only', 'Avoid direct sunlight'],
    certifications: ['Handmade Certificate'],
    faq: [],
    sellerId: '1',
    rating: 4.8,
    reviews: 24,
    badges: ['trending', 'handmade'],
    status: 'active',
    views: 150,
    clicks: 35,
    orders: 12,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    discountPercentage: 19,
    vendor: {
      name: 'Artisan Clay Works',
      location: 'Jaipur',
      rating: 4.9
    }
  },
  {
    id: '2',
    _id: '2',
    name: 'Silver Ethnic Necklace',
    description: 'Exquisite silver necklace with traditional motifs',
    price: 3999,
    originalPrice: 4999,
    sku: 'NEK002',
    category: 'jewelry',
    image: '/images/product-2.jpg',
    images: [],
    stock: 3,
    lowStockThreshold: 5,
    inStock: true,
    materials: ['Sterling Silver', 'Gemstones'],
    colors: ['Silver'],
    sizes: ['One Size'],
    tags: ['jewelry', 'silver', 'necklace'],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: true,
    deliveryDays: 7,
    origin: 'Udaipur, India',
    careInstructions: ['Clean with soft cloth', 'Store in dry place'],
    certifications: ['BIS Hallmark', 'Handmade Certificate'],
    faq: [],
    sellerId: '2',
    rating: 4.9,
    reviews: 18,
    badges: ['new', 'custom', 'handmade'],
    status: 'active',
    views: 89,
    clicks: 23,
    orders: 8,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
    discountPercentage: 20,
    vendor: {
      name: 'Silver Dreams Jewelry',
      location: 'Udaipur',
      rating: 4.8
    }
  },
  {
    id: '3',
    _id: '3',
    name: 'Handwoven Silk Scarf',
    description: 'Luxurious silk scarf with traditional handloom patterns',
    price: 2199,
    sku: 'SCR003',
    category: 'textiles',
    image: '/images/product-3.jpg',
    images: [],
    stock: 8,
    lowStockThreshold: 5,
    inStock: true,
    materials: ['Pure Silk'],
    colors: ['Red', 'Gold', 'Blue'],
    sizes: ['One Size'],
    tags: ['silk', 'scarf', 'handwoven'],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 4,
    origin: 'Varanasi, India',
    careInstructions: ['Dry clean only', 'Iron on low heat'],
    certifications: ['Handloom Certificate'],
    faq: [],
    sellerId: '3',
    rating: 4.7,
    reviews: 31,
    badges: ['new', 'handmade'],
    status: 'active',
    views: 67,
    clicks: 12,
    orders: 5,
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z',
    vendor: {
      name: 'Threads of Heritage',
      location: 'Varanasi',
      rating: 4.9
    }
  },
  {
    id: '4',
    _id: '4',
    name: 'Wooden Carved Bowl Set',
    description: 'Set of 3 hand-carved wooden bowls with intricate designs',
    price: 1899,
    originalPrice: 2399,
    sku: 'BWL004',
    category: 'woodwork',
    image: '/images/product-4.jpg',
    images: [],
    stock: 12,
    lowStockThreshold: 5,
    inStock: true,
    materials: ['Sheesham Wood'],
    colors: ['Natural Wood'],
    sizes: ['Set of 3'],
    tags: ['wooden', 'bowls', 'carved'],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 6,
    origin: 'Mysore, India',
    careInstructions: ['Hand wash only', 'Oil occasionally'],
    certifications: ['Handmade Certificate'],
    faq: [],
    sellerId: '4',
    rating: 4.6,
    reviews: 19,
    badges: ['trending', 'custom', 'handmade'],
    status: 'active',
    views: 94,
    clicks: 21,
    orders: 9,
    createdAt: '2024-01-12T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z',
    discountPercentage: 21,
    vendor: {
      name: 'Wooden Wonders',
      location: 'Mysore',
      rating: 4.7
    }
  }
]

const mockNewProducts: Product[] = [
  {
    id: '5',
    _id: '5',
    name: 'Abstract Canvas Painting',
    description: 'Original abstract painting on canvas with vibrant colors',
    price: 4999,
    sku: 'ART005',
    category: 'art',
    image: '/images/product-5.jpg',
    images: [],
    stock: 1,
    lowStockThreshold: 1,
    inStock: true,
    materials: ['Canvas', 'Acrylic Paint'],
    colors: ['Multi-color'],
    sizes: ['24x36 inches'],
    tags: ['painting', 'abstract', 'original'],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 3,
    origin: 'Mumbai, India',
    careInstructions: ['Avoid direct sunlight', 'Dust gently'],
    certifications: ['Original Art Certificate'],
    faq: [],
    sellerId: '5',
    rating: 4.8,
    reviews: 7,
    badges: ['new', 'custom', 'handmade'],
    status: 'active',
    views: 45,
    clicks: 8,
    orders: 2,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
    vendor: {
      name: 'Canvas & Colors',
      location: 'Mumbai',
      rating: 4.8
    }
  },
  {
    id: '6',
    _id: '6',
    name: 'Eco-Friendly Tote Bag',
    description: 'Handmade tote bag from recycled materials with embroidered designs',
    price: 899,
    sku: 'BAG006',
    category: 'accessories',
    image: '/images/product-6.jpg',
    images: [],
    stock: 15,
    lowStockThreshold: 5,
    inStock: true,
    materials: ['Recycled Cotton', 'Organic Thread'],
    colors: ['Green', 'Brown', 'Blue'],
    sizes: ['Large'],
    tags: ['eco-friendly', 'tote', 'embroidered'],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 4,
    origin: 'Ahmedabad, India',
    careInstructions: ['Machine wash cold', 'Air dry'],
    certifications: ['Eco-Friendly Certificate'],
    faq: [],
    sellerId: '6',
    rating: 4.5,
    reviews: 12,
    badges: ['new', 'custom', 'handmade'],
    status: 'active',
    views: 73,
    clicks: 15,
    orders: 6,
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
    vendor: {
      name: 'Eco Craft Studio',
      location: 'Ahmedabad',
      rating: 4.9
    }
  }
]

const HomePage: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTrendingProducts(mockTrendingProducts)
      setNewProducts(mockNewProducts)
      setIsLoading(false)
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

      {/* Categories Section */}
      <CategoriesSection />

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid
            products={newProducts}
            title="New Arrivals"
            subtitle="Fresh handmade treasures just added by our talented artisans"
            columns={4}
          />
        </div>
      </section>

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
    </Layout>
  )
}

export default HomePage
