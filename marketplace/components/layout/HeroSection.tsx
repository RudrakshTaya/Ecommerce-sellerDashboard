'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Heart, Palette } from 'lucide-react'
import Button from '@/components/ui/Button'

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-craft-50 via-warm-50 to-sage-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-mesh opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-craft-300 animate-float">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="absolute top-40 right-20 text-warm-300 animate-float" style={{ animationDelay: '1s' }}>
        <Heart className="h-8 w-8" />
      </div>
      <div className="absolute bottom-32 left-20 text-sage-300 animate-float" style={{ animationDelay: '2s' }}>
        <Palette className="h-7 w-7" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-craft-800 leading-tight">
                Discover
                <span className="text-gradient block">Handcrafted</span>
                Treasures
              </h1>
              <p className="text-lg md:text-xl text-craft-600 max-w-lg">
                Connect with talented artisans and discover unique, customizable pieces crafted with love and tradition. Every purchase supports independent creators.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/categories">
                <Button size="lg" className="group">
                  Explore Collections
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/customizable">
                <Button variant="secondary" size="lg">
                  Custom Orders
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-craft-100 rounded-full flex items-center justify-center">
                  <span className="text-craft-600 font-semibold text-sm">5k+</span>
                </div>
                <span className="text-craft-600 text-sm">Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center">
                  <span className="text-warm-600 font-semibold text-sm">500+</span>
                </div>
                <span className="text-craft-600 text-sm">Verified Artisans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                  <span className="text-sage-600 font-semibold text-sm">10k+</span>
                </div>
                <span className="text-craft-600 text-sm">Unique Products</span>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Images */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="grid grid-cols-2 gap-4">
              {/* Main Featured Image */}
              <div className="col-span-2 relative h-64 rounded-2xl overflow-hidden shadow-warm">
                <Image
                  src="/images/hero-main.jpg"
                  alt="Handcrafted pottery and ceramics"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Featured Collection</p>
                  <p className="text-lg font-serif">Artisan Pottery</p>
                </div>
              </div>

              {/* Secondary Images */}
              <div className="relative h-32 rounded-xl overflow-hidden shadow-soft">
                <Image
                  src="/images/hero-jewelry.jpg"
                  alt="Handmade jewelry"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Jewelry</p>
                </div>
              </div>

              <div className="relative h-32 rounded-xl overflow-hidden shadow-soft">
                <Image
                  src="/images/hero-textiles.jpg"
                  alt="Handwoven textiles"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-xs font-medium">Textiles</p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-warm animate-float">
              <div className="text-center">
                <p className="text-sm font-semibold text-craft-800">100%</p>
                <p className="text-xs text-craft-600">Handmade</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 fill-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
