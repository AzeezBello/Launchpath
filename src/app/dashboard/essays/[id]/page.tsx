"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Download, PenLine, Save } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";
import { ESSAY_STATUSES, type EssayStatus, countWords } from "@/lib/server/essays";

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
const AUTOSAVE_MS = 1500;

export default function EssayEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [essay, setEssay] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([
      fetch(`/api/essays/${id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/applications?limit=100", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ])
      .then(([essayPayload, appsPayload]) => {
        if (cancelled) return;
        if (!essayPayload?.success) throw new Error(essayPayload?.error || "Essay not found");
        setEssay(essayPayload.data as Essay);
        const rows = Array.isArray(appsPayload?.data) ? appsPayload.data : [];
        setApplications(rows.map((r: { id: string; program: string }) => ({ id: r.id, program: r.program })));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load essay"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const persist = useCallback(
    async (next: Essay) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/essays/${next.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: next.title,
            prompt: next.prompt,
            content: next.content,
            wordLimit: next.word_limit ?? "",
            status: next.status,
            applicationId: next.application_id ?? "",
          }),
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.error || "Save failed");
        setDirty(false);
        setLastSaved(new Date());
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Could not save");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // Debounced autosave on any edit; explicit Save flushes immediately.
  const update = (patch: Partial<Essay>) => {
    setEssay((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      setDirty(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => persist(next), AUTOSAVE_MS);
      return next;
    });
  };

  const saveNow = () => {
    if (!essay) return;
    if (timer.current) clearTimeout(timer.current);
    persist(essay);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const words = useMemo(() => countWords(essay?.content || ""), [essay?.content]);
  const limit = essay?.word_limit ?? null;
  const pct = limit ? Math.min(100, Math.round((words / limit) * 100)) : null;
  const over = limit ? words > limit : false;

  const copyText = async () => {
    if (!essay) return;
    try {
      await navigator.clipboard.writeText(essay.content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadPdf = () => {
    if (!essay) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(essay.title, 10, 15);
    doc.setFontSize(11);
    const split = doc.splitTextToSize(essay.content || "", 180);
    doc.text(split, 10, 28);
    doc.save(`${essay.title.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[480px] w-full" />
      </div>
    );
  }

  if (error || !essay) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" asChild className="px-0">
          <Link href="/dashboard/essays">
            <ArrowLeft className="h-4 w-4" />
            Back to essays
          </Link>
        </Button>
        <EmptyState icon={PenLine} title="Essay not found" description={error || "It may have been deleted."} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" asChild className="px-0">
        <Link href="/dashboard/essays">
          <ArrowLeft className="h-4 w-4" />
          Back to essays
        </Link>
      </Button>

      <PageHeader
        icon={PenLine}
        title={essay.title || "Untitled essay"}
        description={
          saving ? "Saving..." : dirty ? "Unsaved changes" : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "All changes saved"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyText}>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPdf}>
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button size="sm" onClick={saveNow} disabled={saving || !dirty}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="surface-panel space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="essay-title">Title</Label>
            <Input id="essay-title" value={essay.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="essay-prompt">Prompt</Label>
            <Textarea
              id="essay-prompt"
              rows={3}
              placeholder="The question you're answering"
              value={essay.prompt}
              onChange={(e) => update({ prompt: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="essay-content">Your essay</Label>
              <span className={cn("text-xs", over ? "font-semibold text-destructive" : "text-muted-foreground")}>
                {words} {limit ? `/ ${limit}` : ""} words{over ? " (over limit)" : ""}
              </span>
            </div>
            <Textarea
              id="essay-content"
              rows={22}
              placeholder="Start with the moment that made this matter to you..."
              value={essay.content}
              onChange={(e) => update({ content: e.target.value })}
              className="font-[inherit] leading-relaxed"
            />
            {pct !== null && <Progress value={pct} className={cn("h-1.5", over && "[&>div]:bg-destructive")} />}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-panel space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="essay-status">Status</Label>
              <select
                id="essay-status"
                value={essay.status}
                onChange={(e) => update({ status: e.target.value as EssayStatus })}
                className={SELECT_CLASS}
              >
                {ESSAY_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-background text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="essay-limit">Word limit</Label>
              <Input
                id="essay-limit"
                type="number"
                min={1}
                placeholder="No limit"
                value={essay.word_limit ?? ""}
                onChange={(e) => update({ word_limit: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="essay-application">Linked application</Label>
              <select
                id="essay-application"
                value={essay.application_id ?? NONE}
                onChange={(e) => update({ application_id: e.target.value === NONE ? null : e.target.value })}
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
          </div>

          <div className="surface-panel space-y-2 p-5 text-sm">
            <p className="font-semibold">Structure that works</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>Open with a specific moment, not a definition.</li>
              <li>Answer the prompt directly by the second paragraph.</li>
              <li>One concrete example per claim, with the outcome.</li>
              <li>Close on what you will do with the opportunity.</li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/essays")}
          >
            Done
          </Button>
        </aside>
      </div>
    </div>
  );
}
