"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Image as ImageIcon, Plus, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/db/supabase";

type ProductFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    category_id: initialData?.category_id || "",
    brand: initialData?.brand || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    compare_at_price: initialData?.compare_at_price || "",
    stock: initialData?.stock || "",
    sku: initialData?.sku || "",
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    images: initialData?.images || [],
    attributes: initialData?.attributes || {},
    compatibility: initialData?.compatibility || [],
  });

  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);
  
  // Temp states for JSONB and Arrays
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [newCompatibility, setNewCompatibility] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
    }
    fetchCategories();
  }, []);

  // Handle Slug Generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formPayload = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formPayload.append("images", e.target.files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formPayload,
      });
      const data = await res.json();
      if (res.ok && data.urls) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Error uploading images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index)
    }));
  };

  const addAttribute = () => {
    if (!newAttributeKey || !newAttributeValue) return;
    setFormData(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [newAttributeKey]: newAttributeValue }
    }));
    setNewAttributeKey("");
    setNewAttributeValue("");
  };

  const removeAttribute = (key: string) => {
    setFormData(prev => {
      const newAttr = { ...prev.attributes };
      delete newAttr[key];
      return { ...prev, attributes: newAttr };
    });
  };

  const addCompatibility = () => {
    if (!newCompatibility || formData.compatibility.includes(newCompatibility)) return;
    setFormData(prev => ({
      ...prev,
      compatibility: [...prev.compatibility, newCompatibility]
    }));
    setNewCompatibility("");
  };

  const removeCompatibility = (model: string) => {
    setFormData(prev => ({
      ...prev,
      compatibility: prev.compatibility.filter((c: string) => c !== model)
    }));
  };

  const addVariant = () => {
    setVariants([...variants, { id: `temp-${Date.now()}`, color: "", material: "", wattage: "", length: "", model: "", price_adjustment: 0, stock: 0, sku: "" }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productPayload = {
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id || null,
        brand: formData.brand,
        description: formData.description,
        price: parseFloat(formData.price as any) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price as any) : null,
        stock: parseInt(formData.stock as any) || 0,
        sku: formData.sku,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: formData.images,
        attributes: formData.attributes,
        compatibility: formData.compatibility,
      };

      let productId = initialData?.id;

      if (isEdit) {
        const { error } = await supabase.from("products").update(productPayload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(productPayload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      // Handle Variants (Basic implementation: delete old variants, insert new ones for simplicity)
      if (productId) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
        
        if (variants.length > 0) {
          const variantsPayload = variants.map(v => {
            const payload = { ...v, product_id: productId };
            if (payload.id && payload.id.toString().startsWith('temp-')) delete payload.id;
            return payload;
          });
          const { error: varError } = await supabase.from("product_variants").insert(variantsPayload);
          if (varError) throw varError;
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      alert("Failed to save product: " + err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <Button type="submit" disabled={loading} className="rounded-full font-bold bg-primary hover:bg-primary/90 px-8">
          <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Basic Information</h2>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input required value={formData.name} onChange={handleNameChange} placeholder="e.g. iPhone 15 Pro MagSafe Case" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL Handle)</Label>
              <Input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="iphone-15-pro-magsafe-case" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Apple, Spigen" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Selling Price (₹)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>MRP (Compare at) (₹)</Label>
                <Input type="number" step="0.01" value={formData.compare_at_price} onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-bold">Variants</h2>
              <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-full">
                <Plus className="h-4 w-4 mr-2" /> Add Variant
              </Button>
            </div>
            
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 font-medium">Color</th>
                      <th className="p-2 font-medium">Material</th>
                      <th className="p-2 font-medium">Wattage</th>
                      <th className="p-2 font-medium">Stock</th>
                      <th className="p-2 font-medium">Price Adj.</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2"><Input className="h-8" value={variant.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="e.g. Red" /></td>
                        <td className="p-2"><Input className="h-8" value={variant.material} onChange={(e) => updateVariant(i, "material", e.target.value)} placeholder="e.g. Leather" /></td>
                        <td className="p-2"><Input className="h-8" value={variant.wattage} onChange={(e) => updateVariant(i, "wattage", e.target.value)} placeholder="e.g. 20W" /></td>
                        <td className="p-2"><Input className="h-8 w-20" type="number" value={variant.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value))} /></td>
                        <td className="p-2"><Input className="h-8 w-24" type="number" value={variant.price_adjustment} onChange={(e) => updateVariant(i, "price_adjustment", parseFloat(e.target.value))} /></td>
                        <td className="p-2 text-right">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)} className="text-destructive h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">No variants added. Product will be sold as a single item.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Status & Visibility</h2>
            <div className="flex items-center justify-between">
              <Label>Active (Visible to customers)</Label>
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Featured Product</Label>
              <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
            </div>
          </div>

          {/* Images */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Images</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {formData.images.map((url: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted group">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">Primary</span>}
                </div>
              ))}
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors relative">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP up to 5MB</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-primary">Uploading...</div>}
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Attributes</h2>
            <div className="space-y-2">
              {Object.entries(formData.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-muted/50 px-3 py-2 rounded-lg text-sm">
                  <span className="font-medium">{key}: <span className="font-normal text-muted-foreground">{value as string}</span></span>
                  <button type="button" onClick={() => removeAttribute(key)} className="text-destructive hover:underline"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Key (e.g. Material)" value={newAttributeKey} onChange={(e) => setNewAttributeKey(e.target.value)} className="text-sm" />
              <Input placeholder="Value" value={newAttributeValue} onChange={(e) => setNewAttributeValue(e.target.value)} className="text-sm" />
              <Button type="button" onClick={addAttribute} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Compatibility */}
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-bold mb-4">Device Compatibility</h2>
            <div className="flex flex-wrap gap-2">
              {formData.compatibility.map((model: string) => (
                <Badge key={model} variant="secondary" className="px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20">
                  {model}
                  <button type="button" onClick={() => removeCompatibility(model)} className="ml-1 hover:text-destructive"><X className="h-3 w-3 inline" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="e.g. iPhone 15 Pro" value={newCompatibility} onChange={(e) => setNewCompatibility(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompatibility())} className="text-sm" />
              <Button type="button" onClick={addCompatibility} variant="outline">Add</Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
