import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    
    try {
      const data = JSON.parse(text);
      console.log(`Response:`, data);
    } catch {
      console.log(`Response (text):`, text);
    }
    
    console.log('---');
  } catch (error) {
    console.log(`Error:`, error.message);
    console.log('---');
  }
}

async function runTests() {
  console.log('Testing Backend Endpoints...\n');
  
  await testEndpoint('/health');
  await testEndpoint('/public/products');
  await testEndpoint('/public/products/featured');
  await testEndpoint('/public/products/trending');
  await testEndpoint('/public/sellers/featured');
}

runTests();
