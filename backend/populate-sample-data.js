import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Seller from "./models/Seller.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";

dotenv.config();

const sampleSellers = [
  {
    email: "priya@clayworks.com",
    password: "password123",
    storeName: "Artisan Clay Works",
    contactNumber: "9876543210",
    businessAddress: "123 Potter Street, Jaipur, Rajasthan 302001",
    gstNumber: "08AAACR5055K1Z5",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.9,
    reviewCount: 247,
    bankDetails: {
      accountNumber: "1234567890",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountHolderName: "Priya Sharma"
    }
  },
  {
    email: "amit@silverdreams.com",
    password: "password123",
    storeName: "Silver Dreams Jewelry",
    contactNumber: "9876543211",
    businessAddress: "456 Jewelers Lane, Udaipur, Rajasthan 313001",
    gstNumber: "08AAACR5055K1Z6",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.8,
    reviewCount: 189,
    bankDetails: {
      accountNumber: "1234567891",
      ifscCode: "HDFC0001235",
      bankName: "HDFC Bank",
      accountHolderName: "Amit Kumar"
    }
  },
  {
    email: "meera@threadsheritage.com",
    password: "password123",
    storeName: "Threads of Heritage",
    contactNumber: "9876543212",
    businessAddress: "789 Weaver Colony, Varanasi, Uttar Pradesh 221001",
    gstNumber: "09AAACR5055K1Z7",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.9,
    reviewCount: 312,
    bankDetails: {
      accountNumber: "1234567892",
      ifscCode: "SBI0001236",
      bankName: "State Bank of India",
      accountHolderName: "Meera Devi"
    }
  },
  {
    email: "ravi@woodenwonders.com",
    password: "password123",
    storeName: "Wooden Wonders",
    contactNumber: "9876543213",
    businessAddress: "321 Carpenters Street, Mysore, Karnataka 570001",
    gstNumber: "29AAACR5055K1Z8",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.7,
    reviewCount: 156,
    bankDetails: {
      accountNumber: "1234567893",
      ifscCode: "ICICI001237",
      bankName: "ICICI Bank",
      accountHolderName: "Ravi Chandra"
    }
  },
  {
    email: "sita@canvascolors.com",
    password: "password123",
    storeName: "Canvas & Colors",
    contactNumber: "9876543214",
    businessAddress: "654 Artist Quarter, Mumbai, Maharashtra 400001",
    gstNumber: "27AAACR5055K1Z9",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.8,
    reviewCount: 203,
    bankDetails: {
      accountNumber: "1234567894",
      ifscCode: "AXIS001238",
      bankName: "Axis Bank",
      accountHolderName: "Sita Gupta"
    }
  },
  {
    email: "kiran@ecocraft.com",
    password: "password123",
    storeName: "Eco Craft Studio",
    contactNumber: "9876543215",
    businessAddress: "987 Green Valley, Ahmedabad, Gujarat 380001",
    gstNumber: "24AAACR5055K1ZA",
    status: "active",
    isVerified: true,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 4.9,
    reviewCount: 178,
    bankDetails: {
      accountNumber: "1234567895",
      ifscCode: "PNB001239",
      bankName: "Punjab National Bank",
      accountHolderName: "Kiran Patel"
    }
  }
];

