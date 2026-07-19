import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyPassword } from "@/lib/auth/password";
import { encrypt } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/auth/ratelimit";

export async function POST(request: Request) {
  try {
    // Basic IP extraction (works for Vercel/proxies, fallback to standard)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Check rate limit
    const { success, remaining, reset } = await checkRateLimit(ip, "login");
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Fetch user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, password_hash, role")
      .eq("email", email)
      .single();

    if (error || !user) {
      // Return a generic error to prevent email enumeration
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT
    const token = await encrypt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, role: user.role } },
      { status: 200 }
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
