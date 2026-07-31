"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, string> = {
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  danger: "bg-destructive/15 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

function toneForStatus(status: string): keyof typeof TONE_STYLES {
  const normalized = status.toLowerCase();
  if (normalized.includes("accept") || normalized.includes("complete")) return "success";
  if (normalized.includes("reject")) return "danger";
  if (normalized.includes("review") || normalized.includes("schedule")) return "info";
  return "neutral";
}

function IconForStatus({ status }: { status: string }) {
  const tone = toneForStatus(status);
  if (tone === "success") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (tone === "danger") return <XCircle className="h-4 w-4 text-destructive" />;
  if (tone === "info") return <Clock className="h-4 w-4 text-info" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
}

export function StatusBadge({ status, showIcon = false }: { status: string; showIcon?: boolean }) {
  const tone = toneForStatus(status);

  return (
    <span className="inline-flex items-center gap-2">
      {showIcon && <IconForStatus status={status} />}
      <Badge variant="secondary" className={cn(TONE_STYLES[tone])}>
        {status}
      </Badge>
    </span>
  );
}
