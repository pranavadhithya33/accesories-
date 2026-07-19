import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    // Basic auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { productIds, action } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    if (action === "hide") {
      await supabaseAdmin.from("products").update({ is_active: false }).in("id", productIds);
    } else if (action === "unhide") {
      await supabaseAdmin.from("products").update({ is_active: true }).in("id", productIds);
    } else if (action === "delete") {
      // Hard delete as requested
      await supabaseAdmin.from("products").delete().in("id", productIds);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
