# CraftMart - Handmade Crafts Multi-Seller Marketplace

A beautiful, modern e-commerce marketplace for handmade crafts, connecting artisans with customers worldwide. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Features

### Core Marketplace Features
- **Multi-seller platform** - Support for multiple independent artisans/sellers
- **Product browsing** - Categories, search, filtering, and sorting
- **Shopping cart & wishlist** - Full e-commerce functionality
- **User authentication** - Customer registration and login
- **Responsive design** - Mobile-first, optimized for all devices

### Handmade Focus
- **Artisan profiles** - Showcase seller stories and specialties
- **Customization options** - Support for custom orders and personalization
- **Handmade badges** - Clear indicators for handcrafted items
- **Quality assurance** - Trust badges and verification system

### User Experience
- **Warm, artisanal design** - Earth tones and organic shapes
- **Modern UI components** - Built with Radix UI and Tailwind CSS
- **Fast performance** - Optimized images and lazy loading
- **Accessibility** - WCAG compliant design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Clone and navigate to marketplace folder**
   ```bash
   cd marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3001
   ```

## 🏗️ Project Structure

```
marketplace/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── product/           # Product-related components
│   ├── seller/            # Seller-related components
│   ├── cart/              # Shopping cart components
│   ├── auth/              # Authentication components
│   └── search/            # Search components
├── lib/                   # Utilities and configuration
│   ├── api/               # API client functions
│   ├── store/             # Zustand state management
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
├── public/                # Static assets
└── hooks/                 # Custom React hooks
```

## 🎨 Design System

### Color Palette
- **Craft**: Warm terracotta tones `#dd9658` to `#6f4331`
- **Earth**: Natural brown tones `#a48b6f` to `#53453a` 
- **Warm**: Sunset orange tones `#e2944d` to `#72442a`
- **Sage**: Soft green tones `#828e6a` to `#3a3f30`

### Typography
- **Sans-serif**: Inter (body text)
- **Serif**: Playfair Display (headings)
- **Handwritten**: Dancing Script (accents)

### Components
- Buttons with hover animations
- Cards with soft shadows
- Badges for product attributes
- Responsive image galleries
- Loading states and skeletons

## 🛍️ Key Components

### HomePage
- Hero section with call-to-action
- Trending products showcase
- Category navigation
- New arrivals section
- Featured artisans
- Instagram picks

### ProductCard
- Product images with badges
- Seller attribution
- Rating and reviews
- Price with discounts
- Quick add to cart
- Wishlist functionality

### Layout Components
- Responsive header with navigation
- Search functionality
- Shopping cart preview
- Footer with links and newsletter

## 🔧 State Management

Using Zustand for client-side state:

- **Cart Store**: Shopping cart items and quantities
- **Wishlist Store**: Saved products for later
- **Auth Store**: User authentication state
- **Search Store**: Search queries and filters
- **UI Store**: Modal states and mobile menu

## 🌐 API Integration

### Public Endpoints
- `GET /api/public/products` - Browse all products
- `GET /api/public/products/:id` - Get product details
- `GET /api/public/trending` - Trending products
- `GET /api/public/new` - New arrivals
- `GET /api/public/customizable` - Customizable products
- `GET /api/public/categories` - Product categories
- `GET /api/public/search` - Search products

### Authentication
- Customer registration and login
- Profile management
- Order history

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: 
  - sm: 640px
  - md: 768px  
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=CraftMart
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Advanced search filters
- [ ] Customer reviews and ratings
- [ ] Order tracking
- [ ] Live chat with sellers
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Push notifications

## 📞 Support

For support and questions:
- Email: support@craftmart.com
- Documentation: [docs.craftmart.com](https://docs.craftmart.com)
- Community: [community.craftmart.com](https://community.craftmart.com)
