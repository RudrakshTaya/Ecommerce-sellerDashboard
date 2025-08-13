import express from "express";

const router = express.Router();

// Mock featured products
const mockFeaturedProducts = [
  {
    _id: "featured1",
    name: "Handwoven Ceramic Bowl",
    description: "Beautiful handwoven ceramic bowl perfect for serving salads or fruits. Made with love by local artisans.",
    price: 45.99,
    originalPrice: 59.99,
    images: ["/placeholder.svg"],
    category: "Home Decor",
    tags: ["handmade", "ceramic", "bowl"],
    stock: 15,
    seller: {
      _id: "seller1",
      name: "Sarah's Ceramics",
      avatar: "/placeholder.svg",
      businessName: "Sarah's Handmade Studio",
      rating: 4.8
    },
    rating: 4.7,
    reviewCount: 23,
    isHandmade: true,
    materials: ["Ceramic", "Natural Clay"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "featured2",
    name: "Macrame Wall Hanging",
    description: "Elegant macrame wall hanging to add bohemian charm to any room. Handcrafted with natural cotton cord.",
    price: 32.50,
    images: ["/placeholder.svg"],
    category: "Home Decor",
    tags: ["macrame", "wall art", "bohemian"],
    stock: 8,
    seller: {
      _id: "seller2",
      name: "Emma's Knots",
      avatar: "/placeholder.svg",
      businessName: "Knotted Dreams",
      rating: 4.9
    },
    rating: 4.8,
    reviewCount: 15,
    isHandmade: true,
    materials: ["Cotton Cord", "Wood"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "featured3",
    name: "Handcrafted Leather Journal",
    description: "Premium leather-bound journal with handmade paper. Perfect for writing, sketching, or journaling.",
    price: 28.99,
    originalPrice: 35.99,
    images: ["/placeholder.svg"],
    category: "Stationery",
    tags: ["leather", "journal", "handbound"],
    stock: 12,
    seller: {
      _id: "seller3",
      name: "David's Leatherwork",
      avatar: "/placeholder.svg",
      businessName: "Craftsman's Corner",
      rating: 4.6
    },
    rating: 4.5,
    reviewCount: 31,
    isHandmade: true,
    materials: ["Genuine Leather", "Handmade Paper"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "featured4",
    name: "Artisan Soap Set",
    description: "Natural handmade soap set with lavender, eucalyptus, and tea tree oils. Chemical-free and eco-friendly.",
    price: 24.99,
    images: ["/placeholder.svg"],
    category: "Bath & Body",
    tags: ["soap", "natural", "essential oils"],
    stock: 25,
    seller: {
      _id: "seller4",
      name: "Natural Bliss",
      avatar: "/placeholder.svg",
      businessName: "Pure Nature Soaps",
      rating: 4.7
    },
    rating: 4.6,
    reviewCount: 42,
    isHandmade: true,
    materials: ["Natural Oils", "Shea Butter", "Essential Oils"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock trending products
const mockTrendingProducts = [
  mockFeaturedProducts[0],
  mockFeaturedProducts[1],
  {
    _id: "trending1",
    name: "Crocheted Baby Blanket",
    description: "Soft and cozy crocheted baby blanket made with organic cotton yarn. Perfect gift for new parents.",
    price: 55.00,
    images: ["/placeholder.svg"],
    category: "Baby & Kids",
    tags: ["crochet", "baby", "blanket", "organic"],
    stock: 6,
    seller: {
      _id: "seller5",
      name: "Grandma's Stitches",
      avatar: "/placeholder.svg",
      businessName: "Cozy Creations",
      rating: 4.9
    },
    rating: 4.9,
    reviewCount: 18,
    isHandmade: true,
    materials: ["Organic Cotton Yarn"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock featured sellers
const mockFeaturedSellers = [
  {
    _id: "seller1",
    name: "Sarah Johnson",
    businessName: "Sarah's Handmade Studio",
    email: "sarah@example.com",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    description: "Passionate ceramic artist creating unique tableware and home decor pieces.",
    location: {
      city: "Portland",
      state: "Oregon",
      country: "USA"
    },
    specialties: ["Ceramics", "Pottery", "Tableware"],
    rating: 4.8,
    reviewCount: 67,
    totalSales: 245,
    joinedDate: "2023-01-15",
    isVerified: true
  },
  {
    _id: "seller2", 
    name: "Emma Wilson",
    businessName: "Knotted Dreams",
    email: "emma@example.com",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    description: "Macrame artist specializing in wall hangings and plant hangers.",
    location: {
      city: "Austin",
      state: "Texas", 
      country: "USA"
    },
    specialties: ["Macrame", "Wall Art", "Plant Hangers"],
    rating: 4.9,
    reviewCount: 52,
    totalSales: 189,
    joinedDate: "2023-03-20",
    isVerified: true
  },
  {
    _id: "seller3",
    name: "David Chen",
    businessName: "Craftsman's Corner", 
    email: "david@example.com",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    description: "Leatherworker creating journals, bags, and accessories.",
    location: {
      city: "San Francisco",
      state: "California",
      country: "USA"
    },
    specialties: ["Leather Goods", "Journals", "Accessories"],
    rating: 4.6,
    reviewCount: 93,
    totalSales: 312,
    joinedDate: "2022-11-08",
    isVerified: true
  }
];

// Routes
router.get("/products/featured", (req, res) => {
  res.json({
    success: true,
    data: mockFeaturedProducts
  });
});

router.get("/products/trending", (req, res) => {
  res.json({
    success: true,
    data: mockTrendingProducts
  });
});

router.get("/sellers/featured", (req, res) => {
  res.json({
    success: true,
    data: mockFeaturedSellers
  });
});

export default router;
