"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { VariantSwatches } from "@/components/product/VariantSwatches";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { use } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const addItem = useCartStore((state) => state.addItem);
  
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

  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.images[0] || "",
      variant: `Color: ${selectedColor}`,
    });
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917397189222";
  const whatsappMessage = encodeURIComponent(`Hi! I want to order:\n${product.name}\nVariant: ${selectedColor}\nPrice: ₹${product.price}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-card rounded-3xl border border-border flex items-center justify-center overflow-hidden relative">
            <span className="text-muted-foreground">Product Image</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center hover:border-primary cursor-pointer transition-colors">
                <span className="text-xs text-muted-foreground">Thumb</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-primary font-bold tracking-wider uppercase text-sm mb-2">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-6 pb-6 border-b border-border">
            <span className="text-4xl font-bold text-foreground">₹{product.price}</span>
            {product.compare_at_price && (
              <span className="text-xl text-muted-foreground line-through mb-1">₹{product.compare_at_price}</span>
            )}
          </div>

          <div className="mb-8">
            <VariantSwatches 
              colors={product.colors} 
              onSelect={(type, value) => {
                if (type === "color") setSelectedColor(value);
              }} 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              size="lg" 
              className="flex-1 rounded-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20b958] text-white font-bold py-4 text-lg transition-colors"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 py-6 border-y border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">6 Months Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">7 Days Return</span>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-heading">Description</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="compatibility">
              <AccordionTrigger className="text-lg font-heading">Compatibility</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  {product.compatibility.map(device => (
                    <li key={device}>{device}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
