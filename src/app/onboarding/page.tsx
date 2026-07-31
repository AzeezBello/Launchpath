"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Check,
  GraduationCap,
  HandCoins,
  Rocket,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OnboardingFocus } from "@/lib/server/settings";

const FOCUS_OPTIONS: { value: OnboardingFocus; label: string; icon: LucideIcon }[] = [
  { value: "scholarship", label: "Scholarships", icon: GraduationCap },
  { value: "grant", label: "Grants", icon: HandCoins },
  { value: "job", label: "Jobs", icon: Briefcase },
  { value: "admission", label: "Admissions", icon: Rocket },
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [focus, setFocus] = useState<OnboardingFocus[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleFocus = (value: OnboardingFocus) => {
    setFocus((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));
  };

  const finish = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding: { completed: true, focus } }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_24%)]" />

      <div className="surface-panel relative z-10 w-full max-w-2xl p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i + 1 === step ? "w-8 bg-primary" : i + 1 < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Badge variant="outline" className="mx-auto w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome
              </Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Welcome to LaunchPath
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Track scholarships, grants, jobs, and admissions in one workspace — plus a resume
                builder and AI cover letters to go with them. Two quick questions and you&apos;re set.
              </p>
              <Button onClick={() => setStep(2)} className="mt-6" size="lg">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                What are you focused on?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                Pick as many as apply — we&apos;ll surface these first on your dashboard. You can
                change this anytime in Settings.
              </p>

              <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
                {FOCUS_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = focus.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleFocus(value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/80 bg-background/45 text-muted-foreground hover:border-primary/25 hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-2xl",
                          selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {selected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Check className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                You&apos;re all set
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Here&apos;s what to do first:
              </p>

              <ul className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Build your resume so your score and job matches improve.
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Bookmark opportunities you like and apply straight from the card.
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Take the quick tour from your account menu anytime.
                </li>
              </ul>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={finish} disabled={saving} size="lg">
                  {saving ? "Setting up..." : "Open dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
