import { ClientProductDetail } from "./ClientProductDetail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Real implementation would fetch product by slug
  // For now using the static dummy product
  const productName = slug === "iphone-15-pro-max-clear-case" ? "iPhone 15 Pro Max Clear Case with MagSafe" : slug;

  return {
    title: `${productName} | Buy at Best Price`,
    description: `Shop the ${productName} at the best price on Only Gadjets.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Dummy product for now. In a real app, fetch from Supabase based on slug.
  const product = {
    id: "1",
    name: "iPhone 15 Pro Max Clear Case with MagSafe",
    brand: "Spigen",
    price: 1499,
    compare_at_price: 1999,
    description: "Crystal clear transparency flaunts original phone design. Raised bezels lift screen and camera off flat surfaces. Pronounced buttons are easy to feel and press, while large cutouts fit most cables.",
    images: ["", "", ""], // placeholders
    colors: [{ name: "Crystal Clear", hex: "#ffffff" }, { name: "Matte Black", hex: "#1a1a1a" }],
    compatibility: ["iPhone 15 Pro Max", "iPhone 15 Pro"],
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917397189222";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images[0] || "https://bubblegum-accessories.vercel.app/og-image.jpg",
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClientProductDetail product={product} whatsappNumber={whatsappNumber} />
    </div>
  );
}
