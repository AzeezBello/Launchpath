"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/providers/SupabaseProvider";

type Factor = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: "verified" | "unverified";
  created_at: string;
};

type Enrollment = {
  factorId: string;
  qrCode: string; // data:image/svg+xml;... from Supabase
  secret: string;
};

/**
 * Real TOTP two-factor auth backed by Supabase MFA: enroll → scan → verify,
 * then list and remove factors. Once a verified factor exists, the middleware
 * requires an aal2 session for every dashboard route.
 */
export function TwoFactorCard() {
  const { supabase } = useSupabase();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadFactors = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error(error);
      toast.error("Could not load two-factor settings");
      setFactors([]);
    } else {
      setFactors((data?.totp || []) as Factor[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const verified = factors.filter((f) => f.status === "verified");
  const enabled = verified.length > 0;

  const startEnrollment = async () => {
    setBusy(true);
    try {
      // Clean up any dangling unverified factor from an abandoned attempt so
      // Supabase does not reject a duplicate friendly name.
      for (const stale of factors.filter((f) => f.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator app",
      });
      if (error || !data) throw error || new Error("Enrollment failed");

      setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      setCode("");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not start enrollment");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnrollment = async () => {
    if (!enrollment) return;
    const trimmed = code.replace(/\s+/g, "");
    if (trimmed.length !== 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollment.factorId,
        code: trimmed,
      });
      if (error) throw error;

      toast.success("Two-factor authentication is on");
      setEnrollment(null);
      setCode("");
      await loadFactors();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "That code didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const cancelEnrollment = async () => {
    if (!enrollment) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId }).catch(() => null);
    setEnrollment(null);
    setCode("");
    setBusy(false);
    await loadFactors();
  };

  const removeFactor = async (factorId: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("Two-factor authentication turned off");
      await loadFactors();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not remove the factor. You may need to sign in again first."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Two-factor authentication
          {!loading && (
            <Badge variant={enabled ? "default" : "outline"} className="normal-case tracking-normal">
              {enabled ? "On" : "Off"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Require a code from an authenticator app (Google Authenticator, 1Password, Authy) every time you sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : enrollment ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enrollment.qrCode}
                alt="Scan this QR code with your authenticator app"
                className="size-40 shrink-0 rounded-2xl border border-border/80 bg-white p-2"
              />
              <div className="space-y-2 text-sm">
                <p className="font-medium">1. Scan the code with your authenticator app.</p>
                <p className="text-muted-foreground">
                  Can&apos;t scan? Enter this key manually:
                </p>
                <code className="block break-all rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-xs">
                  {enrollment.secret}
                </code>
                <p className="font-medium">2. Enter the 6-digit code it shows.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="mfa-code">Verification code</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123 456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmEnrollment()}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelEnrollment} disabled={busy}>
                  Cancel
                </Button>
                <Button onClick={confirmEnrollment} disabled={busy}>
                  <ShieldCheck className="h-4 w-4" />
                  {busy ? "Verifying..." : "Turn on"}
                </Button>
              </div>
            </div>
          </div>
        ) : enabled ? (
          <div className="space-y-3">
            {verified.map((factor) => (
              <div
                key={factor.id}
                className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-success/15 text-success">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{factor.friendly_name || "Authenticator app"}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(factor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeFactor(factor.id)} disabled={busy}>
                  <ShieldOff className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Button onClick={startEnrollment} disabled={busy}>
            <ShieldCheck className="h-4 w-4" />
            {busy ? "Preparing..." : "Set up two-factor auth"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
