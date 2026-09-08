"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ResumeFormData } from "@/types/resume";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StepProgress } from "@/components/resume/StepProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText } from "lucide-react";
import { downloadResumeAsPdf } from "@/components/resume/downloadResumePdf";

// Lazy load form components for better performance
const PersonalInfoForm = lazy(() => import("@/components/resume/forms/PersonalInfoForm"));
const EducationForm = lazy(() => import("@/components/resume/forms/EducationForm"));
const SkillsForm = lazy(() => import("@/components/resume/forms/SkillsForm"));
const WorkExperienceForm = lazy(() => import("@/components/resume/forms/WorkExperienceForm"));
const AchievementsForm = lazy(() => import("@/components/resume/forms/AchievementsForm"));

export default function EditResumePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) {
        setLoading(false);
        toast.error("Invalid resume ID");
        return;
      }

      try {
        const res = await fetch(`/api/resumes/${id}`, { cache: "no-store" });
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.error || "Unable to load resume");

        const row = payload?.data as { title?: string; data?: ResumeFormData & { work?: ResumeFormData["experience"] } };
        const normalized: ResumeFormData = {
          personalInfo: row?.data?.personalInfo || { name: "", email: "", phone: "" },
          education: row?.data?.education || [],
          skills: row?.data?.skills || [],
          experience: row?.data?.experience || row?.data?.work || [],
          achievements: row?.data?.achievements || [],
          title: row?.data?.title || row?.title || "",
        };
        setResumeData(normalized);
        setLoaded(true);
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Unable to load resume");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  const updateSection = <K extends keyof ResumeFormData>(
    key: K,
    value: ResumeFormData[K]
  ) => {
    setResumeData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading || !resumeData)
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  const updateResume = async () => {
    if (!resumeData || !id || !loaded) {
      toast.error("Nothing to save yet");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: resumeData, ...(resumeData.title ? { title: resumeData.title } : {}) }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || "Failed to update resume");

      toast.success("Resume updated");
      router.push("/dashboard/resume");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update resume");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        icon={FileText}
        title="Edit Resume"
        description="Update any section and save your changes."
        action={
          <Button
            variant="outline"
            onClick={() =>
              downloadResumeAsPdf(resumeData.title || "resume", resumeData)
            }
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        }
      />

      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <StepProgress step={step} totalSteps={totalSteps} />

        {step === 1 && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <PersonalInfoForm
              initialData={resumeData.personalInfo}
              onChange={(data) => updateSection("personalInfo", data)}
            />
          </Suspense>
        )}
        {step === 2 && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <EducationForm
              initialData={resumeData.education}
              onChange={(data) => updateSection("education", data)}
            />
          </Suspense>
        )}
        {step === 3 && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <SkillsForm
              initialData={resumeData.skills}
              onChange={(data) => updateSection("skills", data)}
            />
          </Suspense>
        )}
        {step === 4 && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <WorkExperienceForm
              initialData={resumeData.experience}
              onChange={(data) => updateSection("experience", data)}
            />
          </Suspense>
        )}
        {step === 5 && (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <AchievementsForm
              initialData={resumeData.achievements}
              onChange={(data) => updateSection("achievements", data)}
            />
          </Suspense>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          <div className="ml-auto">
            {step < totalSteps ? (
              <Button onClick={() => setStep((prev) => Math.min(prev + 1, totalSteps))}>
                Next
              </Button>
            ) : (
              <Button onClick={updateResume} disabled={saving}>
                {saving ? "Saving..." : "Update Resume"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
