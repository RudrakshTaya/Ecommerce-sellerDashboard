import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let sellerId = '';
let productId = '';

// Test data
const testSeller = {
  email: 'test@example.com',
  password: 'testpassword123',
  storeName: 'Test Electronics Store',
  contactNumber: '9876543210',
  businessAddress: '123 Test Street, Test City, Test State 12345',
  gstNumber: '22AAAAA0000A1Z5',
  bankDetails: {
    accountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank'
  }
};

const testProduct = {
  name: 'Test Wireless Headphones',
  description: 'Premium quality wireless Bluetooth headphones for testing purposes',
  price: 1999,
  originalPrice: 2499,
  sku: 'TEST001',
  category: 'Electronics',
  subcategory: 'Audio',
  brand: 'TestBrand',
  stock: 25,
  deliveryDays: 3,
  origin: 'Made in India',
  materials: 'Plastic,Metal',
  colors: 'Black,White',
  sizes: 'One Size',
  tags: 'test,wireless,headphones'
};

async function testEndpoint(method, endpoint, data = null, useAuth = false) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n🔗 ${method} ${endpoint}`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));
    
    return { response, result };
  } catch (error) {
    console.error(`❌ Error testing ${method} ${endpoint}:`, error.message);
    return { error };
  }
}

async function runTests() {
  console.log('🚀 Starting API endpoint tests...\n');

  // 1. Test health endpoint
  console.log('='.repeat(50));
  console.log('🏥 TESTING HEALTH ENDPOINT');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/health');

  // 2. Test registration
  console.log('\n' + '='.repeat(50));
  console.log('👤 TESTING SELLER REGISTRATION');
  console.log('='.repeat(50));
  const regResult = await testEndpoint('POST', '/api/auth/register', testSeller);
  if (regResult.result && regResult.result.success) {
    authToken = regResult.result.token;
    sellerId = regResult.result.seller.id;
    console.log(`✅ Registration successful! Token: ${authToken.substring(0, 20)}...`);
  }

  // 3. Test login
  console.log('\n' + '='.repeat(50));
  console.log('🔐 TESTING SELLER LOGIN');
  console.log('='.repeat(50));
  const loginResult = await testEndpoint('POST', '/api/auth/login', {
    email: testSeller.email,
    password: testSeller.password
  });
  if (loginResult.result && loginResult.result.success) {
    authToken = loginResult.result.token;
    console.log(`✅ Login successful! Token: ${authToken.substring(0, 20)}...`);
  }

  // 4. Test seller profile
  console.log('\n' + '='.repeat(50));
  console.log('👨‍💼 TESTING SELLER PROFILE');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/auth/me', null, true);

  // 5. Test seller activation
  console.log('\n' + '='.repeat(50));
  console.log('✅ TESTING SELLER ACTIVATION');
  console.log('='.repeat(50));
  await testEndpoint('PUT', `/api/admin/activate-seller/${sellerId}`);

  // 6. Test getting products (should be empty initially)
  console.log('\n' + '='.repeat(50));
  console.log('📦 TESTING GET ALL PRODUCTS');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/products', null, true);

  // 7. Test the fixed my-products route
  console.log('\n' + '='.repeat(50));
  console.log('📦 TESTING MY-PRODUCTS ROUTE (FIXED)');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/products/my-products', null, true);

  // 8. Test product creation
  console.log('\n' + '='.repeat(50));
  console.log('➕ TESTING PRODUCT CREATION');
  console.log('='.repeat(50));
  const productResult = await testEndpoint('POST', '/api/products', testProduct, true);
  if (productResult.result && productResult.result.success) {
    productId = productResult.result.data.id;
    console.log(`✅ Product created! ID: ${productId}`);
  }

  // 9. Test getting single product by ID
  if (productId) {
    console.log('\n' + '='.repeat(50));
    console.log('📱 TESTING GET SINGLE PRODUCT BY ID');
    console.log('='.repeat(50));
    await testEndpoint('GET', `/api/products/${productId}`, null, true);
  }

  // 10. Test my-products route again (should now have products)
  console.log('\n' + '='.repeat(50));
  console.log('📦 TESTING MY-PRODUCTS WITH DATA');
  console.log('='.repeat(50));
  await testEndpoint('GET', '/api/products/my-products', null, true);

  console.log('\n' + '='.repeat(50));
  console.log('🎉 ALL TESTS COMPLETED!');
  console.log('='.repeat(50));
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export default runTests;
