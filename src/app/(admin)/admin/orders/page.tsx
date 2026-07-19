"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/db/supabase";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const { data } = await supabase
        .from("orders")
        .select("*, users(name)")
        .order("created_at", { ascending: false });
      
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ((o.users as any)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">Orders</h1>
        <div className="flex gap-2">
          <Link href="/admin/orders/new">
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-gum">
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-[#FFE0EB] rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4 bg-card/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order # or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-background border-border"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="bg-background border border-border text-foreground text-sm rounded-full focus:ring-primary focus:border-primary block p-2.5 px-4"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/5">
              <tr>
                <th className="px-6 py-4 font-medium">Order #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.order_number}</td>
                    <td className="px-6 py-4">{(order.users as any)?.name || 'Guest'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">₹{order.total_amount}</td>
                    <td className="px-6 py-4">
                      {order.payment_method === 'half_cod' ? (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Half COD</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">Prepaid</span>
                      )}
                    </td>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-card/50">
          <span>Showing {filteredOrders.length} orders</span>
        </div>
      </div>
    </div>
  );
}
