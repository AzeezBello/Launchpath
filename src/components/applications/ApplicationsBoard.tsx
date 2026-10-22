"use client";

import { useState } from "react";
import { ExternalLink, FileText, GripVertical, Mail, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/server/applications";

export type BoardApplication = {
  id: string;
  program: string;
  status: ApplicationStatus;
  date: string;
  deadline: string | null;
  url: string;
  resume_id: string | null;
  cover_letter_id: string | null;
};

const COLUMN_TONE: Record<ApplicationStatus, string> = {
  Draft: "border-t-border/90",
  "Pending Review": "border-t-info/55",
  "In Review": "border-t-info/55",
  Interviewing: "border-t-warning/65",
  Offer: "border-t-success/65",
  Accepted: "border-t-success/75",
  Rejected: "border-t-destructive/50",
  Withdrawn: "border-t-border/90",
};

/**
 * Kanban view of the pipeline. Uses native HTML5 drag and drop (no library)
 * so it works on desktop; on touch devices the status select on each card in
 * the grid view remains the way to move applications.
 */
export function ApplicationsBoard({
  applications,
  onMove,
  onEdit,
  movingId,
}: {
  applications: BoardApplication[];
  onMove: (id: string, status: ApplicationStatus) => void;
  onEdit: (app: BoardApplication) => void;
  movingId: string | null;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ApplicationStatus | null>(null);

  const byStatus = new Map<ApplicationStatus, BoardApplication[]>(
    APPLICATION_STATUSES.map((status) => [status, []])
  );
  for (const app of applications) {
    byStatus.get(app.status)?.push(app);
  }

  const handleDrop = (status: ApplicationStatus) => {
    if (!dragId) return;
    const app = applications.find((a) => a.id === dragId);
    if (app && app.status !== status) onMove(dragId, status);
    setDragId(null);
    setOverColumn(null);
  };

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-3.5">
        {APPLICATION_STATUSES.map((status) => {
          const items = byStatus.get(status) || [];
          const isOver = overColumn === status;

          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== status) setOverColumn(status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(status);
              }}
              className={cn(
                "flex w-[264px] shrink-0 flex-col rounded-2xl border border-border/80 border-t-[3px] bg-card/65 p-3 transition-[background-color,box-shadow,border-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
                COLUMN_TONE[status],
                isOver && "bg-primary/6 ring-2 ring-primary/35"
              )}
            >
              <header className="flex items-center justify-between px-1.5 pb-3">
                <h3 className="text-xs font-semibold tracking-tight">{status}</h3>
                <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
                  {items.length}
                </Badge>
              </header>

              <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                {items.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    Drop application here
                  </p>
                )}
                {items.map((app) => (
                  <article
                    key={app.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(app.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", app.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverColumn(null);
                    }}
                    className={cn(
                      "group cursor-grab rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs scale-100 transition-[opacity,scale,border-color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-border active:cursor-grabbing active:scale-[0.98]",
                      (dragId === app.id || movingId === app.id) && "opacity-50 scale-[0.97]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug">{app.program}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <DeadlineBadge value={app.deadline} />
                          {app.resume_id && (
                            <span title="Resume attached" className="text-muted-foreground">
                              <FileText className="size-3.5" />
                            </span>
                          )}
                          {app.cover_letter_id && (
                            <span title="Cover letter attached" className="text-muted-foreground">
                              <Mail className="size-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit"
                          onClick={() => onEdit(app)}
                          className="size-7"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        {app.url && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="size-7"
                          >
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Open link"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
