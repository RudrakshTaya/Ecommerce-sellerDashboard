import React, { useState } from 'react';
import { Button } from './ui/button';
import { getAuthToken, createApiUrl } from '../config/api.js';
import { productsAPI, authAPI } from '../lib/updatedApiClient.js';
import API_CONFIG from '../config/api.js';

const AuthDebug: React.FC = () => {
  const [debug, setDebug] = useState<any>({});

  const testToken = () => {
    const token = getAuthToken();
    setDebug(prev => ({
      ...prev,
      token: token ? `${token.substring(0, 20)}...` : 'No token found',
      tokenExists: !!token
    }));
  };

  const testProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setDebug(prev => ({
        ...prev,
        profile: response.success ? 'Profile fetch SUCCESS' : 'Profile fetch FAILED',
        profileData: response
      }));
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        profile: `Profile fetch ERROR: ${error.message}`,
        profileError: error
      }));
    }
  };

  const testProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setDebug(prev => ({
        ...prev,
        products: response.success ? `Products fetch SUCCESS (${response.data?.length || 0} items)` : 'Products fetch FAILED',
        productsData: response
      }));
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        products: `Products fetch ERROR: ${error.message}`,
        productsError: error
      }));
    }
  };

  const testProtectedEndpoint = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.TEST.PROTECTED), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      setDebug(prev => ({
        ...prev,
        protectedTest: response.ok ? 'Protected endpoint SUCCESS' : `Protected endpoint FAILED: ${data.message}`,
        protectedData: data
      }));
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        protectedTest: `Protected endpoint ERROR: ${error.message}`,
        protectedError: error
      }));
    }
  };

  const testPublicEndpoint = async () => {
    try {
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.TEST.PUBLIC));
      const data = await response.json();

      setDebug(prev => ({
        ...prev,
        publicTest: response.ok ? 'Public endpoint SUCCESS' : 'Public endpoint FAILED',
        publicData: data
      }));
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        publicTest: `Public endpoint ERROR: ${error.message}`,
        publicError: error
      }));
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button onClick={testToken} size="sm">Check Token</Button>
        <Button onClick={testPublicEndpoint} size="sm">Test Public API</Button>
        <Button onClick={testProtectedEndpoint} size="sm">Test Protected API</Button>
        <Button onClick={testProfile} size="sm">Test Profile API</Button>
        <Button onClick={testProducts} size="sm">Test Products API</Button>
        <Button onClick={() => setDebug({})} size="sm" variant="outline">Clear</Button>
      </div>

      <div className="bg-white p-4 rounded border">
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebug;
