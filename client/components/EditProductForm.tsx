import React, { useState, useEffect } from "react";
import { useSellerAuth } from "../contexts/SellerAuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { ProductAPI } from "../lib/finalProductApi";
import { Product } from "@shared/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { X, Plus, Save, Loader2, Package } from "lucide-react";

interface EditProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export default function EditProductForm({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductFormProps) {
  const { seller, token } = useSellerAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    subcategory: "",
    materials: "",
    colors: "",
    sizes: "",
    tags: "",
    stock: "",
    deliveryDays: "",
    sku: "",
    brand: "",
    origin: "",
    lowStockThreshold: "",
    seoTitle: "",
    seoDescription: "",
    image: "",
    images: [] as string[],
    imageFiles: [] as File[],
    isCustomizable: false,
    isDIY: false,
    isInstagramPick: false,
    isHandmade: false,
    isNew: false,
    isTrending: false,
    warranty: {
      enabled: false,
      period: "",
      description: "",
      type: "none" as "none" | "manufacturer" | "seller",
    },
    returnPolicy: {
      enabled: false,
      period: "",
      conditions: "",
    },
    dimensions: {
      length: "",
      width: "",
      height: "",
      weight: "",
      unit: "cm" as "cm" | "inches" | "kg" | "lbs",
    },
    careInstructions: "",
    certifications: "",
    sustainabilityInfo: "",
    faq: [{ question: "", answer: "" }],
  });

  // Pre-populate form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        description: product.description || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        materials: product.materials?.join(", ") || "",
        colors: product.colors?.join(", ") || "",
        sizes: product.sizes?.join(", ") || "",
        tags: product.tags?.join(", ") || "",
        stock: product.stock.toString() || "",
        deliveryDays: product.deliveryDays.toString() || "",
        sku: product.sku || "",
        brand: product.brand || "",
        origin: product.origin || "",
        lowStockThreshold: product.lowStockThreshold.toString() || "",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        image: product.image || "",
        images: product.images || [],
        imageFiles: [] as File[],
        isCustomizable: product.isCustomizable || false,
        isDIY: product.isDIY || false,
        isInstagramPick: product.isInstagramPick || false,
        isHandmade: product.isHandmade || false,
        isNew: product.isNew || false,
        isTrending: product.isTrending || false,
        warranty: {
          enabled: !!product.warranty,
          period: product.warranty?.period || "",
          description: product.warranty?.description || "",
          type: (product.warranty?.type || "none") as
            | "none"
            | "manufacturer"
            | "seller",
        },
        returnPolicy: {
          enabled: !!product.returnPolicy,
          period: product.returnPolicy?.period || "",
          conditions: product.returnPolicy?.conditions?.join(", ") || "",
        },
        dimensions: {
          length: product.dimensions?.length?.toString() || "",
          width: product.dimensions?.width?.toString() || "",
          height: product.dimensions?.height?.toString() || "",
          weight: product.dimensions?.weight?.toString() || "",
          unit: (product.dimensions?.unit || "cm") as
            | "cm"
            | "inches"
            | "kg"
            | "lbs",
        },
        careInstructions: product.careInstructions?.join(", ") || "",
        certifications: product.certifications?.join(", ") || "",
        sustainabilityInfo: product.sustainabilityInfo || "",
        faq:
          product.faq && product.faq.length > 0
            ? product.faq
            : [{ question: "", answer: "" }],
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addFAQItem = () => {
    setFormData((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: "", answer: "" }],
    }));
  };

  const removeFAQItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls: string[] = [];

      // Store the original files for API upload
      setFormData((prev) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...fileArray],
      }));

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          imageUrls.push(imageUrl);

          if (imageUrls.length === fileArray.length) {
            setFormData((prev) => ({
              ...prev,
              image: prev.images.length === 0 ? imageUrls[0] : prev.image,
              images: [...prev.images, ...imageUrls],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newImageFiles = prev.imageFiles.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        imageFiles: newImageFiles,
        image: newImages[0] || "",
      };
    });
  };

  const updateFAQItem = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller || !product) return;

    setLoading(true);
    try {
      const updatedProductData: any = {
        ...product,
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        description: formData.description,
        // Include new image files if they exist
        ...(formData.imageFiles.length > 0 && {
          newImages: formData.imageFiles,
        }),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        materials: formData.materials
          ? formData.materials
              .split(",")
              .map((m) => m.trim())
              .filter((m) => m)
          : [],
        colors: formData.colors
          ? formData.colors
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c)
          : [],
        sizes: formData.sizes
          ? formData.sizes
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : undefined,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
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
        inStock: parseInt(formData.stock) > 0,
        warranty: formData.warranty.enabled
          ? {
              period: formData.warranty.period,
              description: formData.warranty.description,
              type: formData.warranty.type,
            }
          : undefined,
        returnPolicy: formData.returnPolicy.enabled
          ? {
              returnable: true,
              period: formData.returnPolicy.period,
              conditions: formData.returnPolicy.conditions
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c),
            }
          : undefined,
        dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height || formData.dimensions.weight)
          ? {
              length: parseFloat(formData.dimensions.length) || undefined,
              width: parseFloat(formData.dimensions.width) || undefined,
              height: parseFloat(formData.dimensions.height) || undefined,
              weight: parseFloat(formData.dimensions.weight) || undefined,
              unit: formData.dimensions.unit,
            }
          : undefined,
        careInstructions: formData.careInstructions
          ? formData.careInstructions
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c)
          : undefined,
        certifications: formData.certifications
          ? formData.certifications
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c)
          : undefined,
        sustainabilityInfo: formData.sustainabilityInfo || undefined,
        faq: formData.faq.filter((item) => item.question && item.answer),
        // Keep existing images if no new files were uploaded
        ...(formData.imageFiles.length === 0 && {
          image: formData.image || product?.image || "/placeholder.svg",
          images:
            formData.images.length > 0
              ? formData.images
              : product?.images || ["/placeholder.svg"],
        }),
      };

      if (token && product) {
        const savedProduct = await ProductAPI.updateProduct(
          product.id,
          updatedProductData,
          token,
        );
        onSuccess(savedProduct);
      } else {
        throw new Error("Authentication required");
      }
      onClose();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col h-[95vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Edit Product
          </DialogTitle>
          <DialogDescription>
            Update product information and settings
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto pr-2"
          style={{ maxHeight: "calc(95vh - 200px)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Product Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sku">SKU *</Label>
                    <Input
                      id="edit-sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <Label
                    htmlFor="edit-images"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Product Images
                  </Label>
                  <div className="mt-2">
                    <input
                      id="edit-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload additional images or replace existing ones. First
                      image will be the main product image.
                    </p>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-semibold text-gray-700">
                        Current Images
                      </Label>
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
                              <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category *</Label>
                    <Input
                      id="edit-category"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-subcategory">Subcategory</Label>
                    <Input
                      id="edit-subcategory"
                      value={formData.subcategory}
                      onChange={(e) =>
                        handleInputChange("subcategory", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-brand">Brand</Label>
                    <Input
                      id="edit-brand"
                      value={formData.brand}
                      onChange={(e) =>
                        handleInputChange("brand", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price (₹) *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-originalPrice">
                      Original Price (₹)
                    </Label>
                    <Input
                      id="edit-originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        handleInputChange("originalPrice", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-stock">Stock Quantity *</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-lowStockThreshold">
                      Low Stock Threshold *
                    </Label>
                    <Input
                      id="edit-lowStockThreshold"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        handleInputChange("lowStockThreshold", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-materials">
                      Materials (comma separated)
                    </Label>
                    <Input
                      id="edit-materials"
                      value={formData.materials}
                      onChange={(e) =>
                        handleInputChange("materials", e.target.value)
                      }
                      placeholder="Cotton, Silk, Polyester"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-colors">
                      Colors (comma separated)
                    </Label>
                    <Input
                      id="edit-colors"
                      value={formData.colors}
                      onChange={(e) =>
                        handleInputChange("colors", e.target.value)
                      }
                      placeholder="Red, Blue, Green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-sizes">Sizes (comma separated)</Label>
                    <Input
                      id="edit-sizes"
                      value={formData.sizes}
                      onChange={(e) =>
                        handleInputChange("sizes", e.target.value)
                      }
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                    <Input
                      id="edit-tags"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="handmade, gift, vintage"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-origin">Origin *</Label>
                    <Input
                      id="edit-origin"
                      value={formData.origin}
                      onChange={(e) =>
                        handleInputChange("origin", e.target.value)
                      }
                      placeholder="Made in India"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-deliveryDays">Delivery Days *</Label>
                    <Input
                      id="edit-deliveryDays"
                      type="number"
                      value={formData.deliveryDays}
                      onChange={(e) =>
                        handleInputChange("deliveryDays", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-certifications">
                      Certifications (comma separated)
                    </Label>
                    <Input
                      id="edit-certifications"
                      value={formData.certifications}
                      onChange={(e) =>
                        handleInputChange("certifications", e.target.value)
                      }
                      placeholder="Organic, Fair Trade"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Flags */}
            <Card>
              <CardHeader>
                <CardTitle>Product Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "isCustomizable", label: "Customizable" },
                    { key: "isDIY", label: "DIY Kit" },
                    { key: "isInstagramPick", label: "Instagram Pick" },
                    { key: "isHandmade", label: "Handmade" },
                    { key: "isNew", label: "New Product" },
                    { key: "isTrending", label: "Trending" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-${key}`}
                        checked={
                          formData[key as keyof typeof formData] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleInputChange(key, checked)
                        }
                      />
                      <Label htmlFor={`edit-${key}`}>{label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warranty */}
            <Card>
              <CardHeader>
                <CardTitle>Warranty Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-warranty-enabled"
                    checked={formData.warranty.enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("warranty.enabled", checked)
                    }
                  />
                  <Label htmlFor="edit-warranty-enabled">
                    Product has warranty
                  </Label>
                </div>

                {formData.warranty.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-warranty-period">
                        Warranty Period
                      </Label>
                      <Input
                        id="edit-warranty-period"
                        value={formData.warranty.period}
                        onChange={(e) =>
                          handleInputChange("warranty.period", e.target.value)
                        }
                        placeholder="1 year"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-warranty-type">Warranty Type</Label>
                      <select
                        id="edit-warranty-type"
                        value={formData.warranty.type}
                        onChange={(e) =>
                          handleInputChange("warranty.type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="none">No Warranty</option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="seller">Seller</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="edit-warranty-description">
                        Warranty Description
                      </Label>
                      <Input
                        id="edit-warranty-description"
                        value={formData.warranty.description}
                        onChange={(e) =>
                          handleInputChange(
                            "warranty.description",
                            e.target.value,
                          )
                        }
                        placeholder="Coverage details"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Return Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Return Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-return-enabled"
                    checked={formData.returnPolicy.enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("returnPolicy.enabled", checked)
                    }
                  />
                  <Label htmlFor="edit-return-enabled">
                    Product is returnable
                  </Label>
                </div>

                {formData.returnPolicy.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-return-period">Return Period</Label>
                      <Input
                        id="edit-return-period"
                        value={formData.returnPolicy.period}
                        onChange={(e) =>
                          handleInputChange(
                            "returnPolicy.period",
                            e.target.value,
                          )
                        }
                        placeholder="30 days"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-return-conditions">
                        Return Conditions (comma separated)
                      </Label>
                      <Input
                        id="edit-return-conditions"
                        value={formData.returnPolicy.conditions}
                        onChange={(e) =>
                          handleInputChange(
                            "returnPolicy.conditions",
                            e.target.value,
                          )
                        }
                        placeholder="Original packaging, Unused condition"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensions & Weight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="edit-length">Length</Label>
                    <Input
                      id="edit-length"
                      type="number"
                      step="0.1"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        handleInputChange("dimensions.length", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-width">Width</Label>
                    <Input
                      id="edit-width"
                      type="number"
                      step="0.1"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        handleInputChange("dimensions.width", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-height">Height</Label>
                    <Input
                      id="edit-height"
                      type="number"
                      step="0.1"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        handleInputChange("dimensions.height", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-weight">Weight</Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      step="0.1"
                      value={formData.dimensions.weight}
                      onChange={(e) =>
                        handleInputChange("dimensions.weight", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-unit">Unit</Label>
                    <select
                      id="edit-unit"
                      value={formData.dimensions.unit}
                      onChange={(e) =>
                        handleInputChange("dimensions.unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cm">cm/grams</option>
                      <option value="inches">inches/lbs</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Care Instructions & Sustainability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-care">
                    Care Instructions (comma separated)
                  </Label>
                  <Textarea
                    id="edit-care"
                    value={formData.careInstructions}
                    onChange={(e) =>
                      handleInputChange("careInstructions", e.target.value)
                    }
                    placeholder="Hand wash only, Air dry, Avoid direct sunlight"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sustainability">
                    Sustainability Information
                  </Label>
                  <Textarea
                    id="edit-sustainability"
                    value={formData.sustainabilityInfo}
                    onChange={(e) =>
                      handleInputChange("sustainabilityInfo", e.target.value)
                    }
                    placeholder="Made from sustainable materials, eco-friendly packaging"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-seoTitle">SEO Title</Label>
                  <Input
                    id="edit-seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      handleInputChange("seoTitle", e.target.value)
                    }
                    placeholder="SEO optimized title for search engines"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-seoDescription">SEO Description</Label>
                  <Textarea
                    id="edit-seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      handleInputChange("seoDescription", e.target.value)
                    }
                    placeholder="Brief description for search engines"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  FAQ Section
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFAQItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add FAQ
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.faq.map((faq, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">
                        FAQ {index + 1}
                      </span>
                      {formData.faq.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFAQItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) =>
                          updateFAQItem(index, "question", e.target.value)
                        }
                      />
                      <Textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) =>
                          updateFAQItem(index, "answer", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 p-4 border-t bg-white mt-auto sticky bottom-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
