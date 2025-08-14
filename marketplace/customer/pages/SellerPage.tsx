import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Award,
  ShoppingBag,
  Grid,
  List,
  ChevronDown,
  Filter,
} from "lucide-react";
import { sellersAPI, productsAPI } from "../lib/api";
import { Seller, Product } from "../lib/types";
import ProductCard from "../components/ProductCard";

const SellerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">(
    "products",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      fetchSeller();
      fetchProducts();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [sortBy, currentPage, activeTab]);

  const fetchSeller = async () => {
    try {
      setLoading(true);
      const data = await sellersAPI.getSeller(id!);
      setSeller(data);
    } catch (error) {
      console.error("Error fetching seller:", error);
      setError("Failed to load seller information");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
      };

      const response = await productsAPI.getProductsBySeller(id!, params);
      setProducts(response.data);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-warm-100 mb-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-warm-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-warm-200 rounded w-1/3"></div>
                  <div className="h-4 bg-warm-200 rounded w-2/3"></div>
                  <div className="h-4 bg-warm-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-earth-900 mb-4">
              Seller Not Found
            </h1>
            <p className="text-earth-600 mb-8">
              {error || "The seller you are looking for does not exist."}
            </p>
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-earth-600 mb-6">
          <Link to="/" className="hover:text-craft-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/sellers" className="hover:text-craft-600">
            Sellers
          </Link>
          <span className="mx-2">/</span>
          <span>{seller.storeName}</span>
        </nav>

        {/* Seller Header */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            <div className="flex items-start space-x-6 mb-6 lg:mb-0">
              <img
                src={seller.logo || "/placeholder.svg"}
                alt={seller.storeName}
                className="w-24 h-24 object-cover rounded-full border-4 border-craft-100"
              />
              <div>
                <h1 className="text-3xl font-bold text-earth-900 mb-2">
                  {seller.storeName}
                </h1>
                <p className="text-earth-600 mb-3">{seller.description}</p>

                <div className="flex items-center space-x-6 text-sm text-earth-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">
                      {seller.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="ml-1">
                      ({seller.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    <span>{seller.totalProducts || 0} products</span>
                  </div>
                  {seller.businessAddress?.city && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>
                        {seller.businessAddress.city},{" "}
                        {seller.businessAddress.state}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:ml-auto flex-shrink-0">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-craft-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-craft-600">
                    {seller.totalSales || 0}
                  </div>
                  <div className="text-sm text-earth-600">Total Sales</div>
                </div>
                <div className="bg-sage-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-sage-600">
                    {seller.memberSince
                      ? new Date(seller.memberSince).getFullYear()
                      : "N/A"}
                  </div>
                  <div className="text-sm text-earth-600">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 pt-6 border-t border-warm-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {seller.contactNumber && (
                <div className="flex items-center text-earth-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{seller.contactNumber}</span>
                </div>
              )}
              {seller.email && (
                <div className="flex items-center text-earth-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{seller.email}</span>
                </div>
              )}
              {seller.website && (
                <div className="flex items-center text-earth-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a
                    href={seller.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-craft-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-100 mb-8">
          <div className="flex border-b border-warm-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-craft-600 text-craft-600"
                  : "border-transparent text-earth-600 hover:text-craft-600"
              }`}
            >
              Products ({seller.totalProducts || 0})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-craft-600 text-craft-600"
                  : "border-transparent text-earth-600 hover:text-craft-600"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-craft-600 text-craft-600"
                  : "border-transparent text-earth-600 hover:text-craft-600"
              }`}
            >
              Reviews ({seller.reviewCount || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "products" && (
          <div>
            {/* Products Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className="text-2xl font-bold text-earth-900 mb-4 lg:mb-0">
                Products from {seller.storeName}
              </h2>

              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-craft-100 text-craft-700" : "text-earth-600"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-craft-100 text-craft-700" : "text-earth-600"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="appearance-none bg-white border border-warm-200 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-craft-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-earth-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-48 bg-warm-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-warm-200 rounded mb-2"></div>
                    <div className="h-6 bg-warm-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === i + 1
                              ? "bg-craft-600 text-white border-craft-600"
                              : "border-warm-200 hover:bg-warm-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-warm-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-warm-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-earth-900 mb-4">
                  No products available
                </h3>
                <p className="text-earth-600">
                  This seller hasn't listed any products yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
            <h2 className="text-2xl font-bold text-earth-900 mb-6">
              About {seller.storeName}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-earth-900 mb-4">
                  Store Information
                </h3>
                <div className="space-y-3 text-earth-600">
                  <p>{seller.description}</p>
                  {seller.specialties && (
                    <div>
                      <strong>Specialties:</strong>{" "}
                      {seller.specialties.join(", ")}
                    </div>
                  )}
                  {seller.policies && (
                    <div>
                      <strong>Store Policies:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          Returns: {seller.policies.returns || "Contact seller"}
                        </li>
                        <li>
                          Shipping:{" "}
                          {seller.policies.shipping || "Contact seller"}
                        </li>
                        <li>
                          Exchanges:{" "}
                          {seller.policies.exchanges || "Contact seller"}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-earth-900 mb-4">
                  Business Details
                </h3>
                <div className="space-y-3 text-earth-600">
                  {seller.businessAddress && (
                    <div>
                      <strong>Location:</strong>
                      <div className="mt-1">
                        {seller.businessAddress.street && (
                          <div>{seller.businessAddress.street}</div>
                        )}
                        <div>
                          {seller.businessAddress.city},{" "}
                          {seller.businessAddress.state}{" "}
                          {seller.businessAddress.pincode}
                        </div>
                      </div>
                    </div>
                  )}
                  {seller.memberSince && (
                    <div>
                      <strong>Member Since:</strong>{" "}
                      {new Date(seller.memberSince).toLocaleDateString()}
                    </div>
                  )}
                  {seller.certifications &&
                    seller.certifications.length > 0 && (
                      <div>
                        <strong>Certifications:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {seller.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-8">
            <h2 className="text-2xl font-bold text-earth-900 mb-6">
              Customer Reviews
            </h2>

            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-earth-900 mb-4">
                Reviews Coming Soon
              </h3>
              <p className="text-earth-600">
                Customer reviews for this seller will be displayed here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPage;
