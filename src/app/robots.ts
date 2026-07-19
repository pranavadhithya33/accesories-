import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop"],
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://bubblegum-accessories.vercel.app/sitemap.xml",
  };
}
