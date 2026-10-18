"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type CoverLetterFormPayload = {
  company: string;
  position: string;
  description?: string;
  tone?: string;
  resumeId?: string | null;
};

export type ResumeOption = { id: string; title: string };

type Props = {
  onGenerate: (payload: CoverLetterFormPayload) => void;
  loading?: boolean;
  resumes?: ResumeOption[];
  resumesLoading?: boolean;
  initialValues?: Partial<Pick<CoverLetterFormPayload, "company" | "position" | "description">>;
};

const TONES = ["Professional", "Friendly", "Confident", "Persuasive"];
const NO_RESUME = "__none__";

export default function CoverLetterForm({
  onGenerate,
  loading,
  resumes = [],
  resumesLoading = false,
  initialValues,
}: Props) {
  const [company, setCompany] = useState(initialValues?.company || "");
  const [position, setPosition] = useState(initialValues?.position || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [tone, setTone] = useState("Professional");
  const [resumeId, setResumeId] = useState<string>(NO_RESUME);

  // Prefill from the parent (e.g. "Write cover letter" on an application card).
  useEffect(() => {
    if (initialValues?.company) setCompany(initialValues.company);
    if (initialValues?.position) setPosition(initialValues.position);
    if (initialValues?.description) setDescription(initialValues.description);
  }, [initialValues?.company, initialValues?.position, initialValues?.description]);

  // Default to the most recent resume once the list arrives so the first
  // generation is personalised without an extra click.
  useEffect(() => {
    if (resumeId === NO_RESUME && resumes.length > 0) {
      setResumeId(resumes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) {
      toast.error("Company and position are required");
      return;
    }
    onGenerate({
      company,
      position,
      description,
      tone: tone.toLowerCase(),
      resumeId: resumeId === NO_RESUME ? null : resumeId,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cl-company">Company</Label>
          <Input
            id="cl-company"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cl-position">Position</Label>
          <Input
            id="cl-position"
            placeholder="Position title"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          Base it on a resume
          <InfoTooltip text="Your name, summary, skills, and experience from the selected resume are passed to the generator so the letter cites real accomplishments." />
        </Label>
        <Select value={resumeId} onValueChange={setResumeId} disabled={resumesLoading}>
          <SelectTrigger>
            <SelectValue placeholder={resumesLoading ? "Loading resumes..." : "Choose a resume"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_RESUME}>No resume (generic letter)</SelectItem>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.title || "Untitled Resume"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!resumesLoading && resumes.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No resumes yet. Build one first and the letter will reference your real experience.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cl-description">Job description (optional)</Label>
        <Textarea
          id="cl-description"
          placeholder="Paste the job description or add notes to tailor the letter..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                tone === t
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/80 bg-background/55 text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Button type="submit" disabled={loading}>
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
    </form>
  );
}
