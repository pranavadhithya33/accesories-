import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md bg-card p-12 rounded-[3rem] border border-border shadow-gum">
        <div className="text-7xl mb-6">🍬</div>
        <h1 className="text-4xl font-heading font-extrabold text-foreground mb-4">
          Oops!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          This page popped like bubble gum. We can't find what you're looking for!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full bg-[#FF1493] hover:bg-[#FF1493]/90 text-white font-bold py-6 px-8 text-lg w-full">
            <ArrowLeft className="mr-2 h-5 w-5" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
