"use client";

import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEADLINE_TONE_CLASS, describeDeadline } from "@/lib/deadlines";

/**
 * Renders a small chip describing when something is due.
 * Accepts either an ISO date (applications) or free text (opportunity feeds).
 * Renders nothing when there is no deadline at all and `showEmpty` is false.
 */
export function DeadlineBadge({
  value,
  showEmpty = false,
  className,
}: {
  value: string | null | undefined;
  showEmpty?: boolean;
  className?: string;
}) {
  const info = describeDeadline(value);
  if (!value && !showEmpty) return null;

  return (
    <Badge
      variant="secondary"
      title={info.date ? info.date.toDateString() : undefined}
      className={cn(DEADLINE_TONE_CLASS[info.tone], "gap-1.5", className)}
    >
      <CalendarClock className="h-3 w-3" />
      {info.label}
    </Badge>
  );
}
