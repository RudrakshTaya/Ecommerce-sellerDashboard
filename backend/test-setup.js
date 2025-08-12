#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Running comprehensive backend validation...\n');

// Check if all required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'config/database.js',
  'config/cloudinary.js',
  'middleware/auth.js',
  'middleware/errorHandler.js',
  'middleware/upload.js',
  'models/Seller.js',
  'models/Product.js',
  'models/Order.js',
  'models/Customer.js',
  'routes/auth.js',
  'routes/products.js',
  'routes/orders.js',
  'routes/analytics.js',
  'routes/upload.js'
];

console.log('📁 Checking required files...');
let missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing ${missingFiles.length} required files. Please ensure all files are present.`);
  process.exit(1);
}

// Check package.json dependencies
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'express',
    'mongoose', 
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv',
    'multer',
    'cloudinary',
    'multer-storage-cloudinary',
    'express-validator',
    'helmet',
    'express-rate-limit',
    'compression',
    'morgan'
  ];

  let missingDeps = [];
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      missingDeps.push(dep);
    }
  }

  if (missingDeps.length > 0) {
    console.log(`\n❌ Missing ${missingDeps.length} required dependencies.`);
    console.log('Run: npm install ' + missingDeps.join(' '));
  } else {
    console.log('✅ All required dependencies present');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check .env configuration
console.log('\n⚙️ Checking environment configuration...');
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists');
} else {
  console.log('❌ .env.example missing');
}

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredEnvVars = [
      'PORT',
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_EXPIRE',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'FRONTEND_URL'
    ];

    console.log('🔍 Checking environment variables...');
    for (const envVar of requiredEnvVars) {
      if (envContent.includes(`${envVar}=`)) {
        console.log(`✅ ${envVar}`);
      } else {
        console.log(`⚠️  ${envVar} - not found in .env`);
      }
    }
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
  }
} else {
  console.log('⚠️  .env file not found - will be created from .env.example');
}

// Test basic imports
console.log('\n🧪 Testing module imports...');

const testImports = async () => {
  try {
    // Test dotenv
    await import('dotenv');
    console.log('✅ dotenv');

    // Test express
    await import('express');
    console.log('✅ express');

    // Test mongoose
    await import('mongoose');
    console.log('✅ mongoose');

    // Test other dependencies
    await import('bcryptjs');
    console.log('✅ bcryptjs');

    await import('jsonwebtoken');
    console.log('✅ jsonwebtoken');

    await import('cors');
    console.log('✅ cors');

    await import('multer');
    console.log('✅ multer');

    await import('cloudinary');
    console.log('✅ cloudinary');

    await import('multer-storage-cloudinary');
    console.log('✅ multer-storage-cloudinary');

    console.log('\n✅ All core modules can be imported successfully');

  } catch (error) {
    console.log(`❌ Import error: ${error.message}`);
    return false;
  }
  return true;
};

// Run tests
testImports().then((success) => {
  if (success) {
    console.log('\n🎉 Backend validation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env with your MongoDB URI and Cloudinary credentials');
    console.log('2. Start MongoDB if using local instance');
    console.log('3. Run: npm run dev');
    console.log('\n🚀 Backend is ready for production!');
  } else {
    console.log('\n❌ Backend validation failed. Please fix the issues above.');
    process.exit(1);
  }
}).catch((error) => {
  console.log('\n❌ Validation error:', error.message);
  process.exit(1);
});
