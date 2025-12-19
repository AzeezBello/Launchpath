// src/app/dashboard/cover-letter/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

export default function EditCoverLetterPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { id } = useParams();

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
    const { error } = await supabase
      .from("cover_letters")
      .update({
        company_name: form.company_name,
        position: form.position,
        tone: form.tone,
        description: form.description,
        content: form.content,
      })
      .eq("id", id);

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
      setForm((f) => ({ ...f, content: data.content || data.letter || "" }));
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

  if (loading) return <div className="p-8 text-gray-300">Loading...</div>;

  return (
    <motion.form onSubmit={handleSave} className="max-w-3xl mx-auto p-6 glass rounded-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Edit Cover Letter</h1>

      <div className="grid md:grid-cols-2 gap-3">
        <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company" className="input" />
        <input name="position" value={form.position} onChange={handleChange} placeholder="Position" className="input" />
      </div>

      <input name="tone" value={form.tone} onChange={handleChange} placeholder="Tone" className="input" />
      <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="textarea" placeholder="Job description (optional)"></textarea>
      <textarea name="content" value={form.content} onChange={handleChange} rows={12} className="textarea" placeholder="Generated content"></textarea>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={handleRegenerate} className="btn" disabled={generating}>
          {generating ? "Regenerating..." : "✨ AI Regenerate"}
        </button>
        <button type="button" onClick={handleDownloadPdf} className="btn outline">📄 Download PDF</button>
        <button type="submit" className="btn primary">💾 Save</button>
      </div>
    </motion.form>
  );
}
