import React, { useState, useEffect } from 'react';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { mockApi } from '../lib/mockApi';
import { Order } from '@shared/api';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Loader2,
  Eye,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Phone,
  Edit,
  Search,
  Home,
  Building,
  Users
} from 'lucide-react';

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'confirmed': return <CheckCircle className="w-4 h-4" />;
    case 'processing': return <Package className="w-4 h-4" />;
    case 'shipped': return <Truck className="w-4 h-4" />;
    case 'delivered': return <CheckCircle className="w-4 h-4" />;
    case 'cancelled': return <Clock className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'shipped': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getAddressTypeIcon = (type: 'home' | 'work' | 'other') => {
  switch (type) {
    case 'home': return <Home className="w-4 h-4" />;
    case 'work': return <Building className="w-4 h-4" />;
    case 'other': return <Users className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const getAddressTypeColor = (type: 'home' | 'work' | 'other') => {
  switch (type) {
    case 'home': return 'bg-green-100 text-green-800';
    case 'work': return 'bg-blue-100 text-blue-800';
    case 'other': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsModalProps) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!order) return null;

  const sellerItems = order.items.filter(item => item.sellerId === order.items[0]?.sellerId);
  const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Order Details - #{order.id}</span>
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order placed on {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-120px)]">
          <div className="space-y-8 pr-4">
            {/* Status Management */}
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg flex items-center text-blue-800">
                  <Edit className="w-5 h-5 mr-2" />
                  Update Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Select 
                    value={order.status} 
                    onValueChange={handleStatusUpdate}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-lg text-purple-800">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sellerItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border-2 border-gray-100 rounded-lg bg-gray-50/50">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div className="flex-1 space-y-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                        
                        {item.customization && (
                          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Customization:</strong>
                            {item.customization.text && ` Text: "${item.customization.text}"`}
                            {item.customization.color && ` Color: ${item.customization.color}`}
                            {item.customization.size && ` Size: ${item.customization.size}`}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                          </span>
                          <span className="font-semibold text-lg text-green-600">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information & Shipping */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-green-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg flex items-center text-green-800">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer ID:</span>
                    <span className="text-sm font-medium">{order.userId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <Badge variant="outline" className="capitalize">
                      <CreditCard className="w-3 h-3 mr-1" />
                      {order.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery Method:</span>
                    <Badge variant="outline" className="capitalize">
                      <Truck className="w-3 h-3 mr-1" />
                      {order.deliveryMethod}
                    </Badge>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tracking Number:</span>
                      <span className="text-sm font-mono font-medium bg-gray-100 px-2 py-1 rounded">
                        {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardTitle className="text-lg flex items-center text-orange-800">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getAddressTypeColor(order.shippingAddress.type)}>
                      {getAddressTypeIcon(order.shippingAddress.type)}
                      <span className="ml-1 capitalize">{order.shippingAddress.type}</span>
                    </Badge>
                    {order.shippingAddress.isDefault && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Default Address
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-700">{order.shippingAddress.address}</p>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                    <div className="flex items-center text-sm text-gray-600 mt-3">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <Card className="border-2 border-indigo-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <CardTitle className="text-lg text-indigo-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{sellerTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className="font-medium">₹{order.shipping.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">₹{(sellerTotal + order.shipping - order.discount).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card className="border-2 border-cyan-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                <CardTitle className="text-lg flex items-center text-cyan-800">
                  <Calendar className="w-5 h-5 mr-2" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const OrderCard = ({ 
  order, 
  onViewDetails, 
  onStatusUpdate 
}: { 
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
}) => {
  const sellerItems = order.items.filter(item => item.sellerId === order.items[0]?.sellerId);
  const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">Order #{order.id}</CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
          <span className="font-semibold text-lg text-green-600">₹{sellerTotal.toLocaleString()}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          {sellerItems.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img 
                src={item.product.image} 
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded-lg border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-600">
                  Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                </p>
                {item.customization && (
                  <p className="text-xs text-blue-600">✨ Customized</p>
                )}
              </div>
            </div>
          ))}
          {sellerItems.length > 2 && (
            <p className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded">
              +{sellerItems.length - 2} more items
            </p>
          )}
        </div>
        
        {/* Customer Address */}
        <div className="flex items-center text-sm text-gray-600 p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center mr-2">
            {getAddressTypeIcon(order.shippingAddress.type)}
            <Badge variant="outline" className={`ml-1 ${getAddressTypeColor(order.shippingAddress.type)} text-xs`}>
              {order.shippingAddress.type}
            </Badge>
          </div>
          <span className="truncate">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}
          </span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => onViewDetails(order)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Select 
            value={order.status} 
            onValueChange={(value) => onStatusUpdate(order.id, value as Order['status'])}
          >
            <SelectTrigger className="w-32 hover:border-green-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Orders() {
  const { seller } = useSellerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      if (!seller) return;
      
      try {
        setLoading(true);
        const response = await mockApi.getSellerOrders(seller.id);
        setOrders(response.orders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [seller]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await mockApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-lg text-gray-600">
            Manage and track your customer orders with detailed information
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search orders by ID, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-blue-500 h-12"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 border-2 border-gray-200 focus:border-blue-500 h-12">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Truck className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Shipped</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Orders from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onViewDetails={handleViewDetails}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </DashboardLayout>
  );
}
