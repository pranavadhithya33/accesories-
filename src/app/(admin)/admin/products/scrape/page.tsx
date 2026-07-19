"use client";

import { useState } from "react";
import { Link2, Download, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductForm } from "@/components/admin/ProductForm";

export default function ScrapeProductPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError("");
    setScrapedData(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to scrape");
      }

      setScrapedData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!scrapedData ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">Import via URL</h1>
            <p className="text-muted-foreground">Scrape product details directly from Amazon or Flipkart.</p>
          </div>

          <div className="bg-[#FFE0EB] p-8 rounded-3xl border border-border shadow-sm">
            <form onSubmit={handleScrape} className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium">Product URL</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="url"
                    required
                    placeholder="https://www.amazon.in/dp/B0CHX1W1XY"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-12 rounded-full py-6 text-lg bg-background border-border"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !url} 
                className="w-full rounded-full font-bold bg-primary hover:bg-primary/90 py-6 text-lg"
              >
                {loading ? "Scraping Data..." : (
                  <>
                    <Download className="mr-2 h-5 w-5" /> Extract Product Info
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Supported sites: Amazon (.in, .com), Flipkart
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <ArrowRight className="h-5 w-5" />
            <p className="font-medium">Successfully scraped data! Review and edit the details below before saving.</p>
            <Button variant="ghost" onClick={() => setScrapedData(null)} className="ml-auto text-green-800">Scrape Another</Button>
          </div>
          
          <ProductForm initialData={{
            name: scrapedData.title,
            brand: scrapedData.brand,
            description: scrapedData.description,
            price: scrapedData.price,
            compare_at_price: scrapedData.mrp,
            images: scrapedData.images,
            is_active: false, // Default to hidden until reviewed
          }} />
        </div>
      )}
    </div>
  );
}
