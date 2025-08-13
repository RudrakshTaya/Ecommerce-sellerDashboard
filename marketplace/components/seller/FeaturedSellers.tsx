'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Award, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface FeaturedSeller {
  id: string
  storeName: string
  ownerName: string
  location: string
  specialties: string[]
  rating: number
  reviewCount: number
  totalProducts: number
  isVerified: boolean
  avatar: string
  coverImage: string
  description: string
  joinedYear: number
}

const featuredSellers: FeaturedSeller[] = [
  {
    id: '1',
    storeName: 'Artisan Clay Works',
    ownerName: 'Priya Sharma',
    location: 'Jaipur, Rajasthan',
    specialties: ['Pottery', 'Ceramics', 'Traditional Crafts'],
    rating: 4.9,
    reviewCount: 247,
    totalProducts: 89,
    isVerified: true,
    avatar: '/images/seller-1.jpg',
    coverImage: '/images/seller-cover-1.jpg',
    description: 'Creating beautiful pottery with traditional techniques passed down through generations.',
    joinedYear: 2019
  },
  {
    id: '2',
    storeName: 'Silver Dreams Jewelry',
    ownerName: 'Amit Kumar',
    location: 'Udaipur, Rajasthan',
    specialties: ['Silver Jewelry', 'Gemstones', 'Custom Design'],
    rating: 4.8,
    reviewCount: 189,
    totalProducts: 156,
    isVerified: true,
    avatar: '/images/seller-2.jpg',
    coverImage: '/images/seller-cover-2.jpg',
    description: 'Handcrafted silver jewelry with intricate designs and precious gemstones.',
    joinedYear: 2020
  },
  {
    id: '3',
    storeName: 'Threads of Heritage',
    ownerName: 'Meera Devi',
    location: 'Varanasi, Uttar Pradesh',
    specialties: ['Handloom', 'Silk Weaving', 'Textiles'],
    rating: 4.9,
    reviewCount: 312,
    totalProducts: 203,
    isVerified: true,
    avatar: '/images/seller-3.jpg',
    coverImage: '/images/seller-cover-3.jpg',
    description: 'Preserving the art of traditional handloom weaving with contemporary designs.',
    joinedYear: 2018
  },
  {
    id: '4',
    storeName: 'Wooden Wonders',
    ownerName: 'Ravi Chandra',
    location: 'Mysore, Karnataka',
    specialties: ['Wood Carving', 'Furniture', 'Sculptures'],
    rating: 4.7,
    reviewCount: 156,
    totalProducts: 78,
    isVerified: true,
    avatar: '/images/seller-4.jpg',
    coverImage: '/images/seller-cover-4.jpg',
    description: 'Exquisite wood carvings and furniture crafted with precision and passion.',
    joinedYear: 2021
  },
  {
    id: '5',
    storeName: 'Canvas & Colors',
    ownerName: 'Sita Gupta',
    location: 'Mumbai, Maharashtra',
    specialties: ['Paintings', 'Wall Art', 'Custom Portraits'],
    rating: 4.8,
    reviewCount: 203,
    totalProducts: 134,
    isVerified: true,
    avatar: '/images/seller-5.jpg',
    coverImage: '/images/seller-cover-5.jpg',
    description: 'Contemporary and traditional art pieces that bring life to any space.',
    joinedYear: 2020
  },
  {
    id: '6',
    storeName: 'Eco Craft Studio',
    ownerName: 'Kiran Patel',
    location: 'Ahmedabad, Gujarat',
    specialties: ['Eco-friendly', 'Recycled Art', 'Sustainable Crafts'],
    rating: 4.9,
    reviewCount: 178,
    totalProducts: 112,
    isVerified: true,
    avatar: '/images/seller-6.jpg',
    coverImage: '/images/seller-cover-6.jpg',
    description: 'Creating beautiful crafts from recycled materials with environmental consciousness.',
    joinedYear: 2022
  }
]

interface FeaturedSellersProps {
  className?: string
  title?: string
  subtitle?: string
  limit?: number
}

const FeaturedSellers: React.FC<FeaturedSellersProps> = ({
  className,
  title = "Featured Artisans",
  subtitle = "Meet the talented creators behind our beautiful handmade products",
  limit = 6
}) => {
  const displayedSellers = featuredSellers.slice(0, limit)

  return (
    <section className={cn('py-16 bg-craft-25', className)}>
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

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedSellers.map((seller) => (
            <div key={seller.id} className="card overflow-hidden group">
              {/* Cover Image */}
              <div className="relative h-32 overflow-hidden">
                <Image
                  src={seller.coverImage}
                  alt={`${seller.storeName} workshop`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                
                {/* Verified Badge */}
                {seller.isVerified && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="verified" size="sm">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="p-6 relative">
                {/* Avatar */}
                <div className="absolute -top-8 left-6">
                  <div className="w-16 h-16 rounded-full border-4 border-white shadow-soft overflow-hidden">
                    <Image
                      src={seller.avatar}
                      alt={seller.ownerName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="pt-10">
                  {/* Store Name */}
                  <h3 className="text-xl font-semibold text-craft-800 mb-1">
                    {seller.storeName}
                  </h3>
                  
                  {/* Owner Name */}
                  <p className="text-craft-600 mb-2">by {seller.ownerName}</p>

                  {/* Location */}
                  <div className="flex items-center text-sm text-craft-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {seller.location}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-craft-700 ml-1">
                        {seller.rating}
                      </span>
                    </div>
                    <span className="text-sm text-craft-500">
                      ({seller.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-craft-600 mb-4 line-clamp-2">
                    {seller.description}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {seller.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="default" size="sm">
                        {specialty}
                      </Badge>
                    ))}
                    {seller.specialties.length > 2 && (
                      <Badge variant="default" size="sm">
                        +{seller.specialties.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-craft-500 mb-4">
                    <span>{seller.totalProducts} products</span>
                    <span>Since {seller.joinedYear}</span>
                  </div>

                  {/* Action Button */}
                  <Link href={`/sellers/${seller.id}`}>
                    <Button variant="outline" size="sm" className="w-full group">
                      Visit Store
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/sellers">
            <Button variant="secondary" size="lg" className="group">
              Discover All Artisans
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedSellers
