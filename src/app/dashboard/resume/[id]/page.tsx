"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import type { ResumeFormData } from "@/types/resume";
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

export default function EditResumePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("You must be logged in");
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) {
        toast.error("Unable to load resume");
      }

      const normalized: ResumeFormData = {
        personalInfo: data?.data?.personalInfo || { name: "", email: "", phone: "" },
        education: data?.data?.education || [],
        skills: data?.data?.skills || [],
        experience: data?.data?.experience || data?.data?.work || [],
        achievements: data?.data?.achievements || [],
        title: data?.data?.title || data?.title || "",
      };

      setResumeData(normalized);
      setLoading(false);
    };
    fetchResume();
  }, [id, supabase]);

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
    if (!resumeData) return;
    if (!userId || !id) {
      toast.error("Unauthorized");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({ data: resumeData })
      .eq("id", id)
      .eq("user_id", userId);
    setSaving(false);

    if (error) {
      toast.error("Failed to update resume");
      return;
    }

    toast.success("Resume updated");
    router.push("/dashboard/resume");
  };

  const totalSteps = 5;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader icon={FileText} title="Edit Resume" description="Update any section and save your changes." />

      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <StepProgress step={step} totalSteps={totalSteps} />

        {step === 1 && (
          <Suspense fallback={<div>Loading...</div>}>
            <PersonalInfoForm
              initialData={resumeData.personalInfo}
              onChange={(data) => updateSection("personalInfo", data)}
            />
          </Suspense>
        )}
        {step === 2 && (
          <Suspense fallback={<div>Loading...</div>}>
            <EducationForm
              initialData={resumeData.education}
              onChange={(data) => updateSection("education", data)}
            />
          </Suspense>
        )}
        {step === 3 && (
          <Suspense fallback={<div>Loading...</div>}>
            <SkillsForm
              initialData={resumeData.skills}
              onChange={(data) => updateSection("skills", data)}
            />
          </Suspense>
        )}
        {step === 4 && (
          <Suspense fallback={<div>Loading...</div>}>
            <WorkExperienceForm
              initialData={resumeData.experience}
              onChange={(data) => updateSection("experience", data)}
            />
          </Suspense>
        )}
        {step === 5 && (
          <Suspense fallback={<div>Loading...</div>}>
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
