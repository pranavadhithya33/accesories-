import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/account", "/orders", "/admin"];

// Routes that require admin role
const adminRoutes = ["/admin/dashboard", "/admin/products", "/admin/orders", "/admin/reviews", "/admin/content", "/admin/customers"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route) && !pathname.startsWith("/admin"));
  const isAdmin = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtected || isAdmin) {
    const token = request.cookies.get("session")?.value;
    
    if (!token) {
      const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/login";
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    const payload = await decrypt(token);
    
    if (!payload) {
      const loginUrl = pathname.startsWith("/admin") ? "/admin/login" : "/login";
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    if (isAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
