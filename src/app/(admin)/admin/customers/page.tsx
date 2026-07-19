"use client";

import { useEffect, useState } from "react";
import { Search, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/db/supabase";
import Link from "next/link";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      // Fetch users with their orders
      const { data } = await supabase
        .from("users")
        .select("*, orders(id, total_amount, status)")
        .eq("role", "customer")
        .order("created_at", { ascending: false });
      
      if (data) {
        // Calculate totals
        const processed = data.map(user => {
          const validOrders = (user.orders || []).filter((o: any) => o.status !== 'cancelled');
          const totalSpent = validOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
          return {
            ...user,
            ordersCount: user.orders ? user.orders.length : 0,
            totalSpent
          };
        });
        setCustomers(processed);
      }
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
      </div>

      <div className="bg-[#FFE0EB] rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex bg-card/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 rounded-full bg-background border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/5">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-center">Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/50 hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{customer.name || 'Guest'}</td>
                    <td className="px-6 py-4">
                      {customer.email && <div>{customer.email}</div>}
                      {customer.phone && <div className="text-muted-foreground">{customer.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        <ShoppingCart className="h-3 w-3" /> {customer.ordersCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{customer.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Linking to the orders page pre-filtered for this customer isn't implemented in the standard table, but we can just link to orders for now */}
                      <Link href={`/admin/orders`}>
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
          <span>Showing {filteredCustomers.length} customers</span>
        </div>
      </div>
    </div>
  );
}
