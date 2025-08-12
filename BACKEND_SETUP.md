# Backend Setup Instructions

## 🚀 Quick Start Guide

This guide will help you set up and run the backend server for your ecommerce seller dashboard.

### Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 16 or higher)

   - Download from: https://nodejs.org/
   - Check version: `node --version`

2. **MongoDB** (local installation or cloud database)

   - **Option A - Local MongoDB:**
     - Download from: https://www.mongodb.com/try/download/community
     - Start service: `mongod` or use MongoDB Compass
   - **Option B - MongoDB Atlas (Cloud):**
     - Create free account at: https://www.mongodb.com/atlas
     - Get connection string from your cluster

3. **Cloudinary Account** (for image uploads)
   - Sign up at: https://cloudinary.com/
   - Get your cloud name, API key, and API secret

### Step-by-Step Setup

#### 1. Navigate to Backend Directory

```bash
cd backend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/ecommerce_seller_db

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_seller_db

# JWT Configuration (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (get these from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

#### 4. Start the Backend Server

For development (with auto-reload):

```bash
npm run dev
```

For production:

```bash
npm start
```

#### 5. Verify Setup

The server should start on port 5000. You should see:

```
🚀 Server running on port 5000 in development mode
📅 MongoDB Connected: localhost
🗃️ Database Name: ecommerce_seller_db
📊 API Health Check: http://localhost:5000/health
🔗 Frontend URL: http://localhost:8080
```

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Ecommerce Seller Backend API is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### 🔧 Configuration Details

#### MongoDB Setup

**Local MongoDB:**

1. Install MongoDB Community Server
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/ecommerce_seller_db`

**MongoDB Atlas (Cloud):**

1. Create cluster at mongodb.com/atlas
2. Create database user
3. Whitelist your IP address
4. Get connection string from "Connect" button
5. Replace `<password>` and `<dbname>` in the connection string

#### Cloudinary Setup

1. Sign up at cloudinary.com
2. Go to Dashboard
3. Copy the values:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to your `.env` file

### 🧪 Testing the API

#### Test Authentication

```bash
# Register a new seller
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

### 🔄 Frontend Integration

To connect your frontend to the backend:

1. **Update API Base URL:**

   - Frontend should make requests to `http://localhost:5000`
   - Update any hardcoded API URLs in your frontend code

2. **Update Authentication:**

   - Replace the existing auth context with `UpdatedSellerAuthContext.tsx`
   - Update import statements to use the new API client

3. **Environment Variables:**
   - Make sure frontend allows cross-origin requests to `localhost:5000`
   - Update CORS settings if needed

### 📁 Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── cloudinary.js    # Cloudinary configuration
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── upload.js        # File upload middleware
│   └── errorHandler.js  # Error handling
├── models/
│   ├── Seller.js        # Seller data model
│   ├── Product.js       # Product data model
│   ├── Order.js         # Order data model
│   └── Customer.js      # Customer data model
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── products.js      # Product management
│   ├── orders.js        # Order management
│   ├── analytics.js     # Analytics and reports
│   └── upload.js        # File upload endpoints
├── .env                 # Environment configuration
├── server.js            # Main server file
└── package.json         # Dependencies and scripts
```

### 🚨 Troubleshooting

#### Common Issues:

1. **MongoDB Connection Failed:**

   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **Port Already in Use:**

   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

3. **Cloudinary Upload Errors:**

   - Verify credentials in `.env`
   - Check file size limits (5MB default)
   - Ensure valid image formats

4. **JWT Errors:**
   - Generate a secure JWT secret
   - Check token expiration settings

#### Debug Commands:

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({connectionStatus: 1})"

# Check Node.js version
node --version

# Check installed packages
npm list

# View server logs
npm run dev
```

### 🔐 Security Notes

1. **Change JWT Secret:** Use a secure, random string for production
2. **Environment Variables:** Never commit `.env` file to version control
3. **MongoDB Security:** Use authentication in production
4. **CORS Configuration:** Restrict origins in production
5. **Rate Limiting:** Adjust rate limits based on your needs

### 📊 Monitoring

The backend includes:

- Health check endpoint: `/health`
- Request logging with Morgan
- Error handling and logging
- Performance monitoring hooks

### 🚀 Deployment

For production deployment:

1. **Environment:** Set `NODE_ENV=production`
2. **Database:** Use MongoDB Atlas or secured local instance
3. **Secrets:** Use environment variables or secret management
4. **Process Manager:** Use PM2 or similar for process management
5. **Reverse Proxy:** Use Nginx or similar for load balancing

### 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test each component independently (DB, auth, file upload)
4. Review the API documentation in the README

The backend is now ready to serve your frontend application with full ecommerce functionality!
