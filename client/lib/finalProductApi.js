// Final Product API with proper MongoDB _id handling
import { productsAPI, uploadAPI } from "./updatedApiClient.js";

export class ProductAPI {
  // Get all products for the seller
  static async getSellerProducts(token) {
    try {
      const response = await productsAPI.getAll();
      return response.data || [];
    } catch (error) {
      console.warn("API call failed, check if backend is running:", error);
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

  // Update existing product (handles both _id and id)
  static async updateProduct(productId, updatedData, token) {
    try {
      // Extract the actual ID from either _id or id field
      const id =
        typeof productId === "object"
          ? productId._id || productId.id
          : productId;

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

  // Delete product (handles both _id and id)
  static async deleteProduct(productId, token) {
    try {
      // Extract the actual ID from either _id or id field
      const id =
        typeof productId === "object"
          ? productId._id || productId.id
          : productId;

      const response = await productsAPI.delete(id);
      return response.success;
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw new Error("Failed to delete product: " + error.message);
    }
  }

  // Update product status (handles both _id and id)
  static async updateProductStatus(productId, status, token) {
    try {
      // Extract the actual ID from either _id or id field
      const id =
        typeof productId === "object"
          ? productId._id || productId.id
          : productId;

      const response = await productsAPI.updateStatus(id, status);
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
      const response = await uploadAPI.delete(publicId);
      return response.success;
    } catch (error) {
      console.error("Failed to delete image:", error);
      return false;
    }
  }
}

// Helper function to ensure ID compatibility
export const ensureId = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
  };
};

// Helper function to get MongoDB-compatible ID
export const getMongoId = (idOrObject) => {
  if (typeof idOrObject === "string") return idOrObject;
  if (typeof idOrObject === "object") return idOrObject._id || idOrObject.id;
  return idOrObject;
};
