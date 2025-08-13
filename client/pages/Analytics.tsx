import React, { useState, useEffect } from "react";
import { useSellerAuth } from "../contexts/SellerAuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { analyticsAPI } from "../lib/updatedApiClient";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";

interface AnalyticsData {
  dashboard?: {
    totalRevenue?: number;
    totalOrders?: number;
    totalCustomers?: number;
    averageOrderValue?: number;
  };
  sales?: any;
  products?: any;
  customers?: any;
  inventory?: any;
}

export default function Analytics() {
  const { seller, token } = useSellerAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!seller || !token) return;

      try {
        setLoading(true);
        setError(null);

        // Try to load analytics data from backend
        const [dashboard, sales, products, customers, inventory] =
          await Promise.allSettled([
            analyticsAPI.getDashboard(),
            analyticsAPI.getSales(),
            analyticsAPI.getProducts(),
            analyticsAPI.getCustomers(),
            analyticsAPI.getInventory(),
          ]);

        const data: AnalyticsData = {};

        if (dashboard.status === "fulfilled") {
          data.dashboard = dashboard.value.data;
        }
        if (sales.status === "fulfilled") {
          data.sales = sales.value.data;
        }
        if (products.status === "fulfilled") {
          data.products = products.value.data;
        }
        if (customers.status === "fulfilled") {
          data.customers = customers.value.data;
        }
        if (inventory.status === "fulfilled") {
          data.inventory = inventory.value.data;
        }

        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setError(
          "Failed to load analytics data. The analytics service may not be available yet.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [seller, token]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Reload analytics data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 min-h-screen -m-6 p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600">
                Comprehensive insights and performance metrics for your business
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 border-slate-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 border-slate-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 border-slate-300"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">
                    Analytics Service Unavailable
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Cards */}
        {analyticsData.dashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹
                      {analyticsData.dashboard.totalRevenue?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analyticsData.dashboard.totalOrders?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Total Customers
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {analyticsData.dashboard.totalCustomers?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Avg Order Value
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      ₹
                      {analyticsData.dashboard.averageOrderValue?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Coming Soon placeholder */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Advanced Analytics Coming Soon
              </h2>
              <p className="text-slate-600 mb-6">
                We're building comprehensive analytics including sales trends,
                customer insights, performance metrics, and detailed reporting
                tools.
              </p>
              <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                Professional Feature
              </Badge>
            </div>
          </div>
        )}

        {/* Additional Analytics Sections (when data is available) */}
        {analyticsData.sales && (
          <Card className="border-2 border-slate-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <BarChart3 className="w-5 h-5 mr-2" />
                Sales Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Sales data and trends will be displayed here.
              </p>
            </CardContent>
          </Card>
        )}

        {analyticsData.products && (
          <Card className="border-2 border-slate-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <Package className="w-5 h-5 mr-2" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Product performance metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        )}

        {analyticsData.customers && (
          <Card className="border-2 border-slate-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <Users className="w-5 h-5 mr-2" />
                Customer Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Customer behavior and insights will be displayed here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
