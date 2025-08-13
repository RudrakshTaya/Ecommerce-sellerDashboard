import React from "react";
import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomerAuthProvider, useCustomerAuth } from "./contexts/CustomerAuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import SellerPage from "./pages/SellerPage";
import CategoryPage from "./pages/CategoryPage";
import NotFoundPage from "./pages/NotFoundPage";

// Layout
import Layout from "./components/Layout";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-craft-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-craft-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />

    {/* Public Routes with Layout */}
    <Route
      path="/"
      element={
        <Layout>
          <HomePage />
        </Layout>
      }
    />
    <Route
      path="/products"
      element={
        <Layout>
          <ProductsPage />
        </Layout>
      }
    />
    <Route
      path="/products/:id"
      element={
        <Layout>
          <ProductPage />
        </Layout>
      }
    />
    <Route
      path="/categories/:category"
      element={
        <Layout>
          <CategoryPage />
        </Layout>
      }
    />
    <Route
      path="/sellers/:id"
      element={
        <Layout>
          <SellerPage />
        </Layout>
      }
    />

    {/* Protected Routes with Layout */}
    <Route
      path="/cart"
      element={
        <Layout>
          <CartPage />
        </Layout>
      }
    />
    <Route
      path="/checkout"
      element={
        <ProtectedRoute>
          <Layout>
            <CheckoutPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders"
      element={
        <ProtectedRoute>
          <Layout>
            <OrdersPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/orders/:id"
      element={
        <ProtectedRoute>
          <Layout>
            <OrderPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/wishlist"
      element={
        <ProtectedRoute>
          <Layout>
            <WishlistPage />
          </Layout>
        </ProtectedRoute>
      }
    />

    {/* 404 Page */}
    <Route
      path="*"
      element={
        <Layout>
          <NotFoundPage />
        </Layout>
      }
    />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <CustomerAuthProvider>
        <AppRoutes />
      </CustomerAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Create root only once and reuse it
const container = document.getElementById("root")!;
let root = (container as any)._reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(<App />);
