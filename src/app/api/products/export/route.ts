import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { data: products, error } = await supabaseAdmin.from("products").select("*, categories(name)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const exportData = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      Slug: p.slug,
      Category: p.categories?.name || "",
      Brand: p.brand || "",
      Price: p.price,
      CompareAtPrice: p.compare_at_price || "",
      Stock: p.stock,
      SKU: p.sku || "",
      IsActive: p.is_active,
      IsFeatured: p.is_featured,
      Images: p.images ? p.images.join(",") : "",
      Description: p.description || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="products_export.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
