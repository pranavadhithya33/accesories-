"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  MessageSquare,
  Users,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/content", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return <main className="min-h-screen bg-[#FFF0F5]">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-[#FFF0F5]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="font-heading font-bold text-xl tracking-tight text-primary">
              Admin<span className="text-foreground">Panel</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {adminNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 md:hidden flex items-center justify-between px-4 bg-card border-b border-border">
          <Link href="/admin/dashboard">
            <span className="font-heading font-bold text-lg text-primary">
              Admin<span className="text-foreground">Panel</span>
            </span>
          </Link>
          <Sheet>
            <SheetTrigger className="p-2 text-primary">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-card">
              <div className="h-16 flex items-center px-6 border-b border-border">
                <span className="font-heading font-bold text-xl text-primary">
                  BubbleGum <span className="text-foreground">Admin</span>
                </span>
              </div>
              <nav className="flex-1 py-4 px-2 space-y-1">
                {adminNav.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg font-medium",
                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
