// src/app/dashboard/cover-letter/page.tsx
"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSupabase } from "@/providers/SupabaseProvider";
import CoverLetterForm, { type CoverLetterFormPayload, type ResumeOption } from "@/components/cover-letter/CoverLetterForm";
import GeneratedLetterPreview from "@/components/cover-letter/GeneratedLetterPreview";
import { saveLetter } from "@/utils/coverLetterHelpers";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { handlePlanLimit } from "@/lib/plan-limit";

type Meta = { company?: string; position?: string; tone?: string; description?: string; resumeId?: string | null };

function CoverLetterGenerate() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deep-link support: /dashboard/cover-letter?company=Acme&position=Engineer&applicationId=<uuid>
  const applicationId = searchParams.get("applicationId") || "";
  const initialValues = useMemo(
    () => ({
      company: searchParams.get("company") || "",
      position: searchParams.get("position") || "",
      description: searchParams.get("description") || "",
    }),
    [searchParams]
  );

  const [generated, setGenerated] = useState<string>("");
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setResumesLoading(false);
      return;
    }
    let cancelled = false;

    supabase
      .from("resumes")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setResumes((data || []) as ResumeOption[]);
        setResumesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const handleGenerate = async (payload: CoverLetterFormPayload) => {
    if (!user) {
      toast.error("Please sign in to generate cover letters.");
      return;
    }

    setLoading(true);
    setGenerated("");
    setSource(null);
    setMeta({
      company: payload.company,
      position: payload.position,
      tone: payload.tone,
      description: payload.description,
      resumeId: payload.resumeId,
    });

    try {
      const res = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: payload.company,
          position: payload.position,
          description: payload.description || "",
          tone: payload.tone || "professional",
          resumeId: payload.resumeId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (!handlePlanLimit(res.status, data)) toast.error(data.error || "AI generation failed");
        setLoading(false);
        return;
      }

      const result = (data?.data || data) as { content?: string; letter?: string; source?: string };
      const content = result.content || result.letter || "";
      setSource(result.source || null);
      setGenerated(content);
      if (result.source && result.source !== "openai") {
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

    const { error, data, planLimited } = await saveLetter({
      company_name: meta.company || "",
      position: meta.position || "",
      tone: meta.tone || "professional",
      description: meta.description || "",
      content: generated,
      source: source && source !== "openai" ? source : source || "manual",
    });
    if (error) {
      if (!planLimited) toast.error(error);
      return;
    }

    // When launched from an application, attach the saved letter (and the
    // resume it was based on) to that application and return to the pipeline.
    if (applicationId && data?.id) {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetterId: data.id,
          ...(meta.resumeId ? { resumeId: meta.resumeId } : {}),
        }),
      }).catch(() => null);

      if (res?.ok) {
        toast.success("Saved and attached to your application");
        router.push("/dashboard/applications");
        return;
      }
    }

    toast.success("Saved to your dashboard");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        icon={Sparkles}
        title="AI Cover Letter Generator"
        description="Pick a resume, add the job details, and get a letter that cites your real experience."
        action={
          applicationId ? (
            <Button variant="outline" asChild>
              <Link href="/dashboard/applications">
                <ArrowLeft className="h-4 w-4" />
                Back to applications
              </Link>
            </Button>
          ) : undefined
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel p-6 sm:p-8"
      >
        <CoverLetterForm
          onGenerate={handleGenerate}
          loading={loading}
          resumes={resumes}
          resumesLoading={resumesLoading}
          initialValues={initialValues}
        />
      </motion.div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GeneratedLetterPreview
            content={generated}
            meta={{ company: meta.company || "", position: meta.position || "", tone: meta.tone || "" }}
            source={source || undefined}
            onSave={handleSave}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function CoverLetterGeneratePage() {
  // useSearchParams() needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={null}>
      <CoverLetterGenerate />
    </Suspense>
  );
}
