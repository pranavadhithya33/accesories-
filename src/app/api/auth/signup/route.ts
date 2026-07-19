import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword } from "@/lib/auth/password";
import { encrypt } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, adminSecret } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    // Determine role based on admin secret
    let role = "customer";
    if (adminSecret && process.env.ADMIN_SECRET_KEY && adminSecret === process.env.ADMIN_SECRET_KEY) {
      role = "admin";
    }

    const password_hash = await hashPassword(password);

    // Insert user
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email,
          password_hash,
          name: name || null,
          phone: phone || null,
          role,
        },
      ])
      .select("id, email, role")
      .single();

    if (error || !newUser) {
      console.error("Signup DB Error:", error);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }

    // Generate JWT
    const token = await encrypt({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      { success: true, user: { id: newUser.id, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
