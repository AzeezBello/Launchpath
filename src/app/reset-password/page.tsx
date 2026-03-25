"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSupabase } from "@/providers/SupabaseProvider";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabase();

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to reset password.");
    } else {
      toast.success("Password updated successfully. Please log in.");
      router.push("/login");
    }
  }

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Choose a new password"
      description="Set a strong new password for your LaunchPath account and then sign back in."
      footer={
        <>
          Need a fresh reset email?{" "}
          <Link href="/forgot-password" className="font-medium text-foreground hover:text-primary">
            Send another link
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleResetPassword}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
