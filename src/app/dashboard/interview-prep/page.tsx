"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, CalendarClock, MapPin, Plus, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { handlePlanLimit } from "@/lib/plan-limit";

interface Interview {
  id: string;
  candidate: string; // the company / organisation (column name is historical)
  position: string;
  date: string;
  status: string;
  application_id: string | null;
  notes: string;
  location: string;
}

type ApplicationOption = { id: string; program: string };

const STATUS_OPTIONS = ["Scheduled", "Completed", "Pending"] as const;
const NONE = "__none__";

const SELECT_CLASS =
  "h-11 rounded-2xl border border-input bg-background/60 px-4 text-sm text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring";
const SELECT_SM_CLASS =
  "h-9 rounded-xl border border-input bg-background/60 px-2.5 text-xs text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring";

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  const [applications, setApplications] = useState<ApplicationOption[]>([]);

  // Add form
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("Scheduled");
  const [location, setLocation] = useState("");
  const [applicationId, setApplicationId] = useState<string>(NONE);

  // Per-card notes editing
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/interview?page=${page}&limit=10`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load interviews");

        const rows = Array.isArray(data?.data) ? data.data : [];
        setInterviews(rows);
        setTotalPages(Number(data?.meta?.totalPages || 1));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load interviews");
        setInterviews([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [page, refreshToken]);

  // Open applications the interview can be linked to.
  useEffect(() => {
    fetch("/api/applications?limit=100", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setApplications(rows.map((r: { id: string; program: string }) => ({ id: r.id, program: r.program })));
      })
      .catch(() => {});
  }, []);

  const applicationTitle = useMemo(
    () => new Map(applications.map((a) => [a.id, a.program])),
    [applications]
  );

  // When an application is picked, prefill company/position from its name.
  const handlePickApplication = (value: string) => {
    setApplicationId(value);
    if (value === NONE) return;
    const title = applicationTitle.get(value) || "";
    const [pos, comp] = title.split(" @ ");
    if (comp) {
      if (!company) setCompany(comp.trim());
      if (!position) setPosition(pos.trim());
    } else if (!position) {
      setPosition(title);
    }
  };

  const patchInterview = useCallback(async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/interview/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.error || "Failed to update interview");
    }
    const payload = await res.json();
    return payload?.data as Interview;
  }, []);

  const updateInterviewStatus = async (id: string, nextStatus: string) => {
    setUpdatingId(id);
    const previous = interviews;
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status: nextStatus } : i)));

    try {
      await patchInterview(id, { status: nextStatus });
    } catch (err) {
      console.error(err);
      setInterviews(previous);
      toast.error("Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNotes = async (id: string) => {
    const draft = notesDraft[id];
    const current = interviews.find((i) => i.id === id);
    if (draft === undefined || !current || draft === current.notes) return;

    try {
      const updated = await patchInterview(id, { notes: draft });
      setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, notes: updated.notes } : i)));
      toast.success("Notes saved");
    } catch (err) {
      console.error(err);
      toast.error("Could not save notes");
    }
  };

  const deleteInterview = async (id: string) => {
    const previous = interviews;
    setInterviews((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch(`/api/interview/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete interview");
      toast.success("Interview removed");
    } catch (err) {
      console.error(err);
      setInterviews(previous);
      toast.error("Could not delete interview");
    }
  };

  const addInterview = async () => {
    if (!company.trim() || !position.trim()) {
      toast.error("Company and role are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: company.trim(),
          position: position.trim(),
          date,
          status,
          location: location.trim(),
          applicationId: applicationId === NONE ? undefined : applicationId,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        if (handlePlanLimit(res.status, payload)) return;
        throw new Error(payload?.error || "Failed to create interview");
      }

      // Move the linked application into "Interviewing" if it is still earlier in the pipeline.
      if (applicationId !== NONE) {
        fetch(`/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Interviewing" }),
        }).catch(() => {});
      }

      toast.success("Interview added");
      setCompany("");
      setPosition("");
      setLocation("");
      setApplicationId(NONE);
      setStatus("Scheduled");
      setDate(new Date().toISOString().slice(0, 10));
      setPage(1);
      setRefreshToken((v) => v + 1);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not create interview");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotes = (interview: Interview) => {
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(interview.id)) {
        next.delete(interview.id);
      } else {
        next.add(interview.id);
        setNotesDraft((d) => (interview.id in d ? d : { ...d, [interview.id]: interview.notes || "" }));
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={CalendarClock}
        title="Interview Prep"
        description="Log every interview, tie it to the application, and keep your prep notes in one place."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px_150px_auto]">
            <Input
              placeholder="Company or organisation"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              placeholder="Role / position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
              className={SELECT_CLASS}
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-background text-foreground">
                  {option}
                </option>
              ))}
            </select>
            <Button onClick={addInterview} disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="int-application" className="text-xs text-muted-foreground">
                Linked application (optional)
              </Label>
              <select
                id="int-application"
                value={applicationId}
                onChange={(e) => handlePickApplication(e.target.value)}
                className={`${SELECT_CLASS} w-full`}
              >
                <option value={NONE} className="bg-background text-foreground">
                  Not linked
                </option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id} className="bg-background text-foreground">
                    {app.program}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="int-location" className="text-xs text-muted-foreground">
                Location or link (optional)
              </Label>
              <Input
                id="int-location"
                placeholder="Zoom, Google Meet, office address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={CalendarClock} title="Couldn't load interviews" description={error} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No interviews yet"
          description="Add one above to start prepping."
          tips={[
            "Link an interview to its application and the application moves to Interviewing automatically.",
            "Use notes for the questions you expect, your stories, and what to ask them.",
          ]}
        />
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview, i) => {
            const notesOpen = openNotes.has(interview.id);
            const linkedTitle = interview.application_id
              ? applicationTitle.get(interview.application_id)
              : null;

            return (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Card className="hover-card">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{interview.candidate}</h3>
                          <StatusBadge status={interview.status} />
                          {interview.status !== "Completed" && <DeadlineBadge value={interview.date} />}
                        </div>
                        <p className="text-sm text-muted-foreground">Role: {interview.position}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Date: {interview.date}</span>
                          {interview.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interview.location}
                            </span>
                          )}
                          {linkedTitle && (
                            <Link
                              href="/dashboard/applications"
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              <Briefcase className="h-3 w-3" />
                              {linkedTitle}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <select
                          value={interview.status}
                          disabled={updatingId === interview.id}
                          onChange={(e) => updateInterviewStatus(interview.id, e.target.value)}
                          className={SELECT_SM_CLASS}
                          aria-label="Change status"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option} className="bg-background text-foreground">
                              {option}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant={notesOpen ? "secondary" : "ghost"}
                          onClick={() => toggleNotes(interview)}
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                          {interview.notes ? "Notes" : "Add notes"}
                        </Button>
                        <button
                          type="button"
                          aria-label="Delete interview"
                          onClick={() => deleteInterview(interview.id)}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {!notesOpen && interview.notes ? (
                      <p className="line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">
                        {interview.notes}
                      </p>
                    ) : null}

                    {notesOpen && (
                      <div className="space-y-2">
                        <Textarea
                          rows={5}
                          placeholder="Likely questions, your STAR stories, questions to ask them, logistics..."
                          value={notesDraft[interview.id] ?? interview.notes ?? ""}
                          onChange={(e) =>
                            setNotesDraft((d) => ({ ...d, [interview.id]: e.target.value }))
                          }
                          onBlur={() => saveNotes(interview.id)}
                        />
                        <p className="text-xs text-muted-foreground">Notes save automatically when you click away.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
