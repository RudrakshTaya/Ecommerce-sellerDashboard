import React, { useState } from 'react';
import { useSellerAuth } from '../contexts/SellerAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ProductAPI } from '../lib/productApi';
import { Product } from '@shared/api';
import { 
  X, 
  Plus, 
  Save, 
  Upload,
  Loader2,
  Package,
  Star,
  Palette,
  Shield,
  RotateCcw,
  Ruler,
  Heart,
  Award,
    Leaf,
  Search,
  HelpCircle,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export default function AddProductForm({ isOpen, onClose, onSuccess }: AddProductFormProps) {
  const { seller, token } = useSellerAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    category: '',
    subcategory: '',
    materials: '',
    colors: '',
    sizes: '',
    tags: '',
    stock: '',
    deliveryDays: '',
    sku: '',
    brand: '',
    origin: '',
    lowStockThreshold: '',
    seoTitle: '',
    seoDescription: '',
    image: '',
    images: [] as string[],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: false,
    isNew: false,
    isTrending: false,
    warranty: {
      enabled: false,
      period: '',
      description: '',
      type: 'none' as const
    },
    returnPolicy: {
      enabled: false,
      period: '',
      conditions: ''
    },
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
      unit: 'cm' as const
    },
    careInstructions: '',
    certifications: '',
    sustainabilityInfo: '',
    faq: [{ question: '', answer: '' }]
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls: string[] = [];

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          imageUrls.push(imageUrl);

          if (imageUrls.length === fileArray.length) {
            setFormData(prev => ({
              ...prev,
              image: imageUrls[0] || '',
              images: imageUrls
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || ''
      };
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addFAQItem = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  };

  const removeFAQItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }));
  };

  const updateFAQItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.deliveryDays || parseInt(formData.deliveryDays) <= 0) newErrors.deliveryDays = 'Valid delivery days is required';
    if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
    if (!formData.lowStockThreshold || parseInt(formData.lowStockThreshold) < 0) newErrors.lowStockThreshold = 'Valid low stock threshold is required';

    // Price validation
    if (formData.originalPrice && parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
      newErrors.originalPrice = 'Original price must be higher than current price';
    }

    // Stock validation
    if (parseInt(formData.stock) < parseInt(formData.lowStockThreshold)) {
      newErrors.lowStockThreshold = 'Low stock threshold cannot be higher than current stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        description: formData.description,
        image: formData.image || '/placeholder.svg',
        images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        materials: formData.materials.split(',').map(m => m.trim()).filter(m => m),
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        stock: parseInt(formData.stock),
        deliveryDays: parseInt(formData.deliveryDays),
        sku: formData.sku,
        brand: formData.brand || undefined,
        origin: formData.origin,
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        isCustomizable: formData.isCustomizable,
        isDIY: formData.isDIY,
        isInstagramPick: formData.isInstagramPick,
        isHandmade: formData.isHandmade,
        isNew: formData.isNew,
        isTrending: formData.isTrending,
        sellerId: seller.id,
        inStock: parseInt(formData.stock) > 0,
        warranty: formData.warranty.enabled ? {
          period: formData.warranty.period,
          description: formData.warranty.description,
          type: formData.warranty.type
        } : undefined,
        returnPolicy: formData.returnPolicy.enabled ? {
          returnable: true,
          period: formData.returnPolicy.period,
          conditions: formData.returnPolicy.conditions.split(',').map(c => c.trim()).filter(c => c)
        } : undefined,
        dimensions: formData.dimensions.length ? {
          length: parseFloat(formData.dimensions.length) || undefined,
          width: parseFloat(formData.dimensions.width) || undefined,
          height: parseFloat(formData.dimensions.height) || undefined,
          weight: parseFloat(formData.dimensions.weight) || undefined,
          unit: formData.dimensions.unit
        } : undefined,
        careInstructions: formData.careInstructions ? 
          formData.careInstructions.split(',').map(c => c.trim()).filter(c => c) : undefined,
        certifications: formData.certifications ?
          formData.certifications.split(',').map(c => c.trim()).filter(c => c) : undefined,
        sustainabilityInfo: formData.sustainabilityInfo || undefined,
        faq: formData.faq.filter(item => item.question && item.answer),
        rating: 0,
        reviews: 0,
        badges: []
      };

      if (token) {
        const savedProduct = await ProductAPI.addProduct(productData, token);
        onSuccess(savedProduct);
        onClose();
      } else {
        throw new Error('Authentication required');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors({ submit: 'Failed to save product. Please check your input and try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center">
            <Package className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-bold">Add New Product</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center text-blue-800">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 ${errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Enter product name"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="sku" className="text-sm font-semibold text-gray-700">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className={`mt-1 ${errors.sku ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Product SKU"
                    required
                  />
                  {errors.sku && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.sku}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`mt-1 ${errors.description ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                  rows={4}
                  placeholder="Detailed product description"
                  required
                />
                {errors.description && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.description}</p>}
              </div>

              {/* Image Upload Section */}
              <div>
                <Label htmlFor="images" className="text-sm font-semibold text-gray-700">Product Images</Label>
                <div className="mt-2">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload multiple images (JPG, PNG, GIF). First image will be the main product image.</p>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-semibold text-gray-700">Image Preview</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">Main</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`mt-1 ${errors.category ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Product category"
                    required
                  />
                  {errors.category && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="subcategory" className="text-sm font-semibold text-gray-700">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-blue-500"
                    placeholder="Product subcategory"
                  />
                </div>
                <div>
                  <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-blue-500"
                    placeholder="Brand name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center text-green-800">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`mt-1 ${errors.price ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="0.00"
                    required
                  />
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-green-500"
                    placeholder="0.00"
                  />
                  {errors.originalPrice && <p className="text-sm text-red-600 mt-1">{errors.originalPrice}</p>}
                </div>
                <div>
                  <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className={`mt-1 ${errors.stock ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="0"
                    required
                  />
                  {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold" className="text-sm font-semibold text-gray-700">Low Stock Alert *</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                    className={`mt-1 ${errors.lowStockThreshold ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-green-500'}`}
                    placeholder="5"
                    required
                  />
                  {errors.lowStockThreshold && <p className="text-sm text-red-600 mt-1">{errors.lowStockThreshold}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Attributes */}
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center text-purple-800">
                <Palette className="w-5 h-5 mr-2" />
                Product Attributes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="materials" className="text-sm font-semibold text-gray-700">Materials</Label>
                  <Input
                    id="materials"
                    value={formData.materials}
                    onChange={(e) => handleInputChange('materials', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="Cotton, Silk, Polyester"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                </div>
                <div>
                  <Label htmlFor="colors" className="text-sm font-semibold text-gray-700">Colors</Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => handleInputChange('colors', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="Red, Blue, Green"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sizes" className="text-sm font-semibold text-gray-700">Available Sizes</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => handleInputChange('sizes', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="S, M, L, XL"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                </div>
                <div>
                  <Label htmlFor="tags" className="text-sm font-semibold text-gray-700">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="handmade, gift, vintage"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="origin" className="text-sm font-semibold text-gray-700">Origin *</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className={`mt-1 ${errors.origin ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                    placeholder="Made in India"
                    required
                  />
                  {errors.origin && <p className="text-sm text-red-600 mt-1">{errors.origin}</p>}
                </div>
                <div>
                  <Label htmlFor="deliveryDays" className="text-sm font-semibold text-gray-700">Delivery Days *</Label>
                  <Input
                    id="deliveryDays"
                    type="number"
                    value={formData.deliveryDays}
                    onChange={(e) => handleInputChange('deliveryDays', e.target.value)}
                    className={`mt-1 ${errors.deliveryDays ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                    placeholder="7"
                    required
                  />
                  {errors.deliveryDays && <p className="text-sm text-red-600 mt-1">{errors.deliveryDays}</p>}
                </div>
                <div>
                  <Label htmlFor="certifications" className="text-sm font-semibold text-gray-700">Certifications</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="Organic, Fair Trade"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma separated values</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Flags */}
          <Card className="border-2 border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="flex items-center text-orange-800">
                <Star className="w-5 h-5 mr-2" />
                Product Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { key: 'isCustomizable', label: 'Customizable', icon: '🎨' },
                  { key: 'isDIY', label: 'DIY Kit', icon: '🔧' },
                  { key: 'isInstagramPick', label: 'Instagram Pick', icon: '📷' },
                  { key: 'isHandmade', label: 'Handmade', icon: '✋' },
                  { key: 'isNew', label: 'New Product', icon: '✨' },
                  { key: 'isTrending', label: 'Trending', icon: '📈' }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:border-orange-300 transition-colors">
                    <span className="text-lg">{icon}</span>
                    <Switch
                      id={key}
                      checked={formData[key as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => handleInputChange(key, checked)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                    <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warranty Information */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center text-blue-800">
                <Shield className="w-5 h-5 mr-2" />
                Warranty Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <Switch
                  id="warranty-enabled"
                  checked={formData.warranty.enabled}
                  onCheckedChange={(checked) => handleInputChange('warranty.enabled', checked)}
                  className="data-[state=checked]:bg-blue-500"
                />
                <Label htmlFor="warranty-enabled" className="text-sm font-semibold">Product has warranty</Label>
              </div>

              {formData.warranty.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="warranty-period" className="text-sm font-semibold text-gray-700">Warranty Period</Label>
                    <Input
                      id="warranty-period"
                      value={formData.warranty.period}
                      onChange={(e) => handleInputChange('warranty.period', e.target.value)}
                      className="mt-1 border-gray-300 focus:border-blue-500"
                      placeholder="1 year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty-type" className="text-sm font-semibold text-gray-700">Warranty Type</Label>
                    <select
                      id="warranty-type"
                      value={formData.warranty.type}
                      onChange={(e) => handleInputChange('warranty.type', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">No Warranty</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="warranty-description" className="text-sm font-semibold text-gray-700">Description</Label>
                    <Textarea
                      id="warranty-description"
                      value={formData.warranty.description}
                      onChange={(e) => handleInputChange('warranty.description', e.target.value)}
                      className="mt-1 border-gray-300 focus:border-blue-500"
                      placeholder="Coverage details"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Policy */}
          <Card className="border-2 border-green-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
              <CardTitle className="flex items-center text-green-800">
                <RotateCcw className="w-5 h-5 mr-2" />
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <RotateCcw className="w-5 h-5 text-green-600" />
                <Switch
                  id="return-enabled"
                  checked={formData.returnPolicy.enabled}
                  onCheckedChange={(checked) => handleInputChange('returnPolicy.enabled', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="return-enabled" className="text-sm font-semibold">Product is returnable</Label>
              </div>

              {formData.returnPolicy.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="return-period" className="text-sm font-semibold text-gray-700">Return Period</Label>
                    <Input
                      id="return-period"
                      value={formData.returnPolicy.period}
                      onChange={(e) => handleInputChange('returnPolicy.period', e.target.value)}
                      className="mt-1 border-gray-300 focus:border-green-500"
                      placeholder="30 days"
                    />
                  </div>
                  <div>
                    <Label htmlFor="return-conditions" className="text-sm font-semibold text-gray-700">Return Conditions</Label>
                    <Textarea
                      id="return-conditions"
                      value={formData.returnPolicy.conditions}
                      onChange={(e) => handleInputChange('returnPolicy.conditions', e.target.value)}
                      className="mt-1 border-gray-300 focus:border-green-500"
                      placeholder="Original packaging, Unused condition"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma separated conditions</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dimensions */}
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center text-purple-800">
                <Ruler className="w-5 h-5 mr-2" />
                Dimensions & Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <Label htmlFor="length" className="text-sm font-semibold text-gray-700">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.length}
                    onChange={(e) => handleInputChange('dimensions.length', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="width" className="text-sm font-semibold text-gray-700">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-semibold text-gray-700">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.weight}
                    onChange={(e) => handleInputChange('dimensions.weight', e.target.value)}
                    className="mt-1 border-gray-300 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">Unit</Label>
                  <select
                    id="unit"
                    value={formData.dimensions.unit}
                    onChange={(e) => handleInputChange('dimensions.unit', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="cm">cm/grams</option>
                    <option value="inches">inches/lbs</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Care & Sustainability */}
          <Card className="border-2 border-emerald-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
              <CardTitle className="flex items-center text-emerald-800">
                <Heart className="w-5 h-5 mr-2" />
                Care Instructions & Sustainability
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="care" className="text-sm font-semibold text-gray-700">Care Instructions</Label>
                <Textarea
                  id="care"
                  value={formData.careInstructions}
                  onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-emerald-500"
                  placeholder="Hand wash only, Air dry, Avoid direct sunlight"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Comma separated instructions</p>
              </div>
              <div>
                <Label htmlFor="sustainability" className="text-sm font-semibold text-gray-700">Sustainability Information</Label>
                <Textarea
                  id="sustainability"
                  value={formData.sustainabilityInfo}
                  onChange={(e) => handleInputChange('sustainabilityInfo', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-emerald-500"
                  placeholder="Made from sustainable materials, eco-friendly packaging"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card className="border-2 border-indigo-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center text-indigo-800">
                <Search className="w-5 h-5 mr-2" />
                SEO Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="seoTitle" className="text-sm font-semibold text-gray-700">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-indigo-500"
                  placeholder="SEO optimized title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription" className="text-sm font-semibold text-gray-700">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-indigo-500"
                  placeholder="Brief description for search engines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="border-2 border-amber-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-amber-800">
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  FAQ Section
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addFAQItem}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add FAQ
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.faq.map((faq, index) => (
                <div key={index} className="p-4 border-2 border-amber-100 rounded-lg bg-amber-50/50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-amber-800">FAQ {index + 1}</span>
                    {formData.faq.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQItem(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFAQItem(index, 'question', e.target.value)}
                      className="border-amber-200 focus:border-amber-500"
                    />
                    <Textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFAQItem(index, 'answer', e.target.value)}
                      className="border-amber-200 focus:border-amber-500"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
