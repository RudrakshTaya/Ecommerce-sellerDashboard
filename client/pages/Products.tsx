import React, { useState, useEffect } from "react";
import { useSellerAuth } from "../contexts/SellerAuthContext";
import DashboardLayout from "../components/DashboardLayout";
import AddProductForm from "../components/AddProductForm";
import ViewProductModal from "../components/ViewProductModal";
import EditProductForm from "../components/EditProductForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { ProductAPI } from "../lib/productApi";
import { Product } from "@shared/api";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  Star,
  TrendingUp,
} from "lucide-react";

const ProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}) => {
  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div className="aspect-square relative bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[70%]">
          {product.badges.map((badge, index) => (
            <Badge
              key={index}
              variant="default"
              className="bg-blue-600 text-xs"
            >
              {badge}
            </Badge>
          ))}
          {product.isNew && (
            <Badge variant="default" className="bg-green-600 text-xs">
              New
            </Badge>
          )}
          {product.isTrending && (
            <Badge variant="default" className="bg-purple-600 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
          {product.isHandmade && (
            <Badge variant="secondary" className="text-xs">
              Handmade
            </Badge>
          )}
          {product.isDIY && (
            <Badge variant="outline" className="text-xs bg-orange-100">
              DIY
            </Badge>
          )}
          {product.isInstagramPick && (
            <Badge variant="outline" className="text-xs bg-pink-100">
              📷 Insta Pick
            </Badge>
          )}
        </div>
        {isLowStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="flex items-center text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low Stock
            </Badge>
          </div>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="bg-red-600 text-xs">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100,
              )}
              % OFF
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviews} reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
            </div>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          {/* Stock and SKU */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className={isLowStock ? "text-red-600 font-medium" : ""}>
              Stock: {product.stock}
            </span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>🚚 {product.deliveryDays} days</span>
            <span>📍 {product.origin}</span>
          </div>

          {/* Warranty & Return Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {product.warranty && <span>🛡️ {product.warranty.period}</span>}
            {product.returnPolicy?.returnable && (
              <span>↩️ {product.returnPolicy.period}</span>
            )}
          </div>

          {/* Care Instructions Preview */}
          {product.careInstructions && product.careInstructions.length > 0 && (
            <div className="text-xs text-gray-500">
              <span>💚 Care: {product.careInstructions[0]}</span>
              {product.careInstructions.length > 1 && (
                <span> +{product.careInstructions.length - 1} more</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => onView(product)}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(product)}
              className="h-8 sm:h-9 px-2 sm:px-3"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-700 h-8 sm:h-9 px-2 sm:px-3"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Products() {
  const { seller, token } = useSellerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      if (!seller || !token) return;

      try {
        setLoading(true);
        const products = await ProductAPI.getSellerProducts(token);
        setProducts(products);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [seller, token]);

  const handleDeleteProduct = async (productId: any) => {
    console.log(productId);
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      if (token) {
        await ProductAPI.deleteProduct(productId, token);
        setProducts(products.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your product catalog and inventory with warranty, care
              instructions, and more
            </p>
          </div>
          <Button
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products, SKU, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 sm:h-11"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 h-10 sm:h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      products.filter((p) => p.stock <= p.lowStockThreshold)
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Rating
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length > 0
                      ? (
                          products.reduce((sum, p) => sum + p.rating, 0) /
                          products.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    With Warranty
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter((p) => p.warranty).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-500 px-4">
              {searchTerm || selectedCategory
                ? "Try adjusting your filters"
                : "Get started by adding your first product with comprehensive details"}
            </p>
            {!searchTerm && !selectedCategory && (
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}

        {/* Add Product Form Modal */}
        <AddProductForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddProduct}
        />

        {/* View Product Modal */}
        <ViewProductModal
          product={selectedProduct}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduct(null);
          }}
          onEdit={(product) => {
            setShowViewModal(false);
            setSelectedProduct(product);
            setShowEditForm(true);
          }}
        />

        {/* Edit Product Form Modal */}
        <EditProductForm
          product={selectedProduct}
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleUpdateProduct}
        />
      </div>
    </DashboardLayout>
  );
}
