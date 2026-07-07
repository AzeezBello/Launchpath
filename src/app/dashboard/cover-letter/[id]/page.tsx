// src/app/dashboard/cover-letter/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import { Download, Save, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function EditCoverLetterPage() {
  const { supabase, user } = useSupabase();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    position: "",
    tone: "",
    description: "",
    content: "",
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    if (!id) { setLoading(false); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to load letter");
      } else if (data) {
        setForm({
          company_name: data.company_name || "",
          position: data.position || "",
          tone: data.tone || "",
          description: data.description || "",
          content: data.content || "",
        });
      }
      setLoading(false);
    };

    load();
  }, [id, supabase, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !id) {
      toast.error("You are not authorized to update this draft");
      return;
    }
    const { error } = await supabase
      .from("cover_letters")
      .update({
        company_name: form.company_name,
        position: form.position,
        tone: form.tone,
        description: form.description,
        content: form.content,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      toast.error("Save failed");
    } else {
      toast.success("Saved");
    }
  };

  const handleRegenerate = async () => {
    if (!form.position || !form.company_name) { toast.error("Fill job details first"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company_name,
          position: form.position,
          description: form.description || "",
          tone: form.tone || "professional",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      const result = (data?.data || data) as { content?: string; letter?: string };
      setForm((f) => ({ ...f, content: result.content || result.letter || "" }));
      toast.success("Regenerated with AI");
    } catch (err) {
      console.error(err);
      toast.error("AI regeneration failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Cover Letter — ${form.position}`, 10, 15);
    doc.setFontSize(11);
    const split = doc.splitTextToSize(form.content || "No content", 180);
    doc.text(split, 10, 30);
    doc.save(`${form.position || "cover_letter"}.pdf`);
    toast.success("Downloaded PDF");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader icon={Sparkles} title="Edit Cover Letter" description="Fine-tune the details and regenerate as needed." />

      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel space-y-4 p-6 sm:p-8"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company</Label>
            <Input id="company_name" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" name="position" value={form.position} onChange={handleChange} placeholder="Position" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Input id="tone" name="tone" value={form.tone} onChange={handleChange} placeholder="Tone" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job description (optional)</Label>
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Job description (optional)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Letter content</Label>
          <Textarea id="content" name="content" value={form.content} onChange={handleChange} rows={12} placeholder="Generated content" />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleRegenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Regenerating..." : "AI Regenerate"}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
