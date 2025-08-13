'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Jewelry & Accessories',
    slug: 'jewelry',
    description: 'Handcrafted necklaces, earrings, and unique accessories',
    image: '/images/category-jewelry.jpg',
    productCount: 1250
  },
  {
    id: '2',
    name: 'Pottery & Ceramics',
    slug: 'pottery',
    description: 'Beautiful pottery, vases, and ceramic art pieces',
    image: '/images/category-pottery.jpg',
    productCount: 890
  },
  {
    id: '3',
    name: 'Textiles & Fabrics',
    slug: 'textiles',
    description: 'Handwoven fabrics, scarves, and textile art',
    image: '/images/category-textiles.jpg',
    productCount: 2100
  },
  {
    id: '4',
    name: 'Wood & Furniture',
    slug: 'woodwork',
    description: 'Handcrafted furniture and wooden decorative items',
    image: '/images/category-woodwork.jpg',
    productCount: 650
  },
  {
    id: '5',
    name: 'Art & Paintings',
    slug: 'art',
    description: 'Original paintings, drawings, and artistic creations',
    image: '/images/category-art.jpg',
    productCount: 1800
  },
  {
    id: '6',
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Unique decorative pieces for your living space',
    image: '/images/category-home.jpg',
    productCount: 1450
  }
]

interface CategoriesSectionProps {
  className?: string
  title?: string
  subtitle?: string
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  className,
  title = "Shop by Category",
  subtitle = "Discover unique handmade treasures across our curated categories"
}) => {
  return (
    <section className={cn('py-16', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-craft-800 mb-4">
            {title}
          </h2>
          <p className="text-lg text-craft-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="card overflow-hidden h-full transform transition-all duration-300 hover:scale-105">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <ArrowRight className="h-6 w-6 text-craft-700" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-craft-800 mb-2 group-hover:text-craft-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-craft-600 mb-3 text-sm">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-craft-500">
                      {category.productCount.toLocaleString()} items
                    </span>
                    <span className="text-sm font-medium text-craft-700 group-hover:text-craft-800 transition-colors">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-8 py-3 bg-craft-100 hover:bg-craft-200 text-craft-800 font-medium rounded-xl transition-all duration-200 group"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
