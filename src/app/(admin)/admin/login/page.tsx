"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to login");
      }

      if (data.user.role !== "admin") {
        // Technically they logged in, but not as admin. 
        // We could log them out or just redirect them.
        router.push("/");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#FFE0EB] w-full max-w-md p-8 rounded-3xl shadow-gum border border-border">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-primary/20 p-4 rounded-full mb-4 text-primary">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-2">Restricted access area</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full bg-background border-border"
              placeholder="admin@bubblegum.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full bg-background border-border"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg transition-transform hover:scale-105 active:scale-95">
            {loading ? "Authenticating..." : "Access Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
