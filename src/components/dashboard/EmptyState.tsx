"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  tips,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  tips?: string[];
  action?: ReactNode;
}) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {tips && tips.length > 0 && (
        <ul className="mt-1 space-y-2 text-left text-sm">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      )}

      {action}
    </div>
  );
}
