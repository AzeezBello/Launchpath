"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type Usage = {
  plan: "starter" | "pro" | "team";
  limits: { coverLettersPerMonth: number; resumes: number; applications: number; interviews: number };
  usage: { coverLetters: number; resumes: number; applications: number; interviews: number };
  usagePct: { coverLetters: number; resumes: number; applications: number; interviews: number };
  billing?: { configured: boolean; hasCustomer: boolean };
};

const PLAN_LABEL = { starter: "Starter", pro: "Pro", team: "Team" } as const;

export function BillingCard() {
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/billing/usage", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setUsage(payload?.data || null))
      .catch(() => setUsage(null));
  }, []);

  // Post-checkout landing: Stripe redirects back here with ?billing=success|cancelled.
  useEffect(() => {
    const state = searchParams.get("billing");
    if (state === "success") {
      toast.success("Welcome to Pro. Your new limits apply on your next sign-in if they don't show yet.");
    } else if (state === "cancelled") {
      toast.info("Checkout cancelled. You're still on Starter.");
    }
  }, [searchParams]);

  const redirectTo = async (endpoint: "checkout" | "portal") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/billing/${endpoint}`, { method: "POST" });
      const payload = await res.json();
      if (!res.ok || !payload?.data?.url) throw new Error(payload?.error || "Something went wrong");
      window.location.assign(payload.data.url);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not open billing");
      setBusy(false);
    }
  };

  const rows = usage
    ? [
        { label: "Resumes", used: usage.usage.resumes, limit: usage.limits.resumes, pct: usage.usagePct.resumes },
        {
          label: "Applications",
          used: usage.usage.applications,
          limit: usage.limits.applications,
          pct: usage.usagePct.applications,
        },
        { label: "Interviews", used: usage.usage.interviews, limit: usage.limits.interviews, pct: usage.usagePct.interviews },
        {
          label: "AI cover letters this month",
          used: usage.usage.coverLetters,
          limit: usage.limits.coverLettersPerMonth,
          pct: usage.usagePct.coverLetters,
        },
      ]
    : [];

  const configured = usage?.billing?.configured ?? false;
  const isPaid = usage ? usage.plan !== "starter" : false;

  return (
    <Card id="billing" className="scroll-mt-24 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Plan &amp; billing
          {usage && (
            <Badge variant={isPaid ? "default" : "outline"} className="normal-case tracking-normal">
              {PLAN_LABEL[usage.plan]}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isPaid
            ? "Thanks for supporting LaunchPath. Manage your card, invoices, or cancellation below."
            : "Starter is free. Pro raises every limit and unlocks deadline reminders and priority support."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {!usage ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">
                    {row.used} / {row.limit}
                  </span>
                </div>
                <Progress value={row.pct} />
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-background/45 p-4">
          {isPaid ? (
            <>
              <div>
                <p className="text-sm font-semibold">You&apos;re on {usage ? PLAN_LABEL[usage.plan] : "Pro"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Update payment details, download invoices, or cancel from the Stripe portal.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => redirectTo("portal")}
                disabled={busy || !configured || !usage?.billing?.hasCustomer}
              >
                <CreditCard className="h-4 w-4" />
                {busy ? "Opening..." : "Manage billing"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold">Pro · $18 / month</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>100 resumes, 1,000 applications, 400 interviews</li>
                  <li>250 AI cover letters a month</li>
                  <li>Deadline reminders and priority support</li>
                </ul>
              </div>
              <Button onClick={() => redirectTo("checkout")} disabled={busy || !configured}>
                <Sparkles className="h-4 w-4" />
                {busy ? "Redirecting..." : configured ? "Upgrade to Pro" : "Billing not configured"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
