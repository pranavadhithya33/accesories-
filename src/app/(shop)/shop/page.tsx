import { ProductCard } from "@/components/product/ProductCard";
import { supabase } from "@/lib/db/supabase";

export const metadata = {
  title: "Shop Mobile Accessories | Cases, Chargers, Screen Guards",
  description: "Browse our extensive collection of mobile accessories, cases, chargers, and screen guards.",
};

export const revalidate = 3600; // ISR for shop page

// Using Next.js 15 searchParams is a Promise
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = params.category as string | undefined;

  let query = supabase.from("products").select("*, categories!inner(slug)").eq("is_active", true);

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data: products, error } = await query;

  // Fallback dummy products if db is empty or errors
  const displayProducts = products && products.length > 0 ? products : [
    { id: "1", slug: "iphone-15-pro-max-clear-case", name: "iPhone 15 Pro Max Clear Case with MagSafe", brand: "Spigen", price: 1499, compare_at_price: 1999, image: "", compatibility: ["iPhone 15 Pro Max"] },
    { id: "2", slug: "samsung-s24-ultra-silicone", name: "Samsung Galaxy S24 Ultra Silicone Cover", brand: "Samsung", price: 1299, image: "", compatibility: ["Galaxy S24 Ultra"] },
    { id: "3", slug: "65w-gan-charger", name: "65W GaN Fast Charger with Dual USB-C", brand: "Anker", price: 2499, compare_at_price: 3999, image: "", compatibility: ["Universal"] },
    { id: "4", slug: "airpods-pro-2-case", name: "Rugged Armor Case for AirPods Pro 2", brand: "Spigen", price: 899, image: "", compatibility: ["AirPods Pro 2"] },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">Categories</h3>
            <ul className="space-y-2">
              {['All', 'Cases', 'Chargers', 'Audio', 'Protection'].map(cat => (
                <li key={cat}>
                  <a href={`/shop${cat !== 'All' ? `?category=${cat.toLowerCase()}` : ''}`} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
                      {((category === cat.toLowerCase()) || (!category && cat === 'All')) && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">Price Range</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary border-border" /> Under ₹500</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary border-border" /> ₹500 - ₹1000</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary border-border" /> ₹1000 - ₹2000</label></li>
              <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded text-primary focus:ring-primary border-border" /> Over ₹2000</label></li>
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
            </h1>
            <select className="bg-card border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
