"use client";

import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { handlePlanLimit } from "@/lib/plan-limit";
import { useRouter } from "next/navigation";
import { ResumeFormData } from "@/types/resume";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StepProgress } from "@/components/resume/StepProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

// Lazy load form components for better performance
const PersonalInfoForm = lazy(() => import("@/components/resume/forms/PersonalInfoForm"));
const EducationForm = lazy(() => import("@/components/resume/forms/EducationForm"));
const SkillsForm = lazy(() => import("@/components/resume/forms/SkillsForm"));
const WorkExperienceForm = lazy(() => import("@/components/resume/forms/WorkExperienceForm"));
const AchievementsForm = lazy(() => import("@/components/resume/forms/AchievementsForm"));

export default function NewResumePage() {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ResumeFormData>({
    personalInfo: { name: "", email: "", phone: "" },
    education: [],
    skills: [],
    experience: [],
    achievements: [],
    title: "",
  });
  const router = useRouter();

  const updateSection = <K extends keyof ResumeFormData>(
    key: K,
    value: ResumeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      id: 1,
      content: (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <PersonalInfoForm
            initialData={formData.personalInfo}
            onChange={(data) => updateSection("personalInfo", data)}
          />
        </Suspense>
      ),
    },
    {
      id: 2,
      content: (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <EducationForm
            initialData={formData.education}
            onChange={(data) => updateSection("education", data)}
          />
        </Suspense>
      ),
    },
    {
      id: 3,
      content: (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <SkillsForm
            initialData={formData.skills}
            onChange={(data) => updateSection("skills", data)}
          />
        </Suspense>
      ),
    },
    {
      id: 4,
      content: (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <WorkExperienceForm
            initialData={formData.experience}
            onChange={(data) => updateSection("experience", data)}
          />
        </Suspense>
      ),
    },
    {
      id: 5,
      content: (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AchievementsForm
            initialData={formData.achievements}
            onChange={(data) => updateSection("achievements", data)}
          />
        </Suspense>
      ),
    },
  ];

  const saveResume = async () => {
    if (!formData.personalInfo?.name || !formData.personalInfo?.email) {
      toast.error("Please add your name and email before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title || undefined, data: formData }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        if (!handlePlanLimit(res.status, payload)) toast.error(payload?.error || "Failed to save resume");
        return;
      }

      toast.success("Resume saved");
      router.push("/dashboard/resume");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = steps.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        icon={FileText}
        title="Create New Resume"
        description="Fill in each section — you can always come back and edit later."
      />

      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <StepProgress step={step} totalSteps={totalSteps} />

        {steps[step - 1]?.content}

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
              <Button onClick={saveResume} disabled={saving}>
                {saving ? "Saving..." : "Save Resume"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
