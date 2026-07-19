import { NextResponse } from "next/server";
import { scrapeAmazon } from "@/lib/scrapers/amazonScraper";
import { scrapeFlipkart } from "@/lib/scrapers/flipkartScraper";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    let data;
    if (url.includes("amazon.in") || url.includes("amazon.com")) {
      data = await scrapeAmazon(url);
    } else if (url.includes("flipkart.com")) {
      data = await scrapeFlipkart(url);
    } else {
      return NextResponse.json({ error: "Unsupported URL. Please provide an Amazon or Flipkart link." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API Scrape Error:", error);
    return NextResponse.json({ error: error.message || "Failed to scrape product" }, { status: 500 });
  }
}
