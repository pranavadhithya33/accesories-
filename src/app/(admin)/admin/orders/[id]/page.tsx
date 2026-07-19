import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/db/supabase";
import { ArrowLeft, User, MapPin, Package, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "@/components/admin/OrderActions";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*, users(*), addresses(*)")
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  // Fetch order items (assuming order_items table exists and links product and order)
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("*, products(name, images)")
    .eq("order_id", id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Order {order.order_number}</h1>
          <p className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge variant="outline" className="ml-auto uppercase tracking-wider">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items */}
          <div className="bg-[#FFE0EB] p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" /> Order Items
            </h2>
            
            <div className="space-y-4">
              {items && items.length > 0 ? items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-background rounded-2xl border border-border">
                  <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    {item.products?.images?.[0] && (
                      <img src={item.products.images[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.products?.name || "Product"}</h4>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price_at_time}</p>
                  </div>
                  <div className="text-right font-bold">
                    ₹{item.quantity * item.price_at_time}
                  </div>
                </div>
              )) : (
                <div className="p-4 bg-background rounded-2xl border border-border text-center text-muted-foreground text-sm">
                  No items recorded in database. (Demo order)
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
              <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <User className="h-5 w-5" /> Customer Info
              </h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-base">{order.users?.name || 'Guest User'}</p>
                <p className="text-muted-foreground">{order.users?.email || 'N/A'}</p>
                <p className="text-muted-foreground">{order.users?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
              <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ')}</span>
                </div>
                {order.payment_method === 'half_cod' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advance Paid</span>
                      <span className="font-medium text-green-600">₹{(order.total_amount / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COD Balance Due</span>
                      <span className="font-medium text-orange-600">₹{(order.total_amount / 2).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
        </div>

        <div className="lg:col-span-1">
          <OrderActions order={order} />
        </div>
      </div>
    </div>
  );
}
