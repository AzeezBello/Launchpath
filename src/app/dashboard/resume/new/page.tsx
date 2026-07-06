"use client";

import { useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ResumeFormData } from "@/types/resume";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StepProgress } from "@/components/resume/StepProgress";
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
        <Suspense fallback={<div>Loading...</div>}>
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
        <Suspense fallback={<div>Loading...</div>}>
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
        <Suspense fallback={<div>Loading...</div>}>
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
        <Suspense fallback={<div>Loading...</div>}>
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
        <Suspense fallback={<div>Loading...</div>}>
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setSaving(false);
      toast.error("You must be logged in to save your resume.");
      return;
    }

    const title =
      formData.title ||
      (formData.personalInfo?.name
        ? `${formData.personalInfo.name}'s Resume`
        : "Untitled Resume");

    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      title,
      data: formData,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to save resume");
      return;
    }

    toast.success("Resume saved");
    router.push("/dashboard/resume");
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
