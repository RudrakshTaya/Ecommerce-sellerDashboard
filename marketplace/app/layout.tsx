import type { Metadata } from 'next'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CraftMart - Handmade Crafts Multi-Seller Marketplace',
  description: 'Discover unique handmade crafts, customizable products, and artisanal treasures from talented creators worldwide. Support independent artisans and find one-of-a-kind pieces.',
  keywords: 'handmade, crafts, artisan, marketplace, customizable, jewelry, pottery, textiles, woodwork, art',
  authors: [{ name: 'CraftMart Team' }],
  creator: 'CraftMart',
  publisher: 'CraftMart',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://craftmart.com',
    title: 'CraftMart - Handmade Crafts Multi-Seller Marketplace',
    description: 'Discover unique handmade crafts, customizable products, and artisanal treasures from talented creators worldwide.',
    siteName: 'CraftMart',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CraftMart - Handmade Crafts Multi-Seller Marketplace',
    description: 'Discover unique handmade crafts, customizable products, and artisanal treasures from talented creators worldwide.',
    creator: '@craftmart',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fdf8f3',
              color: '#6f4331',
              border: '1px solid #f4dfc8',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
