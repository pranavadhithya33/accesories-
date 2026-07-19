import { use } from "react";
import { supabaseAdmin } from "@/lib/db/supabase";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
