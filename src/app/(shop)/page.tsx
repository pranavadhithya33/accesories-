import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* USP Strip */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
        🚀 Free Shipping on Orders Over ₹499 | Premium Accessories, Direct Prices
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="bg-card rounded-[2rem] overflow-hidden shadow-gum relative min-h-[500px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent z-10 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-foreground leading-tight mb-6">
              Style Your Tech <br />
              <span className="text-primary">Without Limits</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover the finest collection of cases, chargers, and audio gear that perfectly complement your devices and lifestyle.
            </p>
            <div>
              <Link href="/shop" passHref>
                <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-white font-bold px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative shapes/images would go here in a real implementation */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-primary/10 rounded-l-[4rem] hidden md:block"></div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground">Explore Categories</h2>
            <p className="text-muted-foreground mt-2">Find exactly what you're looking for</p>
          </div>
          <Link href="/shop" className="text-primary font-medium hover:underline hidden sm:block">View All</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: "Cases & Covers", slug: "cases", bg: "bg-orange-100 dark:bg-orange-950" },
            { name: "Fast Chargers", slug: "chargers", bg: "bg-blue-100 dark:bg-blue-950" },
            { name: "True Wireless", slug: "audio", bg: "bg-purple-100 dark:bg-purple-950" },
            { name: "Screen Guards", slug: "protection", bg: "bg-green-100 dark:bg-green-950" }
          ].map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}>
              <div className={`aspect-square rounded-2xl ${cat.bg} p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer shadow-sm border border-border/50`}>
                <h3 className="font-heading font-semibold text-lg text-foreground">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
