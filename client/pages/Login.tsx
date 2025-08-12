import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Store, Shield, TrendingUp, Users } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useSellerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"}></div>
        
        <div className="relative z-10 flex flex-col justify-center px-8 xl:px-12 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-zinc-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Professional Seller Hub
            </h1>
            <p className="text-lg xl:text-xl text-slate-300 leading-relaxed">
              Advanced ecommerce management platform designed for modern sellers
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Advanced Analytics</h3>
                <p className="text-sm text-slate-400">Real-time insights and performance metrics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Enterprise Security</h3>
                <p className="text-sm text-slate-400">Bank-grade security for your business</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Customer Management</h3>
                <p className="text-sm text-slate-400">Comprehensive customer relationship tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-slate-50 to-gray-100">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 pt-6 sm:pb-8 sm:pt-8">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <Store className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Welcome Back</CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base">
                Access your seller dashboard to manage your business
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seller@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 bg-white"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-slate-700 to-zinc-700 hover:from-slate-800 hover:to-zinc-800 text-white font-semibold shadow-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </Button>
              </form>

              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-2">Demo Access:</p>
                <p className="text-xs text-slate-600">
                  Email: any valid email address<br />
                  Password: any password
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
