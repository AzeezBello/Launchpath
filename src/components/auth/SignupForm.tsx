"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ArrowRight } from "lucide-react";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshSession } = useSupabase();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let payload: { success: boolean; error?: string; data?: { session: unknown } } | null = null;
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      payload = await res.json();
    } catch {
      payload = { success: false, error: "Network error. Please try again." };
    }
    setLoading(false);

    if (!payload?.success) {
      toast.error(payload?.error || "Sign up failed");
      return;
    }

    if (payload.data?.session) {
      await refreshSession();
      toast.success("Account created successfully");
      router.push("/onboarding");
      router.refresh();
    } else {
      toast.success("Account created! Please sign in.");
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Ada Lovelace"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a strong password (8+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <div className="pt-1">
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account..." : "Create free account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
