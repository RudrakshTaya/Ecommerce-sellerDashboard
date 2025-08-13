import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'new' | 'trending' | 'handmade' | 'custom' | 'sale' | 'verified' | 'default'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200'
  
  const variants = {
    new: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    trending: 'bg-orange-100 text-orange-800 border border-orange-200',
    handmade: 'bg-craft-100 text-craft-800 border border-craft-200',
    custom: 'bg-sage-100 text-sage-800 border border-sage-200',
    sale: 'bg-red-100 text-red-800 border border-red-200',
    verified: 'bg-blue-100 text-blue-800 border border-blue-200',
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Badge
