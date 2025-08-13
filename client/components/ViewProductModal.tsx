import React from 'react';
import { Product } from '@shared/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  X, 
  Star, 
  MapPin, 
  Package, 
  Clock, 
  Shield, 
  RotateCcw, 
  Heart,
  Award,
  Leaf,
  Info,
  HelpCircle,
  Ruler,
  Palette,
  Shirt,
  Edit,
  TrendingUp
} from 'lucide-react';

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export default function ViewProductModal({ product, isOpen, onClose, onEdit }: ViewProductModalProps) {
  if (!product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {product.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" onClick={() => onEdit(product)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Image Gallery & Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white font-bold">
                        {discountPercentage}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
                
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1, 5).map((img, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img src={img} alt={`${product.name} ${index + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Pricing */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xl text-gray-500 line-through">
                            ₹{product.originalPrice!.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-medium">{product.rating}</span>
                        </div>
                        <span className="text-gray-600">({product.reviews} reviews)</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {product.badges.map((badge, index) => (
                          <Badge key={index} variant="default" className="bg-blue-600">
                            {badge}
                          </Badge>
                        ))}
                        {product.isNew && <Badge className="bg-green-600">New</Badge>}
                        {product.isTrending && (
                          <Badge className="bg-purple-600">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        {product.isHandmade && <Badge variant="secondary">Handmade</Badge>}
                        {product.isDIY && <Badge className="bg-orange-600">DIY Kit</Badge>}
                        {product.isInstagramPick && (
                          <Badge className="bg-pink-600">📷 Instagram Pick</Badge>
                        )}
                        {product.isCustomizable && <Badge variant="outline">Customizable</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Stock: <strong>{product.stock}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span><strong>{product.deliveryDays}</strong> days delivery</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{product.origin}</span>
                      </div>
                      <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-gray-500" />
                        <span>SKU: <strong>{product.sku}</strong></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Product Information Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Attributes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Product Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.subcategory && (
                        <Badge variant="outline">{product.subcategory}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Materials</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Colors</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Available Sizes</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Shirt className="w-3 h-3 mr-1" />
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {product.brand && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Brand</h4>
                      <Badge variant="outline">{product.brand}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dimensions */}
              {product.dimensions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Ruler className="w-5 h-5 mr-2" />
                      Dimensions & Weight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {product.dimensions.length && (
                        <div>
                          <span className="text-gray-600">Length:</span>
                          <p className="font-medium">{product.dimensions.length} {product.dimensions.unit}</p>
                        </div>
                      )}
                      {product.dimensions.width && (
                        <div>
                          <span className="text-gray-600">Width:</span>
                          <p className="font-medium">{product.dimensions.width} {product.dimensions.unit}</p>
                        </div>
                      )}
                      {product.dimensions.height && (
                        <div>
                          <span className="text-gray-600">Height:</span>
                          <p className="font-medium">{product.dimensions.height} {product.dimensions.unit}</p>
                        </div>
                      )}
                      {product.dimensions.weight && (
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <p className="font-medium">{product.dimensions.weight} {product.dimensions.unit === 'cm' ? 'grams' : 'lbs'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Warranty & Returns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {product.warranty && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Warranty Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <p className="font-medium">{product.warranty.period}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium capitalize">{product.warranty.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Coverage:</span>
                        <p className="text-sm">{product.warranty.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.returnPolicy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Return Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600">Returnable:</span>
                        <p className="font-medium">{product.returnPolicy.returnable ? 'Yes' : 'No'}</p>
                      </div>
                      {product.returnPolicy.returnable && (
                        <>
                          <div>
                            <span className="text-gray-600">Return Period:</span>
                            <p className="font-medium">{product.returnPolicy.period}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Conditions:</span>
                            <ul className="text-sm space-y-1 mt-1">
                              {product.returnPolicy.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Care Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.careInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Certifications & Sustainability */}
            {(product.certifications?.length || product.sustainabilityInfo) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {product.certifications && product.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {product.certifications.map((cert, index) => (
                          <Badge key={index} variant="default" className="bg-green-600">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {product.sustainabilityInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Leaf className="w-5 h-5 mr-2" />
                        Sustainability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{product.sustainabilityInfo}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Vendor Information */}
            {product.vendor && (
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600">Vendor:</span>
                      <p className="font-medium">{product.vendor.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{product.vendor.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{product.vendor.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            {product.faq && product.faq.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.faq.map((faqItem, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {faqItem.question}
                        </h4>
                        <p className="text-sm text-gray-600">{faqItem.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Information */}
            {(product.seoTitle || product.seoDescription) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.seoTitle && (
                    <div>
                      <span className="text-gray-600">SEO Title:</span>
                      <p className="font-medium">{product.seoTitle}</p>
                    </div>
                  )}
                  {product.seoDescription && (
                    <div>
                      <span className="text-gray-600">SEO Description:</span>
                      <p className="text-sm">{product.seoDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
