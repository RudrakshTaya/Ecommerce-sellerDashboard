import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Phone,
  Filter,
  Download,
  UserPlus
} from 'lucide-react';

export default function Customers() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 min-h-screen -m-6 p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Customer Management</h1>
              <p className="text-slate-600">
                Manage customer relationships and support interactions
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
              <Button size="sm" className="bg-slate-700 hover:bg-slate-800 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Customer Management Coming Soon</h2>
            <p className="text-slate-600 mb-6">
              Comprehensive customer relationship management including contact management, 
              purchase history, support tickets, and communication tools.
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
