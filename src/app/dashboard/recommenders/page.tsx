"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Mail, Plus, StickyNote, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DeadlineBadge } from "@/components/dashboard/DeadlineBadge";
import { RECOMMENDER_STATUSES, type RecommenderStatus } from "@/lib/server/recommenders";

type Recommender = {
  id: string;
  application_id: string | null;
  name: string;
  email: string;
  relationship: string;
  status: RecommenderStatus;
  due_date: string | null;
  notes: string;
};

type ApplicationOption = { id: string; program: string };

const NONE = "__none__";

const STATUS_TONE: Record<RecommenderStatus, string> = {
  "To ask": "bg-muted text-muted-foreground",
  Requested: "bg-info/15 text-info",
  Submitted: "bg-success/15 text-success",
  Declined: "bg-destructive/15 text-destructive",
};

function requestEmailHref(rec: Recommender, program?: string) {
  const subject = `Recommendation letter request${program ? `: ${program}` : ""}`;
  const body = [
    `Dear ${rec.name},`,
    "",
    `I hope you're well. I'm applying ${program ? `to ${program}` : "for an opportunity"} and would be honoured if you could write a letter of recommendation for me${rec.due_date ? `. The deadline is ${rec.due_date}` : ""}.`,
    "",
    "I'm happy to share my resume, the programme details, and a short summary of what I'd love the letter to highlight.",
    "",
    "Thank you so much for considering it.",
    "",
    "Best regards,",
  ].join("\n");
  return `mailto:${rec.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function RecommendersPage() {
  const [rows, setRows] = useState<Recommender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [applicationId, setApplicationId] = useState(NONE);
  const [saving, setSaving] = useState(false);

  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommenders", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load recommenders");
      setRows(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load recommenders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
    fetch("/api/applications?limit=100", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setApplications(list.map((r: { id: string; program: string }) => ({ id: r.id, program: r.program })));
      })
      .catch(() => {});
  }, [fetchRows]);

  const applicationTitle = useMemo(() => new Map(applications.map((a) => [a.id, a.program])), [applications]);

  const patchRow = async (id: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/recommenders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.error || "Failed to update");
    return payload?.data as Recommender;
  };

  const addRecommender = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/recommenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          relationship: relationship.trim(),
          dueDate: dueDate || undefined,
          applicationId: applicationId === NONE ? undefined : applicationId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to add recommender");
      toast.success("Recommender added");
      setName("");
      setEmail("");
      setRelationship("");
      setDueDate("");
      setApplicationId(NONE);
      await fetchRows();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not add recommender");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: RecommenderStatus) => {
    setUpdatingId(id);
    const previous = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await patchRow(id, { status });
    } catch (err) {
      console.error(err);
      setRows(previous);
      toast.error("Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNotes = async (id: string) => {
    const draft = notesDraft[id];
    const current = rows.find((r) => r.id === id);
    if (draft === undefined || !current || draft === current.notes) return;
    try {
      const updated = await patchRow(id, { notes: draft });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes: updated.notes } : r)));
      toast.success("Notes saved");
    } catch (err) {
      console.error(err);
      toast.error("Could not save notes");
    }
  };

  const remove = async (id: string) => {
    const previous = rows;
    setRows((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/recommenders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Recommender removed");
    } catch (err) {
      console.error(err);
      setRows(previous);
      toast.error("Could not remove recommender");
    }
  };

  const toggleNotes = (rec: Recommender) => {
    setOpenNotes((prev) => {
      const next = new Set(prev);
      if (next.has(rec.id)) next.delete(rec.id);
      else {
        next.add(rec.id);
        setNotesDraft((d) => (rec.id in d ? d : { ...d, [rec.id]: rec.notes || "" }));
      }
      return next;
    });
  };

  const pending = rows.filter((r) => r.status === "To ask" || r.status === "Requested").length;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={UserCheck}
        title="Recommenders"
        description="Track who is writing your reference letters, when they are due, and whether they have been submitted."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add recommender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              placeholder="Relationship, e.g. Thesis supervisor"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
            <Button onClick={addRecommender} disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Add"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rec-application" className="text-xs text-muted-foreground">
                For application (optional)
              </Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger id="rec-application">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not linked</SelectItem>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rec-due" className="text-xs text-muted-foreground">
                Letter due (optional)
              </Label>
              <Input id="rec-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!loading && !error && rows.length > 0 && (
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {pending} of {rows.length} still outstanding.
        </p>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={UserCheck} title="Couldn't load recommenders" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No recommenders yet"
          description="Add the people you plan to ask so nothing slips."
          tips={[
            "Ask at least three weeks before the deadline; most people need a nudge.",
            "Link each recommender to the application so the due date shows on your overview.",
            "Use the request email template to ask in one click once an email is set.",
          ]}
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((rec, i) => {
            const linked = rec.application_id ? applicationTitle.get(rec.application_id) : undefined;
            const notesOpen = openNotes.has(rec.id);
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 6, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.24, delay: Math.min(i * 0.035, 0.24), ease: [0.23, 1, 0.32, 1] }}
              >
                <Card className="hover-card">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{rec.name}</h3>
                          <Badge variant="secondary" className={STATUS_TONE[rec.status]}>
                            {rec.status}
                          </Badge>
                          {rec.status !== "Submitted" && rec.status !== "Declined" && (
                            <DeadlineBadge value={rec.due_date} />
                          )}
                        </div>
                        {rec.relationship && <p className="text-sm text-muted-foreground">{rec.relationship}</p>}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {rec.email && <span>{rec.email}</span>}
                          {rec.due_date && <span className="font-mono tabular-nums">Due {rec.due_date}</span>}
                          {linked && (
                            <Link
                              href="/dashboard/applications"
                              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                            >
                              <Briefcase className="h-3 w-3" />
                              {linked}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Select
                          value={rec.status}
                          disabled={updatingId === rec.id}
                          onValueChange={(v) => updateStatus(rec.id, v as RecommenderStatus)}
                        >
                          <SelectTrigger size="sm" aria-label="Change status" className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RECOMMENDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {rec.email && rec.status === "To ask" && (
                          <Button asChild size="sm" variant="outline">
                            <a href={requestEmailHref(rec, linked)}>
                              <Mail className="h-3.5 w-3.5" />
                              Draft request
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant={notesOpen ? "secondary" : "ghost"} onClick={() => toggleNotes(rec)}>
                          <StickyNote className="h-3.5 w-3.5" />
                          {rec.notes ? "Notes" : "Add notes"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove recommender"
                          onClick={() => remove(rec.id)}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {!notesOpen && rec.notes ? (
                      <p className="line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{rec.notes}</p>
                    ) : null}

                    {notesOpen && (
                      <div className="space-y-2">
                        <Textarea
                          rows={4}
                          placeholder="What you sent them, what they need from you, follow-up dates..."
                          value={notesDraft[rec.id] ?? rec.notes ?? ""}
                          onChange={(e) => setNotesDraft((d) => ({ ...d, [rec.id]: e.target.value }))}
                          onBlur={() => saveNotes(rec.id)}
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
    </div>
  );
}