const sampleProducts = [
  // Artisan Clay Works Products
  {
    name: "Handcrafted Ceramic Vase",
    description: "Beautiful handmade ceramic vase with traditional blue and white patterns. Perfect for home decoration and gifting. Each piece is unique and crafted with love.",
    price: 1299,
    originalPrice: 1599,
    sku: "ACW001",
    category: "pottery",
    subcategory: "vases",
    brand: "Artisan Clay Works",
    image: "/placeholder.svg",
    images: [],
    stock: 15,
    lowStockThreshold: 5,
    materials: ["Clay", "Ceramic Glaze"],
    colors: ["Blue", "White"],
    sizes: ["Medium"],
    tags: ["handmade", "ceramic", "vase", "decoration"],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 5,
    origin: "Jaipur, India",
    warranty: {
      period: "6 months",
      description: "Warranty against manufacturing defects",
      type: "seller"
    },
    returnPolicy: {
      returnable: true,
      period: "30 days",
      conditions: ["Item should be in original condition", "No damage"]
    },
    dimensions: {
      length: 15,
      width: 15,
      height: 25,
      weight: 0.8,
      unit: "cm"
    },
    careInstructions: ["Hand wash only", "Avoid direct sunlight", "Handle with care"],
    certifications: ["Handmade Certificate"],
    faq: [
      {
        question: "Is this microwave safe?",
        answer: "No, this decorative vase is not microwave safe."
      }
    ],
    rating: 4.8,
    reviews: 24,
    badges: ["trending", "handmade"],
    status: "active"
  },
  {
    name: "Traditional Clay Dinner Set",
    description: "Complete dinner set for 4 people made from natural clay. Includes plates, bowls, and glasses. Eco-friendly and healthy dining option.",
    price: 2499,
    originalPrice: 2999,
    sku: "ACW002",
    category: "pottery",
    subcategory: "dinnerware",
    brand: "Artisan Clay Works",
    image: "/placeholder.svg",
    images: [],
    stock: 8,
    lowStockThreshold: 3,
    materials: ["Natural Clay", "Food-safe Glaze"],
    colors: ["Terracotta", "Brown"],
    sizes: ["Set of 16 pieces"],
    tags: ["dinnerware", "clay", "eco-friendly", "traditional"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 7,
    origin: "Jaipur, India",
    careInstructions: ["Hand wash recommended", "Season before first use"],
    certifications: ["Food Safe Certificate", "Handmade Certificate"],
    rating: 4.6,
    reviews: 18,
    badges: ["new", "handmade", "custom"],
    status: "active"
  },

  // Silver Dreams Jewelry Products
  {
    name: "Silver Ethnic Necklace",
    description: "Exquisite silver necklace with traditional motifs and precious gemstone accents. Perfect for special occasions and festivals.",
    price: 3999,
    originalPrice: 4999,
    sku: "SDJ001",
    category: "jewelry",
    subcategory: "necklaces",
    brand: "Silver Dreams Jewelry",
    image: "/placeholder.svg",
    images: [],
    stock: 5,
    lowStockThreshold: 2,
    materials: ["Sterling Silver", "Gemstones"],
    colors: ["Silver"],
    sizes: ["One Size"],
    tags: ["jewelry", "silver", "necklace", "ethnic", "gemstones"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: true,
    deliveryDays: 7,
    origin: "Udaipur, India",
    warranty: {
      period: "1 year",
      description: "Warranty against tarnishing and craftsmanship",
      type: "seller"
    },
    careInstructions: ["Clean with soft cloth", "Store in dry place", "Avoid chemicals"],
    certifications: ["BIS Hallmark", "Handmade Certificate"],
    rating: 4.9,
    reviews: 15,
    badges: ["new", "trending", "custom", "handmade"],
    status: "active"
  },
  {
    name: "Oxidized Silver Bangles Set",
    description: "Set of 4 oxidized silver bangles with intricate patterns. Lightweight and comfortable for daily wear.",
    price: 1599,
    sku: "SDJ002",
    category: "jewelry",
    subcategory: "bangles",
    brand: "Silver Dreams Jewelry",
    image: "/placeholder.svg",
    images: [],
    stock: 12,
    lowStockThreshold: 5,
    materials: ["Oxidized Silver"],
    colors: ["Black Silver"],
    sizes: ["2.4 inch", "2.6 inch", "2.8 inch"],
    tags: ["bangles", "oxidized", "silver", "set"],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 5,
    origin: "Udaipur, India",
    careInstructions: ["Clean with silver cleaner", "Store separately"],
    certifications: ["Handmade Certificate"],
    rating: 4.7,
    reviews: 31,
    badges: ["trending", "handmade"],
    status: "active"
  },

  // Threads of Heritage Products
  {
    name: "Handwoven Silk Scarf",
    description: "Luxurious silk scarf with traditional handloom patterns. Made using age-old weaving techniques passed down through generations.",
    price: 2199,
    sku: "TOH001",
    category: "textiles",
    subcategory: "scarves",
    brand: "Threads of Heritage",
    image: "/placeholder.svg",
    images: [],
    stock: 20,
    lowStockThreshold: 8,
    materials: ["Pure Silk"],
    colors: ["Red", "Gold", "Blue", "Green"],
    sizes: ["One Size"],
    tags: ["silk", "scarf", "handwoven", "traditional"],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 4,
    origin: "Varanasi, India",
    careInstructions: ["Dry clean only", "Iron on low heat", "Store folded"],
    certifications: ["Handloom Certificate", "Pure Silk Certificate"],
    rating: 4.7,
    reviews: 22,
    badges: ["new", "handmade"],
    status: "active"
  },
  {
    name: "Cotton Handblock Print Bedsheet Set",
    description: "Premium cotton bedsheet set with traditional handblock prints. Includes 1 bedsheet and 2 pillow covers.",
    price: 1899,
    originalPrice: 2299,
    sku: "TOH002",
    category: "textiles",
    subcategory: "bedding",
    brand: "Threads of Heritage",
    image: "/placeholder.svg",
    images: [],
    stock: 15,
    lowStockThreshold: 5,
    materials: ["100% Cotton"],
    colors: ["Blue", "Pink", "Yellow"],
    sizes: ["Double", "King"],
    tags: ["bedsheet", "cotton", "handblock", "print"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 6,
    origin: "Varanasi, India",
    careInstructions: ["Machine wash cold", "Tumble dry low"],
    certifications: ["Handmade Certificate"],
    rating: 4.5,
    reviews: 28,
    badges: ["trending", "custom", "handmade"],
    status: "active"
  },

  // Wooden Wonders Products
  {
    name: "Wooden Carved Bowl Set",
    description: "Set of 3 hand-carved wooden bowls with intricate traditional designs. Perfect for serving snacks and decorative purposes.",
    price: 1899,
    originalPrice: 2399,
    sku: "WW001",
    category: "woodwork",
    subcategory: "bowls",
    brand: "Wooden Wonders",
    image: "/placeholder.svg",
    images: [],
    stock: 10,
    lowStockThreshold: 4,
    materials: ["Sheesham Wood"],
    colors: ["Natural Wood"],
    sizes: ["Set of 3"],
    tags: ["wooden", "bowls", "carved", "handmade"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: false,
    isTrending: true,
    deliveryDays: 6,
    origin: "Mysore, India",
    careInstructions: ["Hand wash only", "Oil occasionally", "Avoid soaking"],
    certifications: ["Handmade Certificate"],
    rating: 4.6,
    reviews: 19,
    badges: ["trending", "custom", "handmade"],
    status: "active"
  },

  // Canvas & Colors Products
  {
    name: "Abstract Canvas Painting",
    description: "Original abstract painting on canvas with vibrant colors. Unique artwork that adds character to any space.",
    price: 4999,
    sku: "CC001",
    category: "art",
    subcategory: "paintings",
    brand: "Canvas & Colors",
    image: "/placeholder.svg",
    images: [],
    stock: 1,
    lowStockThreshold: 1,
    materials: ["Canvas", "Acrylic Paint"],
    colors: ["Multi-color"],
    sizes: ["24x36 inches"],
    tags: ["painting", "abstract", "original", "canvas"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: true,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 3,
    origin: "Mumbai, India",
    careInstructions: ["Avoid direct sunlight", "Dust gently", "Frame recommended"],
    certifications: ["Original Art Certificate"],
    rating: 4.8,
    reviews: 7,
    badges: ["new", "custom", "handmade"],
    status: "active"
  },

  // Eco Craft Studio Products
  {
    name: "Eco-Friendly Tote Bag",
    description: "Handmade tote bag from recycled materials with embroidered designs. Perfect for shopping and daily use.",
    price: 899,
    sku: "ECS001",
    category: "accessories",
    subcategory: "bags",
    brand: "Eco Craft Studio",
    image: "/placeholder.svg",
    images: [],
    stock: 25,
    lowStockThreshold: 10,
    materials: ["Recycled Cotton", "Organic Thread"],
    colors: ["Green", "Brown", "Blue"],
    sizes: ["Large"],
    tags: ["eco-friendly", "tote", "embroidered", "recycled"],
    isCustomizable: true,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: true,
    isNew: true,
    isTrending: false,
    deliveryDays: 4,
    origin: "Ahmedabad, India",
    careInstructions: ["Machine wash cold", "Air dry", "Iron if needed"],
    certifications: ["Eco-Friendly Certificate", "Handmade Certificate"],
    rating: 4.5,
    reviews: 12,
    badges: ["new", "custom", "handmade"],
    status: "active"
  }
];

const sampleCustomers = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "9876543001",
    password: "password123",
    status: "active",
    addresses: [
      {
        type: "home",
        firstName: "Rajesh",
        lastName: "Kumar",
        address: "123 Main Street, Sector 15",
        city: "Gurgaon",
        state: "Haryana",
        pincode: "122001",
        phone: "9876543001",
        isDefault: true
      }
    ]
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543002",
    password: "password123",
    status: "active",
    addresses: [
      {
        type: "home",
        firstName: "Priya",
        lastName: "Sharma",
        address: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        phone: "9876543002",
        isDefault: true
      }
    ]
  }
];

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

async function populateData() {
  try {
    console.log("🚀 Starting data population...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Product.deleteMany({});
    await Seller.deleteMany({});
    await Customer.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create sellers
    console.log("👥 Creating sellers...");
    const createdSellers = [];
    
    for (const sellerData of sampleSellers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sellerData.password, salt);
      
      const seller = await Seller.create({
        ...sellerData,
        password: hashedPassword,
        lastLogin: new Date()
      });
      
      createdSellers.push(seller);
      console.log(`✅ Created seller: ${seller.storeName}`);
    }

    // Create products
    console.log("🎨 Creating products...");
    const sellerProductMap = {
      "Artisan Clay Works": 0,
      "Silver Dreams Jewelry": 1,
      "Threads of Heritage": 2,
      "Wooden Wonders": 3,
      "Canvas & Colors": 4,
      "Eco Craft Studio": 5
    };

    let productCount = 0;
    for (const productData of sampleProducts) {
      const sellerIndex = sellerProductMap[productData.brand];
      const seller = createdSellers[sellerIndex];
      
      const product = await Product.create({
        ...productData,
        sellerId: seller._id,
        vendor: {
          name: seller.storeName,
          location: seller.businessAddress.split(',')[1]?.trim() || "India",
          rating: seller.rating
        }
      });
      
      // Update seller's product count
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { totalProducts: 1 }
      });
      
      productCount++;
      console.log(`✅ Created product: ${product.name} (${product.brand})`);
    }

    // Create customers
    console.log("👤 Creating customers...");
    for (const customerData of sampleCustomers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(customerData.password, salt);
      
      const customer = await Customer.create({
        ...customerData,
        password: hashedPassword,
        lastActiveDate: new Date()
      });
      
      console.log(`✅ Created customer: ${customer.name}`);
    }

    console.log("\n🎉 Sample data population completed!");
    console.log(`📊 Summary:`);
    console.log(`   • Sellers: ${createdSellers.length}`);
    console.log(`   • Products: ${productCount}`);
    console.log(`   • Customers: ${sampleCustomers.length}`);
    
    console.log("\n🔑 Login Credentials:");
    console.log("📱 Seller Dashboard (http://localhost:8080):");
    sampleSellers.forEach(seller => {
      console.log(`   • ${seller.email} / password123 (${seller.storeName})`);
    });
    
    console.log("\n🛍️ Customer Marketplace (http://localhost:3001):");
    sampleCustomers.forEach(customer => {
      console.log(`   • ${customer.email} / password123 (${customer.name})`);
    });

  } catch (error) {
    console.error("❌ Error populating data:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await populateData();
    console.log("\n✅ All done! You can now test the complete system.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

main();
