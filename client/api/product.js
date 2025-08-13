// src/api/product.js
import { productsAPI } from '../lib/updatedApiClient.js';

export async function addProduct(productData, token) {
  try {
    const response = await productsAPI.create(productData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to add product");
  }
}



export async function getMyProducts(token) {
  try {
    const response = await productsAPI.getAll();
    return response.data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }
}


export async function deleteProduct(productId, token) {
  try {
    const response = await productsAPI.delete(productId);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete product');
  }
}

export async function updateProduct(productId, updatedData, token) {
  try {
    const response = await productsAPI.update(productId, updatedData);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update product');
  }
}
