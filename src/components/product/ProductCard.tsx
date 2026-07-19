import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    compare_at_price?: number;
    image: string;
    compatibility?: string[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="group relative bg-card rounded-2xl p-4 shadow-gum hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-10 rounded-full bg-background/80 hover:bg-background hover:text-accent"
      >
        <Heart className="h-5 w-5" />
      </Button>
      
      {discount > 0 && (
        <Badge className="absolute top-4 left-4 z-10 bg-discount text-discount-foreground hover:bg-discount/90 font-bold px-2 py-1">
          {discount}% OFF
        </Badge>
      )}

      <Link href={`/shop/${product.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-background mb-4">
        {/* Placeholder for now since we might not have a real Cloudinary image configured yet */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-sm">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="lazy" />
          ) : (
            "Image Placeholder"
          )}
        </div>
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{product.brand}</p>
        <h3 className="font-heading font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        
        {product.compatibility && product.compatibility.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            For {product.compatibility.join(", ")}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-lg text-foreground">₹{product.price}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">₹{product.compare_at_price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
