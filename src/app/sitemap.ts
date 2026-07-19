import { MetadataRoute } from "next";
import { supabase } from "@/lib/db/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bubblegum-accessories.vercel.app";

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    // Fetch all active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (products) {
      const productRoutes = products.map((product) => ({
        url: `${baseUrl}/shop/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      routes.push(...productRoutes);
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}
