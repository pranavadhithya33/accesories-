"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    adminSecret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/account");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-gum border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join BubbleGum to start shopping</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              required 
              value={formData.name}
              onChange={handleChange}
              className="rounded-full bg-background/50 border-border"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={formData.email}
              onChange={handleChange}
              className="rounded-full bg-background/50 border-border"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              className="rounded-full bg-background/50 border-border"
              placeholder="+91 98765 43210"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={formData.password}
              onChange={handleChange}
              className="rounded-full bg-background/50 border-border"
            />
          </div>

          {showAdminSecret && (
            <div className="space-y-2 pt-2 border-t border-border mt-4">
              <Label htmlFor="adminSecret" className="text-primary">Admin Secret Key (Optional)</Label>
              <Input 
                id="adminSecret" 
                type="password" 
                value={formData.adminSecret}
                onChange={handleChange}
                className="rounded-full bg-background/50 border-primary/50 focus-visible:ring-primary"
                placeholder="Enter key for admin privileges"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg transition-transform hover:scale-105 active:scale-95 mt-6">
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>

        {/* Hidden trigger for admin secret input */}
        <div 
          className="h-2 w-2 absolute bottom-2 right-2 cursor-default" 
          onDoubleClick={() => setShowAdminSecret(!showAdminSecret)} 
        />
      </div>
    </div>
  );
}
