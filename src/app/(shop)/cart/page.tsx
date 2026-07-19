"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917397189222";

  const generateWhatsAppMessage = () => {
    let message = "Hi! I want to place an order for the following items:\n\n";
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      if (item.variant) message += `   Variant: ${item.variant}\n`;
      message += `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}\n\n`;
    });
    message += `*Total Amount: ₹${totalPrice()}*\n\n`;
    message += "Please let me know how to proceed with payment.";
    return encodeURIComponent(message);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-card p-8 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added any accessories to your cart yet. Discover our premium collection.
        </p>
        <Link href="/shop" passHref>
          <Button size="lg" className="rounded-full font-bold px-8 py-6 text-lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-heading font-bold text-foreground">Shopping Cart</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="font-medium text-muted-foreground">{items.length} Items</span>
            <button onClick={clearCart} className="text-sm text-destructive hover:underline font-medium">
              Clear All
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-card rounded-[2rem] p-6 shadow-gum border border-border sticky top-24">
            <h2 className="text-xl font-heading font-bold text-foreground mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{totalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center mt-4">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">₹{totalPrice()}</span>
              </div>
            </div>

            <a 
              href={`https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20b958] text-white font-bold py-4 text-lg transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Proceed to Order
            </a>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Clicking above will open WhatsApp with your order details for fast and secure checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
