// Updated Product API for new backend integration
import { productsAPI, uploadAPI } from "./apiClient.js";

export class ProductAPI {
  // Get all products for the seller
  static async getSellerProducts(token) {
    try {
      const response = await productsAPI.getAll();
      return response.data || [];
    } catch (error) {
      console.warn("API call failed, check if backend is running:", error);
      // Return empty array instead of mock data for production
      return [];
    }
  }

  // Add new product with images
  static async addProduct(productData, token) {
    try {
      // If productData has file objects, use the form upload method
      if (
        productData.images &&
        productData.images.some((img) => img instanceof File)
      ) {
        const images = productData.images.filter((img) => img instanceof File);
        delete productData.images; // Remove images from productData

        const response = await productsAPI.createWithImages(
          productData,
          images,
        );
        return response.data;
      } else {
        // Regular product creation without file uploads
        const response = await productsAPI.create(productData);
        return response.data;
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      throw new Error("Failed to create product: " + error.message);
    }
  }

  // Update existing product
  static async updateProduct(productId, updatedData, token) {
    try {
      // Use _id if id is provided (for MongoDB compatibility)
      const id = productId._id || productId;

      // Handle image updates if present
      if (
        updatedData.newImages &&
        updatedData.newImages.some((img) => img instanceof File)
      ) {
        const newImages = updatedData.newImages.filter(
          (img) => img instanceof File,
        );
        const removeImages = updatedData.removeImages || [];

        // Remove image-related fields from main data
        const cleanData = { ...updatedData };
        delete cleanData.newImages;
        delete cleanData.removeImages;

        const response = await productsAPI.updateWithImages(
          id,
          cleanData,
          newImages,
          removeImages,
        );
        return response.data;
      } else {
        const response = await productsAPI.update(id, updatedData);
        return response.data;
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      throw new Error("Failed to update product: " + error.message);
    }
  }

  // Delete product
  static async deleteProduct(productId, token) {
    try {
      // Use _id if id is provided (for MongoDB compatibility)
      const id = productId._id || productId;
      await productsAPI.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw new Error("Failed to delete product: " + error.message);
    }
  }

  // Update product status
  static async updateProductStatus(productId, status, token) {
    try {
      const response = await productsAPI.updateStatus(productId, status);
      return response.data;
    } catch (error) {
      console.error("Failed to update product status:", error);
      throw new Error("Failed to update product status: " + error.message);
    }
  }

  // Get product categories
  static async getCategories(token) {
    try {
      const response = await productsAPI.getCategories();
      return response.data || [];
    } catch (error) {
      console.warn("Failed to get categories:", error);
      return [];
    }
  }

  // Upload single image
  static async uploadImage(file) {
    try {
      const response = await uploadAPI.single(file);
      return response.data;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw new Error("Failed to upload image: " + error.message);
    }
  }

  // Upload multiple images
  static async uploadImages(files) {
    try {
      const response = await uploadAPI.multiple(files);
      return response.data;
    } catch (error) {
      console.error("Failed to upload images:", error);
      throw new Error("Failed to upload images: " + error.message);
    }
  }

  // Delete uploaded image
  static async deleteImage(publicId) {
    try {
      await uploadAPI.delete(publicId);
      return true;
    } catch (error) {
      console.error("Failed to delete image:", error);
      return false;
    }
  }
}
