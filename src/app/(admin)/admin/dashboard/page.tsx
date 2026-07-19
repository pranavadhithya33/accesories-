import Link from "next/link";
import { Package, ShoppingCart, Clock, Users, ArrowUpRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/db/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Dynamic route

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [
    { count: productsCount },
    { count: ordersCount },
    { count: pendingOrdersCount },
    { count: customersCount },
    { data: recentOrders }
  ] = await Promise.all([
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabaseAdmin.from("orders").select("id, order_number, total_amount, status, created_at, users(name)").order("created_at", { ascending: false }).limit(10)
  ]);

  const stats = [
    { title: "Total Products", value: productsCount || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
    { title: "Total Orders", value: ordersCount || 0, icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
    { title: "Pending Orders", value: pendingOrdersCount || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
    { title: "Total Customers", value: customersCount || 0, icon: Users, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome to your store's command center.</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/products/new">
            <Button className="rounded-full bg-primary hover:bg-primary/90">Add Product</Button>
          </Link>
          <Link href="/admin/products/import">
            <Button variant="outline" className="rounded-full">Import Products</Button>
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-[#FFE0EB] p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#FFE0EB] rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline flex items-center">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/5">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-black/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{order.order_number}</td>
                  <td className="px-6 py-4">{(order.users as any)?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">₹{order.total_amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                      ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                      ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    `}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="rounded-full">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
