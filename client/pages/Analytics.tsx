import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 min-h-screen -m-6 p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
              <p className="text-slate-600">
                Comprehensive insights and performance metrics for your business
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Advanced Analytics Coming Soon</h2>
            <p className="text-slate-600 mb-6">
              We're building comprehensive analytics including sales trends, customer insights, 
              performance metrics, and detailed reporting tools.
            </p>
            <Badge className="bg-slate-100 text-slate-700 border-slate-300">
              Professional Feature
            </Badge>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
