"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%)]" />

      <div className="surface-panel relative z-10 max-w-2xl p-8 text-center sm:p-10">
        <Badge variant="outline" className="mx-auto w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome
        </Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to LaunchPath
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We&apos;ll tailor the dashboard to your goals next. For now, you can head
          straight into the workspace and start exploring opportunities.
        </p>

        <Button
          onClick={() => router.push("/dashboard")}
          className="mt-6"
          size="lg"
        >
          Open dashboard
        </Button>
      </div>
    </div>
  );
}
