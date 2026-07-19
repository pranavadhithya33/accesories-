import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/db/supabase";
import { Badge } from "@/components/ui/badge";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = await decrypt(token);
  if (!payload) {
    redirect("/login");
  }

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false });

  // Dummy order if none exist
  const displayOrders = orders && orders.length > 0 ? orders : [
    {
      id: "demo-1",
      order_number: "ORD-123456",
      status: "shipped",
      total_amount: 1499,
      created_at: new Date().toISOString(),
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Orders</h1>
      </div>

      <div className="space-y-4">
        {displayOrders.map((order) => (
          <Link key={order.id} href={`/track/${order.id.replace("demo-", "0")}`} className="block bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary transition-colors hover:shadow-gum group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{order.order_number}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="font-bold text-lg">₹{order.total_amount}</p>
                  <Badge variant="outline" className="mt-1 uppercase tracking-wider text-xs">
                    {order.status}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
