"use client";

import { cn } from "@/lib/utils";

const STEP_LABELS = ["Personal", "Education", "Skills", "Experience", "Achievements"];

export function StepProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const index = i + 1;
        const active = index === step;
        const done = index < step;

        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                done || active ? "bg-primary" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "hidden text-[11px] sm:block",
                active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
