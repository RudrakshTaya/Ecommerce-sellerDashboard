import {
  Product,
  Order,
  OrderItem,
  SellerStats,
  ProductsResponse,
  OrdersResponse,
  StatsResponse,
} from "@shared/api";

// Mock data generation
const generateMockProducts = (sellerId: string): Product[] => {
  return [
    {
      id: "1",
      name: "Handcrafted Wooden Jewelry Box",
      price: 2499,
      originalPrice: 2999,
      description:
        "Beautiful handcrafted wooden jewelry box with intricate carvings and velvet lining. Perfect for storing your precious jewelry and accessories.",
      image: "/placeholder.svg",
      images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      category: "Home Decor",
      subcategory: "Storage & Organization",
      rating: 4.8,
      reviews: 127,
      badges: ["Best Seller", "Eco-Friendly"],
      isCustomizable: true,
      isDIY: false,
      isInstagramPick: true,
      isHandmade: true,
      isNew: false,
      isTrending: true,
      materials: ["Teak Wood", "Velvet", "Brass"],
      colors: ["Natural", "Dark Brown"],
      tags: ["jewelry", "storage", "handmade", "wood", "gift"],
      stock: 25,
      deliveryDays: 7,
      sellerId,
      warranty: {
        period: "1 year",
        description: "Manufacturer warranty against defects",
        type: "manufacturer",
      },
      returnPolicy: {
        returnable: true,
        period: "30 days",
        conditions: [
          "Item must be in original condition",
          "Original packaging required",
        ],
      },
      careInstructions: [
        "Clean with dry cloth",
        "Avoid exposure to moisture",
        "Use wood polish monthly",
      ],
      dimensions: {
        length: 25,
        width: 15,
        height: 10,
        weight: 800,
        unit: "cm",
      },
      sku: "WJB-001",
      brand: "Crafted Heritage",
      vendor: {
        name: "Amazing Crafts Store",
        location: "Mumbai, Maharashtra",
        rating: 4.8,
      },
      certifications: ["FSC Certified Wood", "Eco-Friendly"],
      sustainabilityInfo: "Made from sustainably sourced teak wood",
      origin: "India",
      inStock: true,
      lowStockThreshold: 5,
      seoTitle: "Handcrafted Wooden Jewelry Box - Premium Teak Wood Storage",
      seoDescription:
        "Beautiful handcrafted wooden jewelry box with intricate carvings. Made from sustainable teak wood with velvet lining.",
      faq: [
        {
          question: "Can this be customized with initials?",
          answer: "Yes, we offer engraving services for personalization.",
        },
        {
          question: "What type of wood is used?",
          answer: "This jewelry box is made from premium teak wood.",
        },
      ],
    },
    {
      id: "2",
      name: "DIY Macrame Wall Hanging Kit",
      price: 899,
      originalPrice: 1199,
      description:
        "Complete DIY kit for creating beautiful macrame wall hangings. Includes all materials, tools, and step-by-step guide for beginners.",
      image: "/placeholder.svg",
      images: ["/placeholder.svg", "/placeholder.svg"],
      category: "DIY Kits",
      subcategory: "Craft Kits",
      rating: 4.6,
      reviews: 89,
      badges: ["DIY Kit", "Beginner Friendly"],
      isCustomizable: false,
      isDIY: true,
      isInstagramPick: false,
      isHandmade: false,
      isNew: true,
      isTrending: false,
      materials: ["Cotton Cord", "Wooden Ring", "Instruction Guide"],
      colors: ["Natural", "White"],
      tags: ["diy", "macrame", "wall decor", "kit", "craft"],
      stock: 3,
      deliveryDays: 3,
      sellerId,
      warranty: {
        period: "No warranty",
        description: "DIY kit - no warranty applicable",
        type: "none",
      },
      returnPolicy: {
        returnable: true,
        period: "15 days",
        conditions: ["Kit must be unopened", "All materials included"],
      },
      careInstructions: ["Keep materials dry", "Follow instructions carefully"],
      dimensions: {
        length: 30,
        width: 20,
        height: 5,
        weight: 300,
        unit: "cm",
      },
      sku: "MWH-002",
      brand: "Craft Corner",
      certifications: ["Non-toxic materials"],
      sustainabilityInfo: "Made with organic cotton cord",
      origin: "India",
      inStock: true,
      lowStockThreshold: 5,
      seoTitle: "DIY Macrame Wall Hanging Kit - Complete Craft Set",
      seoDescription:
        "Complete DIY macrame kit with all materials and instructions. Perfect for beginners and craft enthusiasts.",
      faq: [
        {
          question: "Is this suitable for beginners?",
          answer:
            "Yes, the kit includes detailed step-by-step instructions perfect for beginners.",
        },
        {
          question: "How long does it take to complete?",
          answer: "Most people complete the project in 2-3 hours.",
        },
      ],
    },
    {
      id: "3",
      name: "Ceramic Tea Set - Blue Pottery",
      price: 1599,
      originalPrice: 1899,
      description:
        "Traditional blue pottery ceramic tea set with intricate patterns. Perfect for tea lovers and collectors of fine ceramics.",
      image: "/placeholder.svg",
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
      ],
      category: "Ceramics",
      subcategory: "Dinnerware",
      rating: 4.9,
      reviews: 156,
      badges: ["Traditional Craft", "Limited Edition"],
      isCustomizable: true,
      isDIY: false,
      isInstagramPick: true,
      isHandmade: true,
      isNew: false,
      isTrending: true,
      materials: ["Ceramic", "Blue Glaze"],
      colors: ["Blue", "White"],
      sizes: ["Standard"],
      tags: ["tea", "ceramic", "blue pottery", "traditional", "dinnerware"],
      stock: 15,
      deliveryDays: 5,
      sellerId,
      warranty: {
        period: "6 months",
        description: "Warranty against manufacturing defects",
        type: "seller",
      },
      returnPolicy: {
        returnable: true,
        period: "30 days",
        conditions: [
          "Item must be undamaged",
          "Original packaging required",
          "No chips or cracks",
        ],
      },
      careInstructions: [
        "Hand wash only",
        "Avoid sudden temperature changes",
        "Handle with care",
      ],
      dimensions: {
        length: 35,
        width: 25,
        height: 15,
        weight: 1200,
        unit: "cm",
      },
      sku: "BPT-003",
      brand: "Heritage Ceramics",
      vendor: {
        name: "Amazing Crafts Store",
        location: "Mumbai, Maharashtra",
        rating: 4.8,
      },
      certifications: ["Food Safe", "Lead Free"],
      sustainabilityInfo: "Made using traditional eco-friendly techniques",
      origin: "Rajasthan, India",
      inStock: true,
      lowStockThreshold: 3,
      seoTitle: "Blue Pottery Ceramic Tea Set - Traditional Indian Craft",
      seoDescription:
        "Authentic blue pottery ceramic tea set with traditional patterns. Handmade in Rajasthan by skilled artisans.",
      faq: [
        {
          question: "Is this microwave safe?",
          answer:
            "No, this is traditional pottery and should not be used in microwave.",
        },
        {
          question: "How many pieces are included?",
          answer:
            "The set includes 1 teapot, 4 cups, 4 saucers, and 1 serving tray.",
        },
      ],
    },
    {
      id: "4",
      name: "Handwoven Cotton Throw",
      price: 2299,
      originalPrice: 2799,
      description:
        "Soft and cozy handwoven cotton throw with traditional patterns. Perfect for any room and all seasons.",
      image: "/placeholder.svg",
      images: ["/placeholder.svg", "/placeholder.svg"],
      category: "Textiles",
      subcategory: "Home Textiles",
      rating: 4.7,
      reviews: 94,
      badges: ["Organic Cotton", "Handwoven"],
      isCustomizable: true,
      isDIY: false,
      isInstagramPick: false,
      isHandmade: true,
      isNew: true,
      isTrending: false,
      materials: ["100% Organic Cotton"],
      colors: ["Beige", "Gray", "Navy"],
      sizes: ["Medium (150x200cm)", "Large (180x220cm)"],
      tags: ["throw", "cotton", "handwoven", "home decor", "organic"],
      stock: 2,
      deliveryDays: 10,
      sellerId,
      warranty: {
        period: "1 year",
        description: "Warranty against fabric defects",
        type: "manufacturer",
      },
      returnPolicy: {
        returnable: true,
        period: "30 days",
        conditions: [
          "Item must be unused",
          "Original packaging required",
          "Tags attached",
        ],
      },
      careInstructions: [
        "Machine wash cold",
        "Gentle cycle",
        "Air dry",
        "Do not bleach",
      ],
      dimensions: {
        length: 200,
        width: 150,
        height: 2,
        weight: 800,
        unit: "cm",
      },
      sku: "HCT-004",
      brand: "Eco Textiles",
      certifications: ["GOTS Certified", "Organic Cotton"],
      sustainabilityInfo:
        "Made from 100% organic cotton using eco-friendly dyes",
      origin: "Tamil Nadu, India",
      inStock: true,
      lowStockThreshold: 5,
      seoTitle: "Handwoven Organic Cotton Throw - Eco-Friendly Home Decor",
      seoDescription:
        "Soft handwoven cotton throw made from organic cotton. Perfect for sustainable home decor.",
      faq: [
        {
          question: "Is this made from organic cotton?",
          answer:
            "Yes, this throw is made from 100% GOTS certified organic cotton.",
        },
        {
          question: "What sizes are available?",
          answer:
            "Available in Medium (150x200cm) and Large (180x220cm) sizes.",
        },
      ],
    },
  ];
};

