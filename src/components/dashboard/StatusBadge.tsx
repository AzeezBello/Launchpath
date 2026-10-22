"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatusTone = "success" | "info" | "destructive" | "warning" | "secondary";

function toneForStatus(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (normalized.includes("accept") || normalized.includes("complete") || normalized.includes("offer"))
    return "success";
  if (normalized.includes("reject")) return "destructive";
  if (normalized.includes("interview")) return "warning";
  if (normalized.includes("review") || normalized.includes("schedule")) return "info";
  return "secondary";
}

function IconForStatus({ status }: { status: string }) {
  const tone = toneForStatus(status);
  if (tone === "success") return <CheckCircle2 className="size-3.5 text-success" />;
  if (tone === "destructive") return <XCircle className="size-3.5 text-destructive" />;
  if (tone === "warning") return <Clock className="size-3.5 text-warning" />;
  if (tone === "info") return <Clock className="size-3.5 text-info" />;
  return <Clock className="size-3.5 text-muted-foreground" />;
}

export function StatusBadge({ status, showIcon = false }: { status: string; showIcon?: boolean }) {
  const tone = toneForStatus(status);

  return (
    <span className="inline-flex items-center gap-1.5">
      {showIcon && <IconForStatus status={status} />}
      <Badge variant={tone}>{status}</Badge>
    </span>
  );
}
