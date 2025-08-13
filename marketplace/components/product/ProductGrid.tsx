'use client'

import React from 'react'
import { Product } from '@/lib/types'
import ProductCard from './ProductCard'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Product[]
  className?: string
  title?: string
  subtitle?: string
  showQuickAdd?: boolean
  columns?: 2 | 3 | 4 | 5 | 6
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className,
  title,
  subtitle,
  showQuickAdd = true,
  columns = 4
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-craft-500">No products found.</p>
      </div>
    )
  }

  return (
    <section className={cn('space-y-8', className)}>
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-craft-800">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-craft-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={cn('grid gap-6', gridCols[columns])}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickAdd={showQuickAdd}
          />
        ))}
      </div>
    </section>
  )
}

export default ProductGrid
