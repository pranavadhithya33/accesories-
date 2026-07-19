"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { Button } from "@/components/ui/button";
import { Download, MessageCircle, Save } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function OrderActions({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    setLoading(false);
    if (!error) {
      alert("Status updated successfully");
      router.refresh();
    } else {
      alert("Failed to update status");
    }
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    const customer = order.users || { name: 'Guest', phone: '', email: '' };
    
    // Header
    doc.setFontSize(20);
    doc.text("BubbleGum Accessories", 14, 22);
    
    doc.setFontSize(10);
    doc.text("INVOICE", 170, 22, { align: 'right' });
    doc.text(`Order #: ${order.order_number}`, 170, 28, { align: 'right' });
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 170, 34, { align: 'right' });

    // Customer details
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 45);
    doc.setFontSize(10);
    doc.text(customer.name, 14, 52);
    if (customer.phone) doc.text(customer.phone, 14, 58);
    if (customer.email) doc.text(customer.email, 14, 64);
    
    // Address if available
    let startY = 75;
    
    // Items Table
    const tableBody = [
      ["Item", "Quantity", "Price", "Total"],
      // Add a dummy row since order items table wasn't fully populated in this demo
      ["Product (Placeholder)", "1", `Rs. ${order.total_amount}`, `Rs. ${order.total_amount}`]
    ];

    autoTable(doc, {
      startY: startY,
      head: [tableBody[0]],
      body: tableBody.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [255, 111, 174] }, // Bubble Gum pink
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text(`Subtotal: Rs. ${order.total_amount}`, 170, finalY, { align: 'right' });
    
    if (order.payment_method === 'half_cod') {
      const advance = order.total_amount / 2;
      doc.text(`Advance Paid: Rs. ${advance.toFixed(2)}`, 170, finalY + 6, { align: 'right' });
      doc.text(`Balance Due (COD): Rs. ${advance.toFixed(2)}`, 170, finalY + 12, { align: 'right' });
    }
    
    doc.setFontSize(12);
    doc.text(`Total: Rs. ${order.total_amount}`, 170, finalY + 22, { align: 'right' });

    doc.setFontSize(10);
    doc.text("Thank you for shopping with BubbleGum Accessories!", 105, 280, { align: 'center' });

    doc.save(`Invoice_${order.order_number}.pdf`);
  };

  const notifyCustomer = () => {
    const phone = order.users?.phone || "917397189222"; // fallback
    const message = encodeURIComponent(`Hi ${order.users?.name || 'Customer'},\n\nYour order ${order.order_number} from BubbleGum Accessories is now ${status}. \n\nThank you for shopping with us!`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-6 sticky top-6">
      <h3 className="font-heading font-bold text-xl mb-4">Actions</h3>
      
      <div className="space-y-4 pb-6 border-b border-border">
        <div>
          <label className="text-sm font-medium mb-2 block">Update Status</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2.5 text-sm mb-2"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={loading || status === order.status}
            className="w-full"
          >
            {loading ? "Updating..." : "Save Status"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={generateInvoice} variant="outline" className="w-full justify-start">
          <Download className="mr-2 h-4 w-4" /> Generate PDF Invoice
        </Button>
        
        <Button onClick={notifyCustomer} className="w-full justify-start bg-[#25D366] hover:bg-[#20b958] text-white">
          <MessageCircle className="mr-2 h-4 w-4" /> Notify via WhatsApp
        </Button>
      </div>
    </div>
  );
}
