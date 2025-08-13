import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Basic CORS setup
app.use(cors({
  origin: ["http://localhost:8080", "http://localhost:3001"],
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

// Sample products endpoint for testing
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
      }
    ]
  });
});

// Basic auth endpoints
app.post('/api/customer-auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Test login successful',
    token: 'test-token-123',
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
    message: 'Test registration successful',
    token: 'test-token-123',
    customer: {
      id: '1',
      name: req.body.name,
      email: req.body.email
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});
