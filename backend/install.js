#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up Ecommerce Seller Backend...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  console.error(error.message);
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  .env file not found');
  console.log('📝 Creating .env file from template...');
  
  try {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created');
    console.log('⚠️  Please update the .env file with your actual configuration values');
  } catch (error) {
    console.error('❌ Failed to create .env file');
    console.error(error.message);
  }
}

console.log('\n🎉 Backend setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file with your configuration:');
console.log('   - MongoDB connection string');
console.log('   - JWT secret key');
console.log('   - Cloudinary credentials');
console.log('2. Ensure MongoDB is running');
console.log('3. Run: npm run dev');
console.log('\n🔗 Useful commands:');
console.log('   npm run dev     - Start development server');
console.log('   npm start       - Start production server');
console.log('   npm test        - Run tests');
console.log('\n📚 Documentation: Check the README.md file');
