"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Download, FileText, Plus, Sparkles } from "lucide-react";
import { TailorResumeDialog } from "@/components/resume/TailorResumeDialog";
import { handlePlanLimit } from "@/lib/plan-limit";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { downloadResumeAsPdf } from "@/components/resume/downloadResumePdf";
import type { ResumeFormData } from "@/types/resume";

interface Resume {
  id: string;
  title: string;
  created_at: string;
  data: ResumeFormData;
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || "Failed to load resumes");
      setResumes(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      console.error(err);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const [tailoring, setTailoring] = useState<Resume | null>(null);

  const duplicateResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        if (!handlePlanLimit(res.status, payload)) toast.error(payload?.error || "Could not duplicate");
        return;
      }
      toast.success("Resume duplicated");
      await fetchResumes();
    } catch (err) {
      console.error(err);
      toast.error("Could not duplicate resume");
    }
  };

  const deleteResume = async (id: string) => {
    const previous = resumes;
    setResumes((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resume");
      toast.success("Resume deleted");
    } catch (err) {
      console.error(err);
      setResumes(previous);
      toast.error("Could not delete resume");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={FileText}
        title="My Resumes"
        description="Create, edit, and manage every version of your resume."
        action={
          <Button asChild>
            <Link href="/dashboard/resume/new">
              <Plus className="h-4 w-4" />
              Create new resume
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Create one to get started."
          tips={[
            "Add your work experience and skills for a stronger resume score.",
            "You can create multiple versions tailored to different roles.",
          ]}
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/resume/new">Create your first resume</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="hover-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> {resume.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/resume/${resume.id}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Download PDF"
                      title="Download PDF"
                      onClick={() => downloadResumeAsPdf(resume.title || "resume", resume.data)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Duplicate"
                      title="Duplicate"
                      onClick={() => duplicateResume(resume.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Create a copy tailored to a job description"
                      onClick={() => setTailoring(resume)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Tailor
                    </Button>
                  </div>
                  <Button variant="destructive" onClick={() => deleteResume(resume.id)}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <TailorResumeDialog
        resumeId={tailoring?.id ?? null}
        resumeTitle={tailoring?.title}
        open={Boolean(tailoring)}
        onOpenChange={(open) => {
          if (!open) {
            setTailoring(null);
            fetchResumes();
          }
        }}
      />
    </div>
  );
}
