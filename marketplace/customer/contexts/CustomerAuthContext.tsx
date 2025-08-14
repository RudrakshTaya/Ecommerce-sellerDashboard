import React, { createContext, useContext, useEffect, useState } from "react";
import { Customer } from "../lib/types";
import { authAPI } from "../lib/api";
import { useAuthStore } from "../lib/store";

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
  setCustomer: (customer: Customer) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined,
);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider",
    );
  }
  return context;
};

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const {
    customer,
    isAuthenticated,
    token,
    login: setAuthData,
    logout: clearAuthData,
    updateCustomer,
  } = useAuthStore();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("customerToken");
      const storedCustomer = localStorage.getItem("customer");

      if (storedToken && storedCustomer) {
        try {
          // Parse stored customer and set initial auth state
          const parsedCustomer = JSON.parse(storedCustomer);
          setAuthData(parsedCustomer, storedToken);

          // Verify token is still valid by fetching current customer
          const currentCustomer = await authAPI.getCurrentCustomer();
          setAuthData(currentCustomer, storedToken);
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Token is invalid, clear stored data
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customer");
          clearAuthData();
        }
      } else {
        clearAuthData();
      }

      setLoading(false);
    };

    initializeAuth();
  }, [setAuthData, clearAuthData]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      if (response.success && response.token && response.customer) {
        setAuthData(response.customer, response.token);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const response = await authAPI.register(data);

      if (response.success && response.token && response.customer) {
        setAuthData(response.customer, response.token);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      clearAuthData();
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Customer>) => {
    try {
      const updatedCustomer = await authAPI.updateProfile(data);
      updateCustomer(updatedCustomer);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Profile update failed",
      );
    }
  };

  const value: CustomerAuthContextType = {
    customer,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    setCustomer: updateCustomer,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
