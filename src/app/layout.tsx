import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["600", "700", "800"],
});

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | Only Gadjets",
    default: "Only Gadjets Accessories | Premium Phone Cases, Chargers & More",
  },
  description: "Shop premium mobile accessories, cases, chargers, and screen guards at the best prices.",
  openGraph: {
    title: "Only Gadjets Accessories",
    description: "Premium mobile accessories and gadgets.",
    type: "website",
    url: "https://bubblegum-accessories.vercel.app",
    siteName: "Only Gadjets",
  },
  twitter: {
    card: "summary_large_image",
    title: "Only Gadjets Accessories",
    description: "Premium mobile accessories and gadgets.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