const generateMockOrders = (sellerId: string): Order[] => {
  const products = generateMockProducts(sellerId);

  return [
    {
      id: "ORD-001",
      userId: "user_456",
      items: [
        {
          product: products[0],
          quantity: 1,
          price: 2499,
          customization: {
            text: "Sarah's Collection",
            color: "Dark Walnut",
          },
          sellerId,
        },
      ],
      status: "confirmed",
      total: 2648,
      subtotal: 2499,
      shipping: 149,
      discount: 0,
      shippingAddress: {
        id: "addr_1",
        type: "home",
        firstName: "Sarah",
        lastName: "Johnson",
        address: "456 Oak Avenue, Apartment 3B",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        phone: "+91 9876543210",
        isDefault: true,
      },
      paymentMethod: "card",
      deliveryMethod: "standard",
      orderDate: "2024-01-15T10:30:00Z",
      estimatedDelivery: "2024-01-22T18:00:00Z",
      trackingNumber: "TRK123456789",
    },
    {
      id: "ORD-002",
      userId: "user_789",
      items: [
        {
          product: products[1],
          quantity: 2,
          price: 899,
          sellerId,
        },
        {
          product: products[2],
          quantity: 1,
          price: 1599,
          customization: {
            text: "The Sharma Family",
          },
          sellerId,
        },
      ],
      status: "processing",
      total: 3547,
      subtotal: 3397,
      shipping: 150,
      discount: 0,
      shippingAddress: {
        id: "addr_2",
        type: "work",
        firstName: "Raj",
        lastName: "Sharma",
        address: "789 Pine Street, Floor 5, Office 12",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        phone: "+91 9876543211",
        isDefault: false,
      },
      paymentMethod: "upi",
      deliveryMethod: "express",
      orderDate: "2024-01-16T14:20:00Z",
      estimatedDelivery: "2024-01-19T16:00:00Z",
    },
    {
      id: "ORD-003",
      userId: "user_321",
      items: [
        {
          product: products[3],
          quantity: 1,
          price: 2299,
          customization: {
            color: "Navy",
            size: "Large",
          },
          sellerId,
        },
      ],
      status: "shipped",
      total: 2448,
      subtotal: 2299,
      shipping: 149,
      discount: 0,
      shippingAddress: {
        id: "addr_3",
        type: "home",
        firstName: "Priya",
        lastName: "Kumar",
        address: "321 Maple Road, Villa 7",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        phone: "+91 9876543212",
        isDefault: true,
      },
      paymentMethod: "cod",
      deliveryMethod: "standard",
      orderDate: "2024-01-12T09:15:00Z",
      estimatedDelivery: "2024-01-19T17:00:00Z",
      trackingNumber: "TRK987654321",
    },
  ];
};

