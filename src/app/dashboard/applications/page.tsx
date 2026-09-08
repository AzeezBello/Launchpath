"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  ExternalLink,
  FileText,
  KanbanSquare,
  LayoutGrid,
  ListFilter,
  Mail,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { ApplicationsBoard } from "@/components/applications/ApplicationsBoard";
import { useSupabase } from "@/providers/SupabaseProvider";
import { handlePlanLimit } from "@/lib/plan-limit";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/server/applications";

type Application = {
  id: string;
  program: string;
  status: ApplicationStatus;
  date: string;
  deadline: string | null;
  notes: string;
  url: string;
  resume_id: string | null;
  cover_letter_id: string | null;
  opportunity_id: string | null;
  opportunity_type: string | null;
};

type DocOption = { id: string; title: string };

type SortKey = "date" | "deadline";
type ViewMode = "grid" | "board";

const NONE = "__none__";
const VIEW_STORAGE_KEY = "launchpath:applications:view";
const PAGE_SIZE = 12;

const SELECT_CLASS =
  "h-11 rounded-2xl border border-input bg-background/60 px-4 text-sm text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring";
const SELECT_SM_CLASS =
  "h-9 rounded-xl border border-input bg-background/60 px-3 text-xs text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring";

function coverLetterHref(app: Application) {
  if (app.cover_letter_id) return `/dashboard/cover-letter/${app.cover_letter_id}`;
  const params = new URLSearchParams({ applicationId: app.id });
  // "Title @ Company" is how job applications are named by the Apply action.
  const [position, company] = app.program.split(" @ ");
  if (company) {
    params.set("company", company.trim());
    params.set("position", position.trim());
  } else {
    params.set("position", app.program);
  }
  return `/dashboard/cover-letter?${params.toString()}`;
}

