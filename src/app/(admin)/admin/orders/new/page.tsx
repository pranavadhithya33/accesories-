"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertTriangle, Search } from "lucide-react";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: ""
  });

  const [total, setTotal] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  
  // Note: For a fully functional manual order creation, we'd need a product search and selection UI.
  // To keep it simple for this implementation, we will just allow entering a manual total.
  // In a real scenario, this would have a typeahead for `products` and map to `order_items`.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0) {
      setError("Total amount must be greater than 0");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // 1. Create or find user (basic implementation: we just create a dummy user entry or use guest)
      // Usually, you'd search for existing users. Here we'll just insert a dummy user record.
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          name: customer.name,
          email: customer.email || `${customer.phone}@guest.com`,
          phone: customer.phone,
          password_hash: "manual_order",
          role: "customer"
        })
        .select("id")
        .single();
        
      if (userError) throw userError;

      // 2. Create order
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: newUser.id,
          order_number: orderNumber,
          total_amount: total,
          status: "confirmed", // manual orders are usually confirmed
          payment_method: paymentMode
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      router.push(`/admin/orders/${order.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create order");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-foreground">Create Manual Order</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-heading font-bold mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="9876543210" />
            </div>
            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>PIN Code *</Label>
              <Input required value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})} placeholder="600001" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Full Address *</Label>
              <textarea 
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={customer.address}
                onChange={e => setCustomer({...customer, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-heading font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 max-w-sm">
            <Label>Total Amount (₹) *</Label>
            <Input 
              type="number" 
              required 
              min="1"
              value={total || ''} 
              onChange={e => setTotal(parseFloat(e.target.value))} 
              placeholder="e.g. 1499" 
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Payment Mode</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="prepaid" 
                  checked={paymentMode === "prepaid"}
                  onChange={() => setPaymentMode("prepaid")}
                  className="text-primary focus:ring-primary"
                />
                Full Prepaid
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="half_cod" 
                  checked={paymentMode === "half_cod"}
                  onChange={() => setPaymentMode("half_cod")}
                  className="text-primary focus:ring-primary"
                />
                Half COD (50% Advance)
              </label>
            </div>
          </div>

          {paymentMode === "half_cod" && total > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 p-4 rounded-xl mt-4 border border-orange-200 dark:border-orange-800 flex justify-between items-center">
              <div>
                <p className="font-bold">Required Advance: ₹{(total / 2).toFixed(2)}</p>
                <p className="text-sm">Balance on delivery: ₹{(total / 2).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full rounded-full font-bold bg-primary hover:bg-primary/90 py-6 text-lg">
          <Save className="mr-2 h-5 w-5" /> {loading ? "Creating Order..." : "Create Order"}
        </Button>
      </form>
    </div>
  );
}
