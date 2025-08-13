import React, { useState } from 'react';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Store, 
  Phone, 
  MapPin, 
  CreditCard, 
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';

export default function Profile() {
  const { seller, updateProfile } = useSellerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: seller?.storeName || '',
    contactNumber: seller?.contactNumber || '',
    businessAddress: seller?.businessAddress || '',
    gstNumber: seller?.gstNumber || '',
    bankAccountNumber: seller?.bankDetails?.accountNumber || '',
    bankIfscCode: seller?.bankDetails?.ifscCode || '',
    bankName: seller?.bankDetails?.bankName || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepare update data
      const updateData = {
        storeName: formData.storeName,
        contactNumber: formData.contactNumber,
        businessAddress: formData.businessAddress,
        gstNumber: formData.gstNumber,
        bankDetails: {
          accountNumber: formData.bankAccountNumber,
          ifscCode: formData.bankIfscCode,
          bankName: formData.bankName
        }
      };

      const success = await updateProfile(updateData);

      if (success) {
        setIsEditing(false);
        // Show success message (you could add a toast notification here)
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
        // Show error message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your store information and settings
            </p>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="mt-4 sm:mt-0"
            variant={isEditing ? "default" : "outline"}
            disabled={loading}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </>
            ) : (
              'Edit Profile'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{seller?.storeName}</h3>
                  <p className="text-sm text-gray-600">{seller?.email}</p>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verification Status</span>
                    <Badge variant={seller?.isVerified ? "default" : "secondary"} className="flex items-center">
                      {seller?.isVerified ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {seller?.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {seller?.joinedDate ? new Date(seller.joinedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seller ID</span>
                    <span className="text-sm font-mono text-gray-900">{seller?.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="w-5 h-5 mr-2" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your GST number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      type="password"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bankIfscCode">IFSC Code</Label>
                  <Input
                    id="bankIfscCode"
                    value={formData.bankIfscCode}
                    onChange={(e) => handleInputChange('bankIfscCode', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      value={seller?.email || ''}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <Label>Member Since</Label>
                    <Input
                      value={seller?.joinedDate ? new Date(seller.joinedDate).toLocaleDateString() : ''}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
