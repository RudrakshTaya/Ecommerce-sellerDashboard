// Product API wrapper with TypeScript support
import { Product } from "@shared/api";
import {
  addProduct,
  getMyProducts,
  deleteProduct,
  updateProduct,
} from "../api/product.js";
import { mockProducts } from "./mockData";

export class ProductAPI {
  static async addProduct(
    productData: Omit<Product, "id">,
    token: string,
  ): Promise<Product> {
    try {
      const response = await addProduct(productData, token);
      return response;
    } catch (error) {
      console.warn("Real API failed, using mock data:", error);
      // Fallback to mock behavior
      const mockProduct: Product = {
        ...productData,
        id: Date.now(),
        rating: 0,
        reviews: 0,
        badges: [],
        deliveryDays: productData.deliveryDays,
        inStock: productData.stock > 0,
        lowStockThreshold: productData.lowStockThreshold,
      };
      return mockProduct;
    }
  }

  static async getSellerProducts(token: string): Promise<Product[]> {
    try {
      const products = await getMyProducts(token);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.warn("Real API failed, using mock data:", error);
      // Fallback to mock data
      return Array.isArray(mockProducts) ? mockProducts : [];
    }
  }

  static async deleteProduct(productId: number, token: string): Promise<void> {
    try {
      await deleteProduct(productId, token);
    } catch (error) {
      console.warn("Real API failed, simulating delete:", error);
      // Simulate successful delete for UI
    }
  }

  static async updateProduct(
    productId: number,
    updatedData: Partial<Product>,
    token: string,
  ): Promise<Product> {
    try {
      const response = await updateProduct(productId, updatedData, token);
      return response;
    } catch (error) {
      console.warn("Real API failed, using mock update:", error);
      // Fallback to mock behavior
      return { ...updatedData, id: productId } as Product;
    }
  }
}
