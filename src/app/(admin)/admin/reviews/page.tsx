"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/db/supabase";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*, products(name), users(name)")
      .order("created_at", { ascending: false });
    
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, is_approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
    if (!error) {
      fetchReviews();
    } else {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      fetchReviews();
    } else {
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (statusFilter === "approved") return r.is_approved === true;
    if (statusFilter === "pending") return r.is_approved === false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">Review Moderation</h1>
      </div>

      <div className="bg-[#FFE0EB] rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-end bg-card/50">
          <select 
            className="bg-background border border-border text-foreground text-sm rounded-full focus:ring-primary focus:border-primary block p-2.5 px-4"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/5">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Review</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center">Loading reviews...</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No reviews found.</td></tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b border-border/50 hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4 font-medium line-clamp-2 max-w-[200px]">{(review.products as any)?.name}</td>
                    <td className="px-6 py-4">{(review.users as any)?.name || 'Guest'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-yellow-500">
                        {review.rating} <Star className="ml-1 h-3 w-3 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.title && <p className="font-bold">{review.title}</p>}
                      <p className="text-muted-foreground line-clamp-2 max-w-xs">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(review.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {review.is_approved ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {!review.is_approved ? (
                          <Button onClick={() => handleUpdateStatus(review.id, true)} variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button onClick={() => handleUpdateStatus(review.id, false)} variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(review.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
