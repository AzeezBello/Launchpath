"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Copy, PenLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { type EssayStatus, countWords } from "@/lib/server/essays";

type Essay = {
  id: string;
  application_id: string | null;
  title: string;
  prompt: string;
  content: string;
  word_limit: number | null;
  status: EssayStatus;
  updated_at: string;
};

type ApplicationOption = { id: string; program: string };

const NONE = "__none__";
const SELECT_CLASS =
  "h-11 w-full rounded-2xl border border-input bg-background/60 px-4 text-sm text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring";

const STATUS_TONE: Record<EssayStatus, string> = {
  "Not started": "bg-muted text-muted-foreground",
  Drafting: "bg-info/15 text-info",
  Review: "bg-warning/20 text-warning-foreground dark:text-warning",
  Final: "bg-success/15 text-success",
};

function EssaysIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);

  // New-essay form, prefillable from ?new=1&title=&prompt= (opportunity detail page).
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [wordLimit, setWordLimit] = useState("");
  const [applicationId, setApplicationId] = useState(NONE);
  const [saving, setSaving] = useState(false);

  const fetchEssays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/essays", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load essays");
      setEssays(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load essays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEssays();
    fetch("/api/applications?limit=100", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setApplications(rows.map((r: { id: string; program: string }) => ({ id: r.id, program: r.program })));
      })
      .catch(() => {});
  }, [fetchEssays]);

  const applicationTitle = useMemo(() => new Map(applications.map((a) => [a.id, a.program])), [applications]);

  const createEssay = async () => {
    if (!title.trim()) {
      toast.error("Give the essay a title");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          prompt: prompt.trim(),
          wordLimit: wordLimit ? Number(wordLimit) : undefined,
          applicationId: applicationId === NONE ? undefined : applicationId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to create essay");
      toast.success("Essay created");
      router.push(`/dashboard/essays/${payload.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not create essay");
      setSaving(false);
    }
  };

  const duplicateEssay = async (id: string) => {
    try {
      const res = await fetch(`/api/essays/${id}/duplicate`, { method: "POST" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || "Could not duplicate");
      toast.success("Essay duplicated");
      router.push(`/dashboard/essays/${payload.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not duplicate essay");
    }
  };

  const deleteEssay = async (id: string) => {
    const previous = essays;
    setEssays((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/essays/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Essay deleted");
    } catch (err) {
      console.error(err);
      setEssays(previous);
      toast.error("Could not delete essay");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={PenLine}
        title="Essays & Statements"
        description="Keep every scholarship essay and personal statement next to its prompt, word limit, and application."
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            New essay
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New essay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <div className="space-y-1.5">
                <Label htmlFor="essay-title">Title</Label>
                <Input
                  id="essay-title"
                  placeholder="Chevening leadership statement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="essay-limit">Word limit</Label>
                <Input
                  id="essay-limit"
                  type="number"
                  min={1}
                  placeholder="500"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="essay-prompt">Prompt</Label>
              <Textarea
                id="essay-prompt"
                rows={3}
                placeholder="Paste the question exactly as the application words it."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="essay-application">Linked application (optional)</Label>
                <select
                  id="essay-application"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className={SELECT_CLASS}
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={createEssay} disabled={saving}>
                  {saving ? "Creating..." : "Create and open"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={PenLine} title="Couldn't load essays" description={error} />
      ) : essays.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="No essays yet"
          description="Create one for each prompt you need to answer."
          tips={[
            "Paste the prompt exactly so you can check your draft against it.",
            "Set the word limit and the editor will show how much room is left.",
            "Reuse a strong essay by duplicating it for a similar prompt.",
          ]}
          action={
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Start your first essay
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {essays.map((essay, i) => {
            const words = countWords(essay.content);
            const pct = essay.word_limit ? Math.min(100, Math.round((words / essay.word_limit) * 100)) : null;
            const linked = essay.application_id ? applicationTitle.get(essay.application_id) : null;
            return (
              <motion.div
                key={essay.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Card className="flex h-full flex-col">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="text-base leading-snug">
                        <Link href={`/dashboard/essays/${essay.id}`} className="hover:text-primary hover:underline">
                          {essay.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary" className={STATUS_TONE[essay.status]}>
                        {essay.status}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="Duplicate essay"
                        title="Duplicate for a similar prompt"
                        onClick={() => duplicateEssay(essay.id)}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete essay"
                        onClick={() => deleteEssay(essay.id)}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    {essay.prompt && <p className="line-clamp-2 text-sm text-muted-foreground">{essay.prompt}</p>}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{words} words</span>
                        {essay.word_limit && <span>limit {essay.word_limit}</span>}
                      </div>
                      {pct !== null && <Progress value={pct} className="h-1.5" />}
                    </div>
                    {linked && <p className="text-xs text-muted-foreground">For: {linked}</p>}
                    <div className="mt-auto pt-1">
                      <Button asChild size="sm" variant="ghost" className="px-0">
                        <Link href={`/dashboard/essays/${essay.id}`}>
                          Open editor
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
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

export default function EssaysPage() {
  return (
    <Suspense fallback={null}>
      <EssaysIndex />
    </Suspense>
  );
}
