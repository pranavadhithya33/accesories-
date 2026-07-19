import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";
import Link from "next/link";
import { Package, User, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/db/supabase";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = await decrypt(token);
  if (!payload) {
    redirect("/login");
  }

  // Fetch user data
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email, phone, created_at")
    .eq("id", payload.userId)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">My Account</h1>
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 shadow-gum border border-border col-span-1 md:col-span-2">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold">{user?.name || "Customer"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{user?.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <Link href="/orders" className="block bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary transition-colors hover:shadow-gum">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">My Orders</h3>
                <p className="text-sm text-muted-foreground">View and track past orders</p>
              </div>
            </div>
          </Link>

          <Link href="/account/addresses" className="block bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary transition-colors hover:shadow-gum">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl text-green-600 dark:text-green-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">Saved Addresses</h3>
                <p className="text-sm text-muted-foreground">Manage delivery locations</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
