// src/app/dashboard/cover-letter/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import CoverLetterForm  from "@/components/cover-letter/CoverLetterForm";
import GeneratedLetterPreview  from "@/components/cover-letter/GeneratedLetterPreview";
import { saveLetter } from "@/utils/coverLetterHelpers";
import { toast } from "sonner";

export default function CoverLetterGeneratePage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [generated, setGenerated] = useState<string>("");
  const [meta, setMeta] = useState<{ company?: string; position?: string; tone?: string; description?: string }>({});
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  const handleGenerate = async (payload: { company: string; position: string; description?: string; tone?: string; }) => {
    setLoading(true);
    setGenerated("");
    setSource(null);
    setMeta({ company: payload.company, position: payload.position, tone: payload.tone, description: payload.description });

    try {
      const res = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: payload.company,
          position: payload.position,
          description: payload.description || "",
          tone: payload.tone || "professional",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "AI generation failed");
        setLoading(false);
        return;
      }

      const content = data.content || data.letter || "";
      setSource(data.source || null);
      setGenerated(content);
      if (data.source && data.source !== "openai") {
        toast.info("Using offline template. Add OPENAI_API_KEY to switch to OpenAI.");
      } else {
        toast.success("Cover letter generated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed (network/server)");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error("You must be logged in to save"); return; }
    if (!generated) { toast.error("Nothing to save"); return; }

    const payload = {
      user_id: user.id,
      company_name: meta.company || "",
      position: meta.position || "",
      tone: meta.tone || "professional",
      description: meta.description || "",
      content: generated,
    };

    const { error } = await saveLetter(supabase, payload);
    if (error) toast.error("Save failed");
    else toast.success("Saved to your dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-2xl">
        <h1 className="text-2xl font-semibold mb-3">AI Cover Letter Generator</h1>
        <p className="text-sm text-gray-300 mb-6">Enter the job details below and get a tailored cover letter.</p>

        <CoverLetterForm onGenerate={handleGenerate} loading={loading} />

        {generated && (
          <div className="mt-6">
            <GeneratedLetterPreview
              content={generated}
              meta={{ company: meta.company || "", position: meta.position || "", tone: meta.tone || "" }}
              source={source || undefined}
              onSave={handleSave}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
