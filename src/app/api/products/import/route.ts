import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    const payloadToInsert = products.map((row: any) => ({
      name: row.Name || row.name,
      slug: (row.Name || row.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      price: parseFloat(row.Price || row.price) || 0,
      stock: parseInt(row.Stock || row.stock) || 0,
      brand: row.Brand || row.brand || null,
      description: row.Description || row.description || null,
      compare_at_price: row.CompareAtPrice || row.compare_at_price ? parseFloat(row.CompareAtPrice || row.compare_at_price) : null,
      sku: row.SKU || row.sku || null,
      images: row.Images ? row.Images.split(',').map((u: string) => u.trim()) : [],
      is_active: true,
      is_featured: false,
    }));

    const { data, error } = await supabaseAdmin.from("products").insert(payloadToInsert).select("id");

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
