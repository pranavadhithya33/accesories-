"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function BulkImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreview(data);
      } catch (err) {
        setError("Invalid Excel file format.");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: preview }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import");
      }

      alert(`Successfully imported ${data.count} products!`);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Bulk Import</h1>
          <p className="text-muted-foreground mt-1">Upload an Excel file (.xlsx) to add multiple products at once.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#FFE0EB] p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="font-heading font-bold text-xl mb-4">Instructions</h2>
            <ul className="text-sm space-y-3 text-muted-foreground list-disc pl-5">
              <li>Required columns: <strong>Name, Price, Stock</strong></li>
              <li>Optional columns: Brand, Description, CompareAtPrice, SKU, Images</li>
              <li>Images should be comma-separated Cloudinary URLs.</li>
              <li>Categories must be mapped manually or created beforehand if handling IDs.</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-border">
              <Button variant="outline" className="w-full rounded-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Template
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-sm p-8 text-center relative hover:bg-muted/50 transition-colors">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-bold">Click or drag file to upload</h3>
            <p className="text-sm text-muted-foreground mt-2">Supports .xlsx and .csv files</p>
            {file && <p className="text-sm font-bold text-primary mt-4">{file.name}</p>}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-[#FFE0EB]">
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Preview ({preview.length} items)
                </h3>
                <Button onClick={handleImport} disabled={loading} className="rounded-full bg-primary hover:bg-primary/90 font-bold">
                  {loading ? "Importing..." : "Confirm Import"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-black/5 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3 font-medium">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{row.Name || row.name}</td>
                        <td className="px-4 py-3">₹{row.Price || row.price}</td>
                        <td className="px-4 py-3">{row.Stock || row.stock}</td>
                        <td className="px-4 py-3">{row.Brand || row.brand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 10 && (
                <div className="p-3 text-center text-xs text-muted-foreground bg-muted/50">
                  Showing first 10 rows...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
