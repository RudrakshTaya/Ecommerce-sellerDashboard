'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, cn, getImageUrl } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useCartStore, useWishlistStore } from '@/lib/store'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className,
  showQuickAdd = true 
}) => {
  const addToCart = useCartStore(state => state.addToCart)
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()
  
  const isWishlisted = isInWishlist(product.id)
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToWishlist(product)
  }

  const getBadges = () => {
    const badges = []
    if (product.isNew) badges.push({ variant: 'new' as const, text: 'New' })
    if (product.isTrending) badges.push({ variant: 'trending' as const, text: 'Trending' })
    if (product.isHandmade) badges.push({ variant: 'handmade' as const, text: 'Handmade' })
    if (product.isCustomizable) badges.push({ variant: 'custom' as const, text: 'Customizable' })
    if (hasDiscount) badges.push({ variant: 'sale' as const, text: `${product.discountPercentage}% OFF` })
    return badges.slice(0, 2) // Show max 2 badges
  }

  return (
    <Link href={`/products/${product.id}`} className={cn('product-card', className)}>
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          
          {/* Badges */}
          {getBadges().length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {getBadges().map((badge, index) => (
                <Badge key={index} variant={badge.variant} size="sm">
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-soft transition-all duration-200 group/wishlist"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isWishlisted 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-craft-400 group-hover/wishlist:text-red-500'
              )} 
            />
          </button>

          {/* Quick Add to Cart (on hover) */}
          {showQuickAdd && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="w-full bg-white text-craft-700 hover:bg-craft-50"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Quick Add' : 'Out of Stock'}
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Seller Info */}
          <p className="text-xs text-craft-500 mb-1">
            by {product.vendor?.name || 'Artisan'}
          </p>

          {/* Product Name */}
          <h3 className="font-medium text-craft-800 mb-2 line-clamp-2 group-hover:text-craft-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-craft-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-craft-500">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-craft-800">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-craft-400 line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
                <Badge variant="sale" size="sm">
                  {product.discountPercentage}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Delivery Info */}
          <p className="text-xs text-craft-500">
            Delivery in {product.deliveryDays} days
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