// Mock API functions
export const mockApi = {
  // Get seller products
  getSellerProducts: async (sellerId: string): Promise<ProductsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const products = generateMockProducts(sellerId);
    return { products };
  },

  // Get seller orders (filtered by sellerId in order items)
  getSellerOrders: async (sellerId: string): Promise<OrdersResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const orders = generateMockOrders(sellerId);

    // Filter orders to only include those with items from this seller
    const filteredOrders = orders
      .map((order) => ({
        ...order,
        items: order.items.filter((item) => item.sellerId === sellerId),
      }))
      .filter((order) => order.items.length > 0);

    return { orders: filteredOrders };
  },

  // Get seller stats
  getSellerStats: async (sellerId: string): Promise<StatsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const products = generateMockProducts(sellerId);
    const orders = generateMockOrders(sellerId);

    const lowStockProducts = products.filter(
      (p) => p.stock <= p.lowStockThreshold,
    ).length;
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId === sellerId,
      );
      return (
        sum +
        sellerItems.reduce(
          (itemSum, item) => itemSum + item.price * item.quantity,
          0,
        )
      );
    }, 0);

    const thisMonth = new Date().getMonth();
    const monthlyRevenue = orders
      .filter((order) => new Date(order.orderDate).getMonth() === thisMonth)
      .reduce((sum, order) => {
        const sellerItems = order.items.filter(
          (item) => item.sellerId === sellerId,
        );
        return (
          sum +
          sellerItems.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0,
          )
        );
      }, 0);

    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed",
    ).length;

    const completedOrders = orders.filter(
      (o) => o.status === "delivered",
    ).length;

    const stats: SellerStats = {
      totalProducts: products.length,
      totalOrders: orders.length,
      lowStockProducts,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      completedOrders,
    };

    return { stats };
  },

  // Add/Update product
  saveProduct: async (
    product: Omit<Product, "id"> | Product,
  ): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would save to backend
    const savedProduct: Product = {
      ...product,
      id: "id" in product ? product.id : Date.now(),
    } as Product;

    return savedProduct;
  },

  // Delete product
  deleteProduct: async (productId: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // In a real app, this would delete from backend
    return true;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: Order["status"],
  ): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    // In a real app, this would update the order in backend
    const orders = generateMockOrders("seller_123");
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      return order;
    }
    throw new Error("Order not found");
  },

  // Get single order details
  getOrderDetails: async (
    orderId: string,
    sellerId: string,
  ): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const orders = generateMockOrders(sellerId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      return order;
    }
    throw new Error("Order not found");
  },
};
