import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Basic CORS setup
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3001", "https://d052cb52536b45b18157197380293a47-42e1f32d13814092b15c67494.fly.dev"],
  credentials: true
}));

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    services: {
      seller_dashboard: 'http://localhost:8080',
      marketplace: 'http://localhost:3001',
      backend: `http://localhost:${PORT}`
    }
  });
});

// Seller Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock seller authentication
  if (email && password) {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-seller-token-' + Date.now(),
      seller: {
        id: '1',
        email: email,
        storeName: 'Test Artisan Store',
        contactNumber: '9876543210',
        businessAddress: 'Test Address, Test City',
        isVerified: true,
        status: 'active',
        totalProducts: 5,
        totalOrders: 12,
        totalRevenue: 25000,
        rating: 4.8,
        reviewCount: 50
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      success: true,
      seller: {
        id: '1',
        email: 'test@artisan.com',
        storeName: 'Test Artisan Store',
        contactNumber: '9876543210',
        businessAddress: 'Test Address, Test City',
        isVerified: true,
        status: 'active',
        totalProducts: 5,
        totalOrders: 12,
        totalRevenue: 25000,
        rating: 4.8,
        reviewCount: 50
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
});

// Products endpoints
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        _id: '1',
        name: 'Handcrafted Ceramic Vase',
        description: 'Beautiful handmade ceramic vase with traditional patterns',
        price: 1299,
        originalPrice: 1599,
        sku: 'VAZ001',
        category: 'pottery',
        image: '/placeholder.svg',
        stock: 15,
        status: 'active',
        rating: 4.8,
        reviews: 24,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        _id: '2',
        name: 'Silver Ethnic Necklace',
        description: 'Exquisite silver necklace with traditional motifs',
        price: 3999,
        originalPrice: 4999,
        sku: 'NEK002',
        category: 'jewelry',
        image: '/placeholder.svg',
        stock: 5,
        status: 'active',
        rating: 4.9,
        reviews: 18,
        createdAt: new Date().toISOString()
      }
    ],
    pagination: {
      current: 1,
      pages: 1,
      total: 2,
      hasNext: false,
      hasPrev: false
    }
  });
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        _id: '1',
        orderNumber: 'ORD123456',
        customerId: 'cust1',
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210'
        },
        items: [
          {
            product: {
              name: 'Handcrafted Ceramic Vase',
              image: '/placeholder.svg',
              sku: 'VAZ001'
            },
            quantity: 1,
            price: 1299
          }
        ],
        subtotal: 1299,
        shipping: 99,
        tax: 234,
        total: 1632,
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    ],
    pagination: {
      current: 1,
      pages: 1,
      total: 1,
      hasNext: false,
      hasPrev: false
    },
    stats: {
      totalOrders: 12,
      totalRevenue: 25000,
      pendingOrders: 3,
      processingOrders: 5,
      shippedOrders: 2,
      deliveredOrders: 2
    }
  });
});

// Analytics endpoints
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 25000,
      totalOrders: 12,
      totalProducts: 5,
      totalCustomers: 8,
      revenueGrowth: 15.5,
      ordersGrowth: 23.2,
      conversionRate: 3.2,
      averageOrderValue: 2083
    }
  });
});

// Public endpoints for marketplace
app.get('/api/public/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        _id: '1',
        name: 'Handcrafted Ceramic Vase',
        description: 'Beautiful handmade ceramic vase',
        price: 1299,
        originalPrice: 1599,
        image: '/placeholder.svg',
        category: 'pottery',
        isHandmade: true,
        isTrending: true,
        rating: 4.8,
        reviews: 24,
        vendor: { name: 'Artisan Clay Works' },
        stock: 15,
        deliveryDays: 5,
        status: 'active',
        inStock: true
      },
      {
        id: '2',
        _id: '2',
        name: 'Silver Ethnic Necklace',
        description: 'Exquisite silver necklace with traditional motifs',
        price: 3999,
        originalPrice: 4999,
        image: '/placeholder.svg',
        category: 'jewelry',
        isHandmade: true,
        isTrending: true,
        rating: 4.9,
        reviews: 18,
        vendor: { name: 'Silver Dreams Jewelry' },
        stock: 5,
        deliveryDays: 7,
        status: 'active',
        inStock: true
      }
    ]
  });
});

app.get('/api/public/trending', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        _id: '1',
        name: 'Handcrafted Ceramic Vase',
        description: 'Beautiful handmade ceramic vase',
        price: 1299,
        originalPrice: 1599,
        image: '/placeholder.svg',
        category: 'pottery',
        isHandmade: true,
        isTrending: true,
        rating: 4.8,
        reviews: 24,
        vendor: { name: 'Artisan Clay Works' },
        stock: 15,
        deliveryDays: 5,
        status: 'active',
        inStock: true
      }
    ]
  });
});

app.get('/api/public/new', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '2',
        _id: '2',
        name: 'Silver Ethnic Necklace',
        description: 'Exquisite silver necklace with traditional motifs',
        price: 3999,
        originalPrice: 4999,
        image: '/placeholder.svg',
        category: 'jewelry',
        isHandmade: true,
        isNew: true,
        rating: 4.9,
        reviews: 18,
        vendor: { name: 'Silver Dreams Jewelry' },
        stock: 5,
        deliveryDays: 7,
        status: 'active',
        inStock: true
      }
    ]
  });
});

// Customer authentication endpoints
app.post('/api/customer-auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Customer login successful',
    token: 'customer-token-123',
    customer: {
      id: '1',
      name: 'Test Customer',
      email: req.body.email
    }
  });
});

app.post('/api/customer-auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Customer registration successful',
    token: 'customer-token-123',
    customer: {
      id: '1',
      name: req.body.name,
      email: req.body.email
    }
  });
});

// Customer orders endpoint
app.post('/api/customer-orders', (req, res) => {
  res.json({
    success: true,
    message: 'Order placed successfully',
    data: {
      orders: [
        {
          _id: 'order123',
          orderNumber: 'ORD' + Date.now(),
          total: req.body.items.reduce((sum, item) => sum + (item.quantity * 1299), 0),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ],
      orderCount: 1,
      totalAmount: req.body.items.reduce((sum, item) => sum + (item.quantity * 1299), 0)
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Seller Dashboard: http://localhost:8080`);
  console.log(`🛍️ Customer Marketplace: http://localhost:3001`);
});
