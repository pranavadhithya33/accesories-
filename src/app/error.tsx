"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md bg-[#FFE0EB] p-10 rounded-3xl border border-border shadow-gum">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          We encountered an unexpected error. Please try again.
        </p>
        <Button
          onClick={() => reset()}
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    </div>
  );
}
