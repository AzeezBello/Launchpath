// src/app/dashboard/cover-letter/components/CoverLetterForm.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Props = {
  onGenerate: (payload: { company: string; position: string; description?: string; tone?: string }) => void;
  loading?: boolean;
};

const TONES = ["Professional", "Friendly", "Confident", "Persuasive"];

export default function CoverLetterForm({ onGenerate, loading }: Props) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Professional");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) {
      toast.error("Company and position are required");
      return;
    }
    onGenerate({ company, position, description, tone: tone.toLowerCase() });
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
