"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/providers/SupabaseProvider";

function safeRedirect(value: string | null) {
  // Only allow same-origin paths so the redirect can't be pointed elsewhere.
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function MfaChallengeForm() {
  const { supabase, refreshSession } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirectedFrom"));

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [{ data: aal }, { data: factors }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
      if (cancelled) return;

      // Nothing to do: either no session, or already at the required level.
      if (!aal || aal.nextLevel !== "aal2" || aal.currentLevel === "aal2") {
        router.replace(aal ? redirectTo : "/login");
        return;
      }

      const verified = (factors?.totp || []).find((f) => f.status === "verified");
      setFactorId(verified?.id || null);
      setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [supabase, router, redirectTo]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    const trimmed = code.replace(/\s+/g, "");
    if (trimmed.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: trimmed });
      if (error) throw error;
      await refreshSession();
      toast.success("Verified");
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "That code didn't work");
    } finally {
      setVerifying(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Checking your session...</div>;
  }

  if (!factorId) {
    return (
      <div className="space-y-4 text-center text-sm text-muted-foreground">
        <p>We couldn&apos;t find a verified authenticator on this account.</p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="mfa-challenge-code">Verification code</Label>
        <Input
          id="mfa-challenge-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123 456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={verifying}>
          {verifying ? "Verifying..." : "Continue"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={signOut}>
          Use a different account
        </Button>
      </div>
    </form>
  );
}
