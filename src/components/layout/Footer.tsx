import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917397189222";
  
  return (
    <footer className="bg-card border-t border-border mt-16 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-2xl tracking-tight text-primary">
              Bubble<span className="text-foreground">Gum</span>
            </h3>
            <p className="text-muted-foreground max-w-xs">
              Premium accessories at direct factory prices. Elevate your tech game today.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=cases" className="text-muted-foreground hover:text-primary transition-colors">Phone Cases</Link></li>
              <li><Link href="/shop?category=chargers" className="text-muted-foreground hover:text-primary transition-colors">Chargers</Link></li>
              <li><Link href="/shop?category=audio" className="text-muted-foreground hover:text-primary transition-colors">Audio</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/track/0" className="text-muted-foreground hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors">Returns Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-foreground">Contact</h4>
            <a 
              href={`https://wa.me/${whatsappNumber}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full font-medium hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BubbleGum Accessories. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
