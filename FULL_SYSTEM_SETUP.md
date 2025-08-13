# 🎨 Complete CraftMart System Setup & Testing

This guide will help you set up and test the complete end-to-end handmade crafts marketplace system.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Seller         │    │   Backend API   │    │  Customer       │
│  Dashboard      │◄──►│   (Express)     │◄──►│  Marketplace    │
│  (React/Vite)   │    │   Port 5000     │    │  (Next.js)      │
│  Port 8080      │    │                 │    │  Port 3001      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   MongoDB       │
                       │   Database      │
                       │                 │
                       └─────────────────┘
```

## 🚀 Quick Start

### 1. Start Backend API Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000 in development mode
📊 API Health Check: http://localhost:5000/health
🔗 Seller Dashboard: http://localhost:8080
🛍️ Customer Marketplace: http://localhost:3001

📋 Available API Endpoints:
   • Seller Auth: /api/auth/*
   • Seller Products: /api/products/*
   • Seller Orders: /api/orders/*
   • Customer Auth: /api/customer-auth/*
   • Customer Orders: /api/customer-orders/*
   • Public Products: /api/public/*
```

### 2. Start Seller Dashboard (Already Running)

The seller dashboard is already running on port 8080.

### 3. Start Customer Marketplace

```bash
cd marketplace
npm run dev
```

### 4. Populate Sample Data

```bash
cd backend
node populate-sample-data.js
```

**Expected Output:**
```
🚀 Starting data population...
🧹 Clearing existing data...
✅ Existing data cleared
👥 Creating sellers...
✅ Created seller: Artisan Clay Works
✅ Created seller: Silver Dreams Jewelry
... (more sellers)
🎨 Creating products...
✅ Created product: Handcrafted Ceramic Vase (Artisan Clay Works)
... (more products)
👤 Creating customers...
✅ Created customer: Rajesh Kumar
✅ Created customer: Priya Sharma

🎉 Sample data population completed!
📊 Summary:
   • Sellers: 6
   • Products: 10
   • Customers: 2
```

## 🔑 Login Credentials

### Seller Dashboard (http://localhost:8080)
```
Email: priya@clayworks.com
Password: password123
Store: Artisan Clay Works

Email: amit@silverdreams.com  
Password: password123
Store: Silver Dreams Jewelry

Email: meera@threadsheritage.com
Password: password123
Store: Threads of Heritage

Email: ravi@woodenwonders.com
Password: password123
Store: Wooden Wonders

Email: sita@canvascolors.com
Password: password123
Store: Canvas & Colors

Email: kiran@ecocraft.com
Password: password123
Store: Eco Craft Studio
```

### Customer Marketplace (http://localhost:3001)
```
Email: rajesh@example.com
Password: password123
Name: Rajesh Kumar

Email: priya@example.com
Password: password123
Name: Priya Sharma
```

## 🧪 Complete Testing Flow

### Phase 1: Verify Individual Systems

#### ✅ Backend API Health Check
1. Visit: http://localhost:5000/health
2. Should see JSON response with system status

#### ✅ Seller Dashboard
1. Visit: http://localhost:8080
2. Login with any seller credentials
3. Verify you can see the dashboard with products

#### ✅ Customer Marketplace
1. Visit: http://localhost:3001
2. Should see homepage with products (after running sample data script)

### Phase 2: End-to-End Customer Flow

#### 🛍️ Customer Registration & Shopping
1. **Visit Marketplace**: http://localhost:3001
2. **Register New Customer**: 
   - Click "Sign up for free"
   - Fill registration form
   - Verify successful registration and auto-login

3. **Browse Products**:
   - View homepage with trending/new products
   - Click on categories
   - Search for products

4. **Add to Cart**:
   - Click on any product card
   - Click "Quick Add" or visit product detail page
   - Verify item appears in cart (top right icon shows count)

5. **Checkout Process**:
   - Click cart icon → "Proceed to Checkout"
   - Fill shipping address
   - Select payment method (COD recommended for testing)
   - Review order and click "Place Order"
   - Verify order confirmation page

### Phase 3: Seller Order Management

#### 📋 Verify Order in Seller Dashboard
1. **Login to Seller Dashboard**: http://localhost:8080
2. **Use credentials for the seller whose product was ordered**
3. **Navigate to Orders section**
4. **Verify the new order appears**:
   - Should show customer details
   - Product items
   - Order status (pending)
   - Payment method

5. **Test Order Status Updates**:
   - Change order status to "confirmed"
   - Add tracking information
   - Verify status history updates

### Phase 4: Customer Order Tracking

#### 📦 Customer Order History
1. **Return to Marketplace**: http://localhost:3001
2. **Navigate to Orders** (user menu → My Orders)
3. **Verify order appears with correct status**
4. **Click "View Details"**:
   - Verify all order information is correct
   - Check status timeline
   - Verify seller information

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check if MongoDB is running
curl http://localhost:5000/health

# Restart backend
cd backend
npm run dev
```

### Frontend Issues
```bash
# Clear marketplace cache
cd marketplace
rm -rf .next
npm run dev

# Clear seller dashboard cache
rm -rf node_modules/.vite
npm run dev
```

### Database Issues
```bash
# Re-populate data
cd backend
node populate-sample-data.js
```

## 📊 Testing Checklist

- [ ] Backend API responds at port 5000
- [ ] Seller dashboard loads at port 8080
- [ ] Customer marketplace loads at port 3001
- [ ] Sample data populated successfully
- [ ] Seller can login and see dashboard
- [ ] Customer can register/login
- [ ] Products display on marketplace homepage
- [ ] Add to cart functionality works
- [ ] Checkout process completes successfully
- [ ] Order appears in seller dashboard
- [ ] Seller can update order status
- [ ] Customer can view order history
- [ ] Order status updates reflect in customer view

## 🎯 Success Criteria

✅ **Complete Integration**: Customer can place order → Seller receives order → Order status updates flow between systems

✅ **Data Consistency**: Order details match between customer and seller views

✅ **Real-time Updates**: Status changes reflect across both interfaces

## 🆘 Support

If you encounter issues:
1. Check all three servers are running
2. Verify MongoDB connection
3. Check browser console for errors
4. Verify network requests in browser dev tools
5. Check server logs for API errors

The system is now ready for complete end-to-end testing! 🎉
