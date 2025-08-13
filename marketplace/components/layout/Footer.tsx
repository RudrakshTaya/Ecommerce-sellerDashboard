'use client'

import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
  }

  return (
    <footer className="bg-craft-800 text-white">
      {/* Newsletter Section */}
      <div className="bg-craft-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-semibold mb-4">
              Stay Connected with Artisans
            </h3>
            <p className="text-craft-200 mb-6 max-w-2xl mx-auto">
              Get the latest updates on new collections, featured artisans, and exclusive handmade treasures delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder-white/60"
              />
              <Button variant="secondary" type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-craft-500 to-warm-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎨</span>
              </div>
              <span className="text-xl font-serif font-semibold">CraftMart</span>
            </div>
            <p className="text-craft-200 mb-4">
              Celebrating handmade craftsmanship and connecting artisans with craft lovers worldwide. Every piece tells a story.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-craft-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-craft-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-craft-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/categories/jewelry" className="text-craft-200 hover:text-white transition-colors">Jewelry</Link></li>
              <li><Link href="/categories/pottery" className="text-craft-200 hover:text-white transition-colors">Pottery & Ceramics</Link></li>
              <li><Link href="/categories/textiles" className="text-craft-200 hover:text-white transition-colors">Textiles & Fabrics</Link></li>
              <li><Link href="/categories/woodwork" className="text-craft-200 hover:text-white transition-colors">Woodwork</Link></li>
              <li><Link href="/categories/art" className="text-craft-200 hover:text-white transition-colors">Art & Paintings</Link></li>
              <li><Link href="/customizable" className="text-craft-200 hover:text-white transition-colors">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-craft-200 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/shipping" className="text-craft-200 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-craft-200 hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/size-guide" className="text-craft-200 hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/care-instructions" className="text-craft-200 hover:text-white transition-colors">Care Instructions</Link></li>
              <li><Link href="/contact" className="text-craft-200 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-craft-300" />
                <span className="text-craft-200">+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-craft-300" />
                <span className="text-craft-200">hello@craftmart.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-craft-300 mt-0.5" />
                <span className="text-craft-200">
                  123 Artisan Street,<br />
                  Craft District, Mumbai 400001
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-craft-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-craft-200 text-sm">
              <p>&copy; 2024 CraftMart. All rights reserved. Made with ❤️ for artisans.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-craft-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-craft-200 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/sellers/join" className="text-craft-200 hover:text-white transition-colors">
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
