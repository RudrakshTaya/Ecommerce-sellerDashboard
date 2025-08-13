'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCartStore, useWishlistStore, useAuthStore, useUIStore } from '@/lib/store'

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const cartItems = useCartStore(state => state.getTotalItems())
  const wishlistItems = useWishlistStore(state => state.items.length)
  const { isAuthenticated, customer } = useAuthStore()
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Customizable', href: '/customizable' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Trending', href: '/trending' },
    { name: 'Sellers', href: '/sellers' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-craft-500 text-white py-2 px-4 text-center text-sm">
        <p>🎨 Free shipping on orders over ₹999 | ✨ Handcrafted with love</p>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-soft border-b border-craft-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-craft-500 to-warm-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎨</span>
              </div>
              <span className="text-xl font-serif font-semibold text-craft-800">
                CraftMart
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="search-bar">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for handmade crafts, art, jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus:ring-0 rounded-none"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Button type="submit" size="sm" className="rounded-l-none">
                  Search
                </Button>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <button className="md:hidden p-2 text-craft-600 hover:text-craft-800">
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-craft-600 hover:text-craft-800">
                <Heart className="h-5 w-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-craft-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-craft-600 hover:text-craft-800">
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-craft-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <Link href="/account" className="p-2 text-craft-600 hover:text-craft-800">
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-craft-600 hover:text-craft-800"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-craft-100 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="search-bar">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search crafts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus:ring-0"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Button type="submit" size="sm">
                  Search
                </Button>
              </form>

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block py-2 text-craft-700 hover:text-craft-800 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-craft-100 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
