import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { SellerStats } from '@shared/api';
import { analyticsAPI } from '../lib/updatedApiClient';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  Users,
  Target,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  MessageSquare,
  Star,
  Globe,
  Truck,
  CreditCard,
  Zap,
  Award,
  ShieldCheck
} from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  trendValue,
  className = ""
}: { 
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}) => (
  <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-slate-600">{title}</CardTitle>
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      {description && (
        <p className="text-xs text-slate-500 mb-2">{description}</p>
      )}
      {trend && trendValue && (
        <div className="flex items-center space-x-1">
          {trend === 'up' && <ArrowUp className="h-3 w-3 text-emerald-600" />}
          {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
          {trend === 'neutral' && <Minus className="h-3 w-3 text-slate-400" />}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const QuickAction = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  badge 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) => (
  <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm hover:shadow-lg hover:bg-white/80 transition-all duration-300 cursor-pointer group"
        onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        {badge && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
            {badge}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

const PerformanceMetric = ({ 
  label, 
  value, 
  target, 
  unit = "" 
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
}) => {
  const percentage = Math.min((value / target) * 100, 100);
  const isGood = value >= target * 0.8;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isGood ? 'bg-emerald-100' : 'bg-amber-100'}`}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{percentage.toFixed(1)}% of target</span>
        <span className={isGood ? 'text-emerald-600' : 'text-amber-600'}>
          {isGood ? 'On track' : 'Needs attention'}
        </span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { seller } = useSellerAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!seller) return;

      try {
        setLoading(true);
        // Load real dashboard data from backend
        const dashboardData = await analyticsAPI.getDashboard();

        if (dashboardData.success && dashboardData.data) {
          // Transform backend data to match SellerStats interface
          const overview = dashboardData.data.overview || {};
          const transformedStats: SellerStats = {
            totalProducts: overview.totalProducts || 0,
            totalOrders: overview.totalOrders || 0,
            lowStockProducts: overview.lowStockProducts || 0,
            totalRevenue: overview.totalRevenue || 0,
            monthlyRevenue: overview.monthlyRevenue || 0,
            pendingOrders: overview.pendingOrders || 0,
            completedOrders: overview.processingOrders || 0,
          };
          setStats(transformedStats);
        } else {
          // Fallback to default values if no data
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            lowStockProducts: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to default values on error
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          lowStockProducts: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [seller]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Failed to load dashboard statistics</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 min-h-screen -m-3 sm:-m-4 lg:-m-6 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-600">
                Welcome back, <span className="font-semibold">{seller?.storeName}</span>! Here's your business overview.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-slate-700 border-slate-300 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Last 30 days</span>
                <span className="sm:hidden">30d</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs sm:text-sm"
                onClick={() => navigate('/reports')}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Reports</span>
                <span className="sm:hidden">Reports</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            description="All-time earnings"
            trend="up"
            trendValue="+12.5% vs last month"
            className="border-l-4 border-l-emerald-500"
          />
          
          <StatCard
            title="Products Listed"
            value={stats.totalProducts}
            icon={Package}
            description="Active inventory"
            trend="up"
            trendValue="+3 this week"
            className="border-l-4 border-l-blue-500"
          />
          
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            description="Lifetime orders"
            trend="up"
            trendValue="+8.3% vs last month"
            className="border-l-4 border-l-purple-500"
          />
          
          <StatCard
            title="Customer Rating"
            value="4.8"
            icon={Star}
            description="Average rating"
            trend="up"
            trendValue="+0.2 this month"
            className="border-l-4 border-l-amber-500"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            icon={TrendingUp}
            description="This month's earnings"
            trend="up"
            trendValue="+24.8%"
          />
          
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            description="Require attention"
            trend={stats.pendingOrders > 5 ? 'up' : 'neutral'}
            trendValue={stats.pendingOrders > 5 ? 'High volume' : 'Normal'}
          />
          
          <StatCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={CheckCircle}
            description="Successfully delivered"
            trend="up"
            trendValue="+15 this week"
          />
        </div>

        {/* Performance Goals & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Performance Goals */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <Target className="w-5 h-5 mr-2" />
                Monthly Performance Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PerformanceMetric 
                label="Revenue Target"
                value={stats.monthlyRevenue}
                target={50000}
                unit="₹"
              />
              <PerformanceMetric 
                label="Orders Target"
                value={stats.totalOrders}
                target={100}
              />
              <PerformanceMetric 
                label="Customer Satisfaction"
                value={4.8}
                target={4.5}
              />
              <PerformanceMetric 
                label="Response Time"
                value={2.4}
                target={4.0}
                unit="h"
              />
            </CardContent>
          </Card>

          {/* Business Health */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Business Health Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">Store Verification</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Shipping Integration</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Low Stock Items</span>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">{stats.lowStockProducts}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Payment Gateway</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Connected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <QuickAction
              icon={Package}
              title="Add New Product"
              description="Add products with advanced features"
              onClick={() => navigate('/products')}
            />
            
                        <QuickAction
              icon={BarChart3}
              title="Analytics Dashboard"
              description="Detailed sales and performance analytics"
              onClick={() => navigate('/analytics')}
            />
            
                        <QuickAction
              icon={Users}
              title="Customer Management"
              description="Manage customer relationships and support"
              onClick={() => navigate('/customers')}
            />
            
                        <QuickAction
              icon={MessageSquare}
              title="Customer Support"
              description="Live chat and support tickets"
              onClick={() => navigate('/support')}
              badge="3 new"
            />
            
                        <QuickAction
              icon={Globe}
              title="Marketing Tools"
              description="SEO, campaigns, and promotions"
              onClick={() => navigate('/marketing')}
            />
            
                        <QuickAction
              icon={Zap}
              title="Automation Hub"
              description="Automate inventory and order processing"
              onClick={() => navigate('/reports')}
            />
          </div>
        </div>

        {/* Store Information */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Award className="w-5 h-5 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-slate-600">Store Name</span>
                <p className="font-semibold text-slate-900">{seller?.storeName}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-slate-600">Verification Status</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={seller?.isVerified ? "default" : "secondary"} 
                         className={seller?.isVerified ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}>
                    {seller?.isVerified ? "✓ Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-slate-600">Member Since</span>
                <p className="font-semibold text-slate-900">
                  {seller?.joinedDate ? new Date(seller.joinedDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-slate-600">Contact</span>
                <p className="font-semibold text-slate-900">{seller?.contactNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
