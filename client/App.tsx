import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SellerAuthProvider, useSellerAuth } from "./contexts/SellerAuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSellerAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSellerAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Import DashboardLayout
import DashboardLayout from './components/DashboardLayout';

// Placeholder Component for missing features
const PlaceholderPage = ({ title, description }: { title: string; description: string }) => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-600 mb-6">{description}</p>
          <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
            Coming Soon - Professional Feature
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/products" element={
      <ProtectedRoute>
        <Products />
      </ProtectedRoute>
    } />
    
    <Route path="/orders" element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    } />

    <Route path="/analytics" element={
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    } />

    <Route path="/customers" element={
      <ProtectedRoute>
        <Customers />
      </ProtectedRoute>
    } />
    
    <Route path="/profile" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />

    {/* Placeholder routes for missing features */}
    <Route path="/marketing" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Marketing Tools" 
          description="SEO optimization, campaign management, promotions, and marketing automation tools are coming soon."
        />
      </ProtectedRoute>
    } />

    <Route path="/support" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Customer Support" 
          description="Live chat, support tickets, FAQ management, and customer communication tools are coming soon."
        />
      </ProtectedRoute>
    } />

    <Route path="/reports" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Advanced Reports" 
          description="Detailed reporting, data export, and business intelligence features are coming soon."
        />
      </ProtectedRoute>
    } />

    <Route path="/payments" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Payment Management" 
          description="Payment gateway integration, transaction management, and financial reporting are coming soon."
        />
      </ProtectedRoute>
    } />

    <Route path="/shipping" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Shipping Integration" 
          description="Shipping partner integration, rate calculation, and logistics management are coming soon."
        />
      </ProtectedRoute>
    } />

    <Route path="/security" element={
      <ProtectedRoute>
        <PlaceholderPage 
          title="Security Center" 
          description="Advanced security settings, fraud protection, and compliance tools are coming soon."
        />
      </ProtectedRoute>
    } />
    
    {/* Redirect root to login */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    
    {/* 404 Page */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SellerAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </SellerAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
