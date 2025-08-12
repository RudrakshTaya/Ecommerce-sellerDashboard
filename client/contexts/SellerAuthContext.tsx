import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seller } from '@shared/api';

interface SellerAuthContextType {
  seller: Seller | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  token: string | null;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
};

interface SellerAuthProviderProps {
  children: React.ReactNode;
}

export const SellerAuthProvider: React.FC<SellerAuthProviderProps> = ({ children }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored seller data and token on mount
  useEffect(() => {
    try {
      const storedSeller = localStorage.getItem('seller');
      const storedToken = localStorage.getItem('authToken');

      if (storedSeller && storedToken) {
        setSeller(JSON.parse(storedSeller));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
      localStorage.removeItem('seller');
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      // Try real API first
      const { loginSeller } = await import('../api/auth.js');
      const response = await loginSeller(email, password);

      if (response.success && response.seller && response.token) {
        setSeller(response.seller);
        setToken(response.token);
        localStorage.setItem('seller', JSON.stringify(response.seller));
        localStorage.setItem('authToken', response.token);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.warn('Real API failed, falling back to mock authentication:', error);

      
     
    }

    setLoading(false);
    return false;
  };

  const logout = () => {
    setSeller(null);
    setToken(null);
    localStorage.removeItem('seller');
    localStorage.removeItem('authToken');
  };

  const value: SellerAuthContextType = {
    seller,
    isAuthenticated: !!seller && !!token,
    login,
    logout,
    loading,
    token
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
};
