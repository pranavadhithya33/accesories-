"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Eye, EyeOff, CheckSquare, Square, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/db/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    
    if (bulkAction === "delete" && !confirm("Are you sure you want to delete selected products?")) return;

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedIds, action: bulkAction }),
      });

      if (res.ok) {
        setSelectedIds([]);
        setBulkAction("");
        fetchProducts();
      } else {
        alert("Action failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">Products</h1>
        <div className="flex gap-2">
          <a href="/api/products/export" download>
            <Button variant="outline" className="rounded-full shadow-sm">
              Export
            </Button>
          </a>
          <Link href="/admin/products/new">
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-gum">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[#FFE0EB] rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4 bg-card/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-background border-border"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="bg-background border border-border text-foreground text-sm rounded-full focus:ring-primary focus:border-primary block p-2.5 px-4"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="hide">Hide Selected</option>
              <option value="unhide">Unhide Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={executeBulkAction}
              disabled={!bulkAction || selectedIds.length === 0}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/5">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <button onClick={handleSelectAll} className="text-muted-foreground hover:text-primary">
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-black/5 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleSelect(product.id)} className="text-muted-foreground hover:text-primary">
                        {selectedIds.includes(product.id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center overflow-hidden border border-border">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1 max-w-[200px]">{product.name}</p>
                          {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.categories?.name || 'Uncategorized'}</td>
                    <td className="px-4 py-3 font-medium">₹{product.price}</td>
                    <td className="px-4 py-3">
                      <span className={product.stock > 10 ? "text-green-600 font-medium" : product.stock > 0 ? "text-orange-500 font-medium" : "text-destructive font-medium"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><Eye className="h-3 w-3 mr-1" /> Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground"><EyeOff className="h-3 w-3 mr-1" /> Hidden</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Basic Pagination info */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-card/50">
          <span>Showing {filteredProducts.length} products</span>
          {/* Pagination controls would go here */}
        </div>
      </div>
    </div>
  );
}
