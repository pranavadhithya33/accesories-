"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger className="text-primary rounded-full hover:bg-card h-10 w-10 flex items-center justify-center">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background border-r-border">
              <nav className="flex flex-col gap-6 mt-8">
                <Link href="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Home</Link>
                <Link href="/shop" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Shop</Link>
                <Link href="/track/0" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Track Order</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-heading font-bold text-2xl tracking-tight text-primary">
            Bubble<span className="text-foreground">Gum</span>
          </span>
        </Link>

        {/* Desktop Nav & Search */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search accessories..." 
              className="w-full pl-10 rounded-full border-primary/20 focus-visible:ring-primary focus-visible:border-primary bg-card/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/account" passHref>
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-foreground hover:text-primary hover:bg-card transition-colors">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="relative rounded-full text-foreground hover:text-primary hover:bg-card transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
