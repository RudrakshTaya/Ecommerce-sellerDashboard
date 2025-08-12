import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  User, 
  LogOut,
  Store,
  Bell,
  Settings,
  Search,
  BarChart3,
  Users,
  MessageSquare,
  Globe,
  Zap,
  FileText,
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Marketing', href: '/marketing', icon: Globe },
  { name: 'Support', href: '/support', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
];

const quickActions = [
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Shipping', href: '/shipping', icon: Truck },
  { name: 'Security', href: '/security', icon: Shield },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { seller, logout } = useSellerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-30 top-0 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    Seller Hub
                  </span>
                  <div className="text-xs text-slate-500 -mt-1">Professional</div>
                </div>
                <div className="block sm:hidden">
                  <span className="text-sm font-bold text-slate-900">Hub</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Search */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="block w-48 xl:w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white/50"
                />
              </div>

              {/* Mobile Search Button */}
              <Button variant="ghost" size="sm" className="lg:hidden hover:bg-slate-100">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative hover:bg-slate-100">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-xs bg-red-500 text-white border-white">
                  3
                </Badge>
              </Button>

              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-slate-100">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quickActions.map((action) => (
                    <DropdownMenuItem key={action.name} asChild>
                      <Link to={action.href} className="cursor-pointer flex items-center">
                        <action.icon className="mr-2 h-4 w-4" />
                        <span>{action.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-slate-100">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-slate-200">
                      <AvatarFallback className="bg-gradient-to-r from-slate-600 to-zinc-600 text-white font-semibold text-sm">
                        {seller?.storeName?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 sm:w-72" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 p-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-slate-600 to-zinc-600 text-white font-semibold text-lg">
                            {seller?.storeName?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold leading-none text-slate-900">
                            {seller?.storeName}
                          </p>
                          <p className="text-xs leading-none text-slate-500 mt-1">
                            {seller?.email}
                          </p>
                          <div className="flex items-center mt-2">
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              {seller?.isVerified ? '✓ Verified' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analytics" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-56 lg:w-64 xl:w-72 md:flex-col md:fixed md:inset-y-0 md:pt-14 lg:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white/60 backdrop-blur-md border-r border-slate-200 shadow-sm">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <div className="w-full">
                  <p className="text-sm font-semibold text-slate-900">{seller?.storeName}</p>
                  <p className="text-xs text-slate-500">Professional Dashboard</p>
                </div>
              </div>
              
              <nav className="flex-1 px-1 lg:px-2 space-y-1 sm:space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 lg:px-3 py-2 lg:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-slate-100 text-slate-900 border-r-2 border-r-slate-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-2 lg:mr-3 flex-shrink-0 h-4 w-4 lg:h-5 lg:w-5 transition-colors
                          ${isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}
                        `}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.name === 'Support' && (
                        <Badge className="ml-auto bg-red-100 text-red-700 text-xs">3</Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Upgrade Section */}
              <div className="flex-shrink-0 p-4">
                <div className="bg-gradient-to-r from-slate-700 to-zinc-700 rounded-lg p-4 text-white">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 mr-2" />
                    <span className="text-sm font-semibold">Upgrade Plan</span>
                  </div>
                  <p className="text-xs text-slate-200 mb-3">
                    Get advanced analytics and premium features
                  </p>
                  <Button size="sm" variant="secondary" className="w-full bg-white text-slate-900 hover:bg-slate-100">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-56 lg:pl-64 xl:pl-72 flex flex-col flex-1">
          <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-16 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-20 shadow-lg safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-1 p-1 sm:p-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                <span className="text-xs font-medium truncate max-w-full">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
