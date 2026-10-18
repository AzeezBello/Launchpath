"use client";

import { useState } from "react";
import { ExternalLink, FileText, GripVertical, Mail, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
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
  Draft: "border-border/80",
  "Pending Review": "border-info/40",
  "In Review": "border-info/40",
  Interviewing: "border-warning/50",
  Offer: "border-success/50",
  Accepted: "border-success/60",
  Rejected: "border-destructive/40",
  Withdrawn: "border-border/80",
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
      <div className="flex min-w-max gap-4">
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
                "flex w-[260px] shrink-0 flex-col rounded-[1.5rem] border-t-4 bg-card/60 p-3 transition-colors",
                COLUMN_TONE[status],
                isOver && "bg-primary/5 ring-2 ring-primary/30"
              )}
            >
              <header className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold">{status}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
              </header>

              <div className="flex min-h-[120px] flex-1 flex-col gap-2">
                {items.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    Drop here
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
                      "group cursor-grab rounded-2xl border border-border/80 bg-background/70 p-3 shadow-sm transition-opacity active:cursor-grabbing",
                      (dragId === app.id || movingId === app.id) && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug">{app.program}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <DeadlineBadge value={app.deadline} />
                          {app.resume_id && (
                            <span title="Resume attached" className="text-muted-foreground">
                              <FileText className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {app.cover_letter_id && (
                            <span title="Cover letter attached" className="text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => onEdit(app)}
                          className="rounded-full p-1 text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {app.url && (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Open link"
                            className="rounded-full p-1 text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
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
