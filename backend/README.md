# Ecommerce Seller Backend API

A comprehensive Node.js backend API for an ecommerce seller dashboard with MongoDB, JWT authentication, Cloudinary image uploads, and comprehensive analytics.

## 🚀 Features

- **Authentication & Authorization**: JWT-based seller authentication
- **Product Management**: Full CRUD operations with image upload via Cloudinary
- **Order Management**: Complete order lifecycle management
- **Analytics Dashboard**: Comprehensive sales, product, and customer analytics
- **File Upload**: Multer + Cloudinary integration for image handling
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API design

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Image Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### Quick Setup

1. **Clone and setup:**

   ```bash
   cd backend
   npm install
   # or run the setup script
   node install.js
   ```

2. **Environment Configuration:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce_seller_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register     - Register new seller
POST   /api/auth/login        - Login seller
GET    /api/auth/me          - Get current seller profile
PUT    /api/auth/profile     - Update seller profile
PUT    /api/auth/change-password - Change password
POST   /api/auth/logout      - Logout seller
```

### Products

```
GET    /api/products         - Get all products (with pagination)
GET    /api/products/:id     - Get single product
POST   /api/products         - Create new product (with image upload)
PUT    /api/products/:id     - Update product
DELETE /api/products/:id     - Delete product
PATCH  /api/products/:id/status - Update product status
GET    /api/products/categories - Get product categories
```

### Orders

```
GET    /api/orders           - Get all orders (with filters)
GET    /api/orders/:id       - Get single order
POST   /api/orders           - Create new order
PATCH  /api/orders/:id/status - Update order status
GET    /api/orders/analytics - Get order analytics
```

### Analytics

```
GET    /api/analytics/dashboard  - Dashboard overview
GET    /api/analytics/sales      - Sales analytics
GET    /api/analytics/products   - Product analytics
GET    /api/analytics/customers  - Customer analytics
GET    /api/analytics/inventory  - Inventory analytics
```

### File Upload

```
POST   /api/upload/single    - Upload single image
POST   /api/upload/multiple  - Upload multiple images
POST   /api/upload/base64    - Upload base64 image
DELETE /api/upload/:publicId - Delete image
GET    /api/upload/info/:publicId - Get image info
```

## 📊 Data Models

### Seller

- Basic seller information and store details
- Authentication credentials
- Business metrics and statistics

### Product

- Complete product information
- Images and media
- Inventory management
- SEO and marketing data

### Order

- Order lifecycle management
- Customer information
- Payment and shipping details
- Status tracking

### Customer

- Customer profiles and segments
- Purchase history and analytics
- Communication preferences

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin request handling
- **Helmet**: Security headers
- **Input Validation**: Express Validator for request validation
- **Error Handling**: Comprehensive error handling middleware

## 📈 Analytics Features

### Dashboard Analytics

- Sales overview and trends
- Order statistics
- Product performance
- Customer insights

### Detailed Reports

- Sales analytics with date filtering
- Product performance metrics
- Customer segmentation
- Inventory management

## 🖼️ Image Upload Features

- **Cloudinary Integration**: Cloud-based image storage
- **Multiple Formats**: Support for JPG, PNG, GIF, WebP
- **Automatic Optimization**: Image compression and format optimization
- **Responsive Images**: Multiple size variants
- **Secure Upload**: Authenticated upload endpoints

## 🧪 API Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Authentication Test

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "storeName": "Test Store",
    "contactNumber": "1234567890",
    "businessAddress": "123 Test Street, Test City"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (when implemented)
```

### Project Structure

```
backend/
├── config/          # Configuration files
│   ├── database.js  # MongoDB connection
│   └── cloudinary.js # Cloudinary setup
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── upload.js    # File upload middleware
│   └── errorHandler.js # Error handling
├── models/          # Database models
│   ├── Seller.js    # Seller model
│   ├── Product.js   # Product model
│   ├── Order.js     # Order model
│   └── Customer.js  # Customer model
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── products.js  # Product routes
│   ├── orders.js    # Order routes
│   ├── analytics.js # Analytics routes
│   └── upload.js    # Upload routes
├── .env             # Environment variables
├── .env.example     # Environment template
├── server.js        # Main server file
└── README.md        # This file
```

## 🔄 Frontend Integration

The backend is designed to work with the React frontend. Make sure to:

1. Update frontend API calls to point to `http://localhost:5000`
2. Include JWT tokens in Authorization headers
3. Handle file uploads with FormData
4. Implement proper error handling for API responses

## 📝 Notes

- Default server port: `5000`
- Default database: `ecommerce_seller_db`
- JWT tokens expire in 7 days (configurable)
- Image uploads are limited to 5MB per file
- API includes comprehensive pagination and filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
