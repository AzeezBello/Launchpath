"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handlePlanLimit } from "@/lib/plan-limit";

type TailorResponse = {
  resume: { id: string; title: string };
  source: "openai" | "fallback";
  matched: string[];
  missing: string[];
};

/**
 * Creates a new resume rewritten toward a pasted job description. The
 * original is never modified; the result opens in the editor with a keyword
 * coverage summary so the user knows what still needs adding.
 */
export function TailorResumeDialog({
  resumeId,
  resumeTitle,
  open,
  onOpenChange,
}: {
  resumeId: string | null;
  resumeTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TailorResponse | null>(null);

  const reset = () => {
    setPosition("");
    setCompany("");
    setJobDescription("");
    setResult(null);
  };

  const submit = async () => {
    if (!resumeId) return;
    if (!position.trim() || jobDescription.trim().length < 40) {
      toast.error("Add the role and paste the job description");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          position: position.trim(),
          company: company.trim() || undefined,
          jobDescription: jobDescription.trim(),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        if (!handlePlanLimit(res.status, payload)) toast.error(payload?.error || "Tailoring failed");
        return;
      }
      setResult(payload.data as TailorResponse);
      toast.success(
        payload.data?.source === "openai" ? "Tailored resume created" : "Tailored resume created (offline mode)"
      );
    } catch (err) {
      console.error(err);
      toast.error("Tailoring failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tailor for a job</DialogTitle>
          <DialogDescription>
            Creates a new copy of {resumeTitle ? <strong>{resumeTitle}</strong> : "this resume"} with the summary, skill
            order, and experience wording aimed at the job. Nothing is invented and the original stays as it is.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <p className="text-sm">
              Saved as <strong>{result.resume.title}</strong>.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Keywords covered ({result.matched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.length === 0 && <span className="text-xs text-muted-foreground">None yet</span>}
                {result.matched.map((k) => (
                  <Badge key={k} variant="secondary" className="bg-success/15 normal-case tracking-normal text-success">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Worth adding if true ({result.missing.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.length === 0 && <span className="text-xs text-muted-foreground">Nothing missing</span>}
                {result.missing.slice(0, 15).map((k) => (
                  <Badge key={k} variant="outline" className="normal-case tracking-normal">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tailor-position">Role</Label>
                <Input
                  id="tailor-position"
                  placeholder="Data Analyst"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tailor-company">Company (optional)</Label>
                <Input
                  id="tailor-company"
                  placeholder="Stripe"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tailor-jd">Job description</Label>
              <Textarea
                id="tailor-jd"
                rows={7}
                placeholder="Paste the full posting. The more of it you include, the better the match."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => router.push(`/dashboard/resume/${result.resume.id}`)}>Open tailored resume</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={busy}>
                <Sparkles className="h-4 w-4" />
                {busy ? "Tailoring..." : "Create tailored copy"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