export default function ApplicationsPage() {
  const { supabase, user } = useSupabase();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("date");

  // Board view loads the whole pipeline (no pagination / status filter).
  const [view, setView] = useState<ViewMode>("grid");
  const [boardApps, setBoardApps] = useState<Application[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);

  // Add form
  const [program, setProgram] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Pending Review");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Attachable documents (for the detail dialog)
  const [resumes, setResumes] = useState<DocOption[]>([]);
  const [letters, setLetters] = useState<DocOption[]>([]);

  // Detail dialog
  const [editing, setEditing] = useState<Application | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: String(PAGE_SIZE),
          sort,
        });
        if (statusFilter !== "all") params.set("status", statusFilter);

        const res = await fetch(`/api/applications?${params.toString()}`, { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load applications");

        const rows = Array.isArray(payload?.data) ? payload.data : payload?.results;
        setApplications(Array.isArray(rows) ? rows : []);
        setTotalPages(Number(payload?.meta?.totalPages || 1));
        setTotal(Number(payload?.meta?.total || 0));
        setPage(pageNumber);
      } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Unable to load applications";
        setError(message);
        setApplications([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [sort, statusFilter]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "board" || stored === "grid") setView(stored);
    } catch {
      // localStorage unavailable; keep the default view
    }
  }, []);

  const switchView = (next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const fetchBoard = useCallback(async () => {
    setBoardLoading(true);
    try {
      const res = await fetch("/api/applications?limit=100&sort=deadline", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load board");
      setBoardApps(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load the board");
    } finally {
      setBoardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "board") fetchBoard();
  }, [view, fetchBoard]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      supabase.from("resumes").select("id, title").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase
        .from("cover_letters")
        .select("id, company_name, position")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]).then(([resumeRes, letterRes]) => {
      if (cancelled) return;
      setResumes(((resumeRes.data || []) as { id: string; title: string }[]).map((r) => ({ id: r.id, title: r.title })));
      setLetters(
        ((letterRes.data || []) as { id: string; company_name: string; position: string }[]).map((l) => ({
          id: l.id,
          title: [l.position, l.company_name].filter(Boolean).join(" @ ") || "Untitled letter",
        }))
      );
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const resumeTitle = useMemo(() => new Map(resumes.map((r) => [r.id, r.title])), [resumes]);
  const letterTitle = useMemo(() => new Map(letters.map((l) => [l.id, l.title])), [letters]);

  const patchApplication = async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.error || "Failed to update application");
    return payload?.data as Application;
  };

  const updateStatus = async (id: string, nextStatus: ApplicationStatus) => {
    setUpdatingId(id);
    const previous = applications;
    const previousBoard = boardApps;
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
    setBoardApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));

    try {
      await patchApplication(id, { status: nextStatus });
    } catch (err) {
      console.error(err);
      setApplications(previous);
      setBoardApps(previousBoard);
      toast.error("Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async (id: string) => {
    const previous = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");
      toast.success("Application removed");
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      setApplications(previous);
      toast.error("Could not delete application");
    }
  };

  const addApplication = async () => {
    if (!program.trim()) {
      toast.error("Program is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: program.trim(),
          status,
          date,
          deadline: deadline || undefined,
          url: url.trim() || undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        if (handlePlanLimit(res.status, payload)) return;
        throw new Error(payload?.error || "Failed to add application");
      }

      toast.success("Application added");
      setProgram("");
      setStatus("Pending Review");
      setDate(new Date().toISOString().slice(0, 10));
      setDeadline("");
      setUrl("");
      await fetchApplications(1);
      if (view === "board") fetchBoard();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not add application");
    } finally {
      setSaving(false);
    }
  };

  const saveEditing = async () => {
    if (!editing) return;
    if (!editing.program.trim()) {
      toast.error("Program is required");
      return;
    }

    setEditSaving(true);
    try {
      const updated = await patchApplication(editing.id, {
        program: editing.program.trim(),
        date: editing.date,
        deadline: editing.deadline || "",
        url: editing.url,
        notes: editing.notes,
        resumeId: editing.resume_id || "",
        coverLetterId: editing.cover_letter_id || "",
      });
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setBoardApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditing(null);
      toast.success("Application updated");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Briefcase}
        title="My Applications"
        description="Track every submission, its deadline, and the documents you sent with it."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="Program or role name"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className={SELECT_CLASS}
              aria-label="Status"
            >
              {APPLICATION_STATUSES.map((option) => (
                <option key={option} value={option} className="bg-background text-foreground">
                  {option}
                </option>
              ))}
            </select>
            <Button onClick={addApplication} disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="app-date" className="text-xs text-muted-foreground">
                Applied on
              </Label>
              <Input id="app-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-deadline" className="text-xs text-muted-foreground">
                Deadline (optional)
              </Label>
              <Input
                id="app-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-url" className="text-xs text-muted-foreground">
                Link (optional)
              </Label>
              <Input
                id="app-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 inline-flex rounded-xl border border-border/80 bg-background/60 p-0.5">
            <button
              type="button"
              onClick={() => switchView("grid")}
              aria-pressed={view === "grid"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                view === "grid" ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => switchView("board")}
              aria-pressed={view === "board"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                view === "board" ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              Board
            </button>
          </div>
          {view === "grid" && <ListFilter className="h-4 w-4 text-muted-foreground" />}
          {view === "grid" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
            className={SELECT_SM_CLASS}
            aria-label="Filter by status"
          >
            <option value="all" className="bg-background text-foreground">
              All statuses
            </option>
            {APPLICATION_STATUSES.map((option) => (
              <option key={option} value={option} className="bg-background text-foreground">
                {option}
              </option>
            ))}
          </select>
          )}
          {view === "grid" && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={SELECT_SM_CLASS}
            aria-label="Sort"
          >
            <option value="date" className="bg-background text-foreground">
              Newest first
            </option>
            <option value="deadline" className="bg-background text-foreground">
              Deadline soonest
            </option>
          </select>
          )}
        </div>
        {view === "board" ? (
          <p className="text-sm text-muted-foreground">Drag a card to change its status.</p>
        ) : !loading && !error && (
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "application" : "applications"}
          </p>
        )}
      </div>

      {view === "board" ? (
        boardLoading && boardApps.length === 0 ? (
          <Skeleton className="h-72 w-full" />
        ) : boardApps.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Add one above and it will appear on the board."
          />
        ) : (
          <ApplicationsBoard
            applications={boardApps}
            movingId={updatingId}
            onMove={(id, status) => updateStatus(id, status)}
            onEdit={(app) => {
              const full = boardApps.find((a) => a.id === app.id);
              if (full) setEditing(full);
            }}
          />
        )
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Briefcase} title="Couldn't load applications" description={error} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={statusFilter === "all" ? "No applications yet" : `No ${statusFilter.toLowerCase()} applications`}
          description={
            statusFilter === "all"
              ? "Add your first one above to start tracking it."
              : "Try a different status filter."
          }
          tips={
            statusFilter === "all"
              ? [
                  "Applying from a job, scholarship, or grant card adds it here with its deadline.",
                  "Open details to attach the resume and cover letter you submitted.",
                ]
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="flex h-full flex-col">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="text-base leading-snug">{app.program}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={app.status} />
                      <DeadlineBadge value={app.deadline} />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Edit details"
                      onClick={() => setEditing(app)}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete application"
                      onClick={() => deleteApplication(app.id)}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="text-sm text-muted-foreground">Applied {app.date}</p>

                  {app.notes ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{app.notes}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-1.5">
                    {app.resume_id && (
                      <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                        <FileText className="h-3 w-3" />
                        {resumeTitle.get(app.resume_id) || "Resume"}
                      </Badge>
                    )}
                    {app.cover_letter_id && (
                      <Badge variant="outline" className="gap-1 normal-case tracking-normal">
                        <Mail className="h-3 w-3" />
                        Cover letter
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                      className={SELECT_SM_CLASS}
                      aria-label="Change status"
                    >
                      {APPLICATION_STATUSES.map((option) => (
                        <option key={option} value={option} className="bg-background text-foreground">
                          {option}
                        </option>
                      ))}
                    </select>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={coverLetterHref(app)}>
                        <Mail className="h-3.5 w-3.5" />
                        {app.cover_letter_id ? "Open letter" : "Write letter"}
                      </Link>
                    </Button>
                    {app.url && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {view === "grid" && (
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page <= 1 || loading} onClick={() => fetchApplications(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages || loading}
          onClick={() => fetchApplications(page + 1)}
        >
          Next
        </Button>
      </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application details</DialogTitle>
            <DialogDescription>
              Keep the deadline, link, notes, and submitted documents together.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-program">Program or role</Label>
                <Input
                  id="edit-program"
                  value={editing.program}
                  onChange={(e) => setEditing({ ...editing, program: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-date">Applied on</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editing.deadline || ""}
                    onChange={(e) => setEditing({ ...editing, deadline: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-url">Link</Label>
                <Input
                  id="edit-url"
                  type="url"
                  placeholder="https://..."
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-resume">Resume submitted</Label>
                  <select
                    id="edit-resume"
                    value={editing.resume_id || NONE}
                    onChange={(e) =>
                      setEditing({ ...editing, resume_id: e.target.value === NONE ? null : e.target.value })
                    }
                    className={`${SELECT_CLASS} w-full`}
                  >
                    <option value={NONE} className="bg-background text-foreground">
                      None
                    </option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-background text-foreground">
                        {r.title || "Untitled Resume"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-letter">Cover letter</Label>
                  <select
                    id="edit-letter"
                    value={editing.cover_letter_id || NONE}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        cover_letter_id: e.target.value === NONE ? null : e.target.value,
                      })
                    }
                    className={`${SELECT_CLASS} w-full`}
                  >
                    <option value={NONE} className="bg-background text-foreground">
                      None
                    </option>
                    {letters.map((l) => (
                      <option key={l.id} value={l.id} className="bg-background text-foreground">
                        {letterTitle.get(l.id)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  rows={4}
                  placeholder="Requirements, contacts, what you submitted, follow-ups..."
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={saveEditing} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
