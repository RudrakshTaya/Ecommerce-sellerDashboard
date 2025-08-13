import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Seller from "./models/Seller.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";

dotenv.config();

const sampleSellers = [
  {
    email: "sarah@ceramics.com",
    password: "123456",
    storeName: "Sarah's Handmade Studio",
    contactNumber: "5551234567",
    businessAddress: "123 Craft Street, Portland, Oregon, USA",
    isVerified: true,
    status: "active",
    rating: 4.8,
    reviewCount: 67,
    totalSales: 245,
    isFeatured: true,
    isActive: true,
    profileImage: "/placeholder.svg",
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
  {
    email: "emma@macrame.com",
    password: "123456",
    storeName: "Knotted Dreams",
    contactNumber: "5552345678",
    businessAddress: "456 Creative Avenue, Austin, Texas, USA",
    isVerified: true,
    status: "active",
    rating: 4.9,
    reviewCount: 52,
    totalSales: 189,
    isFeatured: true,
    isActive: true,
    profileImage: "/placeholder.svg",
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
  {
    email: "david@leather.com",
    password: "123456",
    storeName: "Craftsman's Corner",
    contactNumber: "5553456789",
    businessAddress: "789 Artisan Way, San Francisco, California, USA",
    isVerified: true,
    status: "active",
    rating: 4.6,
    reviewCount: 93,
    totalSales: 312,
    isFeatured: true,
    isActive: true,
    profileImage: "/placeholder.svg",
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
];

const sampleProducts = [
  {
    name: "Handwoven Ceramic Bowl",
    description: "Beautiful handwoven ceramic bowl perfect for serving salads or fruits. Made with love by local artisans using traditional techniques passed down through generations.",
    price: 45.99,
    originalPrice: 59.99,
    sku: "CB001",
    category: "Home Decor",
    subcategory: "Kitchenware",
    brand: "Sarah's Studio",
    image: "/placeholder.svg",
    images: [
      {
        url: "/placeholder.svg",
        alt: "Ceramic Bowl",
      },
    ],
    stock: 15,
    lowStockThreshold: 5,
    inStock: true,
    materials: ["Ceramic", "Natural Clay"],
    colors: ["Earth Tone", "Natural"],
    tags: ["handmade", "ceramic", "bowl", "eco-friendly"],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    isFeatured: true,
    deliveryDays: 5,
    origin: "USA",
    warranty: {
      period: "1 year",
      description: "Manufacturing defects only",
      type: "manufacturer",
    },
    returnPolicy: {
      returnable: true,
      period: "30 days",
      conditions: ["Unused", "Original packaging"],
    },
    dimensions: {
      length: 25,
      width: 25,
      height: 8,
      weight: 0.5,
      unit: "cm",
    },
    status: "active",
    rating: 4.7,
    reviewCount: 23,
    views: 145,
  },
  {
    name: "Macrame Wall Hanging",
    description: "Elegant macrame wall hanging to add bohemian charm to any room. Handcrafted with natural cotton cord using traditional knotting techniques.",
    price: 32.50,
    sku: "MWH002",
    category: "Home Decor",
    subcategory: "Wall Art",
    brand: "Knotted Dreams",
    image: "/placeholder.svg",
    images: [
      {
        url: "/placeholder.svg",
        alt: "Macrame Wall Hanging",
      },
    ],
    stock: 8,
    lowStockThreshold: 3,
    inStock: true,
    materials: ["Cotton Cord", "Wood"],
    colors: ["Natural", "Cream"],
    tags: ["macrame", "wall art", "bohemian", "handmade"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    deliveryDays: 7,
    origin: "USA",
    warranty: {
      type: "none",
    },
    returnPolicy: {
      returnable: true,
      period: "15 days",
      conditions: ["Unused", "Original condition"],
    },
    dimensions: {
      length: 60,
      width: 40,
      height: 2,
      weight: 0.3,
      unit: "cm",
    },
    status: "active",
    rating: 4.8,
    reviewCount: 15,
    views: 89,
  },
  {
    name: "Handcrafted Leather Journal",
    description: "Premium leather-bound journal with handmade paper. Perfect for writing, sketching, or journaling. Each journal is unique with natural leather variations.",
    price: 28.99,
    originalPrice: 35.99,
    sku: "LJ003",
    category: "Stationery",
    subcategory: "Journals",
    brand: "Craftsman's Corner",
    image: "/placeholder.svg",
    images: [
      {
        url: "/placeholder.svg",
        alt: "Leather Journal",
      },
    ],
    stock: 12,
    lowStockThreshold: 5,
    inStock: true,
    materials: ["Genuine Leather", "Handmade Paper"],
    colors: ["Brown", "Black", "Tan"],
    tags: ["leather", "journal", "handbound", "writing"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    isFeatured: true,
    deliveryDays: 3,
    origin: "USA",
    warranty: {
      period: "6 months",
      description: "Binding and material defects",
      type: "manufacturer",
    },
    returnPolicy: {
      returnable: true,
      period: "30 days",
      conditions: ["Unused", "Original packaging"],
    },
    dimensions: {
      length: 21,
      width: 14,
      height: 2,
      weight: 0.4,
      unit: "cm",
    },
    status: "active",
    rating: 4.5,
    reviewCount: 31,
    views: 67,
  },
  {
    name: "Artisan Soap Set",
    description: "Natural handmade soap set with lavender, eucalyptus, and tea tree oils. Chemical-free and eco-friendly, perfect for sensitive skin.",
    price: 24.99,
    sku: "AS004",
    category: "Bath & Body",
    subcategory: "Soaps",
    brand: "Pure Nature",
    image: "/placeholder.svg",
    images: [
      {
        url: "/placeholder.svg",
        alt: "Artisan Soap Set",
      },
    ],
    stock: 25,
    lowStockThreshold: 8,
    inStock: true,
    materials: ["Natural Oils", "Shea Butter", "Essential Oils"],
    colors: ["Natural", "Lavender", "Green"],
    tags: ["soap", "natural", "essential oils", "handmade"],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    deliveryDays: 5,
    origin: "USA",
    warranty: {
      type: "none",
    },
    returnPolicy: {
      returnable: false,
      period: "No returns",
      conditions: ["Hygiene item"],
    },
    dimensions: {
      length: 10,
      width: 7,
      height: 3,
      weight: 0.15,
      unit: "cm",
    },
    status: "active",
    rating: 4.6,
    reviewCount: 42,
    views: 123,
  },
  {
    name: "Crocheted Baby Blanket",
    description: "Soft and cozy crocheted baby blanket made with organic cotton yarn. Perfect gift for new parents. Available in multiple colors.",
    price: 55.00,
    sku: "BB005",
    category: "Baby & Kids",
    subcategory: "Blankets",
    brand: "Cozy Creations",
    image: "/placeholder.svg",
    images: [
      {
        url: "/placeholder.svg",
        alt: "Crocheted Baby Blanket",
      },
    ],
    stock: 6,
    lowStockThreshold: 2,
    inStock: true,
    materials: ["Organic Cotton Yarn"],
    colors: ["Pink", "Blue", "Yellow", "White"],
    tags: ["crochet", "baby", "blanket", "organic"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: true,
    isFeatured: false,
    deliveryDays: 10,
    origin: "USA",
    warranty: {
      type: "none",
    },
    returnPolicy: {
      returnable: true,
      period: "30 days",
      conditions: ["Unused", "Original packaging"],
    },
    dimensions: {
      length: 90,
      width: 70,
      height: 2,
      weight: 0.6,
      unit: "cm",
    },
    status: "active",
    rating: 4.9,
    reviewCount: 18,
    views: 78,
  },
];

const sampleCustomers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "123456",
    phone: "1234567890",
    addresses: [
      {
        type: "home",
        firstName: "Alice",
        lastName: "Johnson",
        phone: "1234567890",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        pincode: "10001",
        isDefault: true,
      },
    ],
  },
  {
    name: "Bob Wilson",
    email: "bob@example.com",
    password: "123456",
    phone: "9876543210",
    addresses: [
      {
        type: "home",
        firstName: "Bob",
        lastName: "Wilson",
        phone: "9876543210",
        address: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        pincode: "90210",
        isDefault: true,
      },
    ],
  },
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Seller.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    console.log("Cleared existing data");

    // Create sellers
    const createdSellers = [];
    for (const sellerData of sampleSellers) {
      const seller = new Seller(sellerData);
      await seller.save();
      createdSellers.push(seller);
      console.log(`Created seller: ${seller.storeName}`);
    }

    // Create customers
    const createdCustomers = [];
    for (const customerData of sampleCustomers) {
      const customer = new Customer(customerData);
      await customer.save();
      createdCustomers.push(customer);
      console.log(`Created customer: ${customer.name}`);
    }

    // Create products and assign to sellers
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = {
        ...sampleProducts[i],
        sellerId: createdSellers[i % createdSellers.length]._id,
      };
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }

    console.log("\n✅ Sample data populated successfully!");
    console.log(`👥 Sellers: ${createdSellers.length}`);
    console.log(`📦 Products: ${sampleProducts.length}`);
    console.log(`🛒 Customers: ${createdCustomers.length}`);

    console.log("\n🔑 Sample Login Credentials:");
    console.log("Sellers:");
    sampleSellers.forEach((seller, index) => {
      console.log(`  ${index + 1}. Email: ${seller.email} | Password: ${seller.password}`);
    });
    console.log("Customers:");
    sampleCustomers.forEach((customer, index) => {
      console.log(`  ${index + 1}. Email: ${customer.email} | Password: ${customer.password}`);
    });

    console.log("\n🏪 Marketplace URLs:");
    console.log("Customer Marketplace: http://localhost:3001");
    console.log("Seller Dashboard: http://localhost:8080");
    console.log("Backend API: http://localhost:5050");

  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
}

// Run the population script
populateDatabase();
