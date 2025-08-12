import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/apiClient.js';
import { getAuthToken, removeAuthToken } from '../config/api.js';

interface Seller {
  id: string;
  email: string;
  storeName: string;
  contactNumber: string;
  businessAddress: string;
  gstNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  isVerified: boolean;
  status: 'active' | 'pending' | 'suspended';
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface SellerAuthContextType {
  seller: Seller | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Seller>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  storeName: string;
  contactNumber: string;
  businessAddress: string;
  gstNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

export const SellerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = getAuthToken();
        if (savedToken) {
          setToken(savedToken);
          await fetchSellerProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch seller profile
  const fetchSellerProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setSeller(response.seller);
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      removeAuthToken();
      setSeller(null);
      setToken(null);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        setSeller(response.seller);
        setToken(response.token);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        setSeller(response.seller);
        setToken(response.token);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSeller(null);
      setToken(null);
      removeAuthToken();
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<Seller>) => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success) {
        setSeller(response.seller);
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, message: response.message || 'Update failed' };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.message || 'Profile update failed. Please try again.' 
      };
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    try {
      await fetchSellerProfile();
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  };

  const value: SellerAuthContextType = {
    seller,
    token,
    loading,
    isAuthenticated: !!seller && !!token,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
};

export default SellerAuthContext;
