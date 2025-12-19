"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "@/components/resume/forms/PersonalInfoForm";
import EducationForm from "@/components/resume/forms/EducationForm";
import SkillsForm from "@/components/resume/forms/SkillsForm";
import WorkExperienceForm from "@/components/resume/forms/WorkExperienceForm";
import AchievementsForm from "@/components/resume/forms/AchievementsForm";
import { createClient } from "@/utils/supabase/client";
import type { ResumeFormData } from "@/types/resume";

export default function EditResumePage() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchResume = async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id).single();
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
    return <p className="text-center py-10 text-gray-400">Loading...</p>;

  const updateResume = async () => {
    if (!resumeData) return;
    setSaving(true);
    const { error } = await supabase.from("resumes").update({ data: resumeData }).eq("id", id);
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
    <div className="p-6 space-y-6 max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
      <h1 className="text-2xl font-semibold text-white mb-4">Edit Resume</h1>

      {step === 1 && (
        <PersonalInfoForm
          initialData={resumeData.personalInfo}
          onChange={(data) => updateSection("personalInfo", data)}
        />
      )}
      {step === 2 && (
        <EducationForm
          initialData={resumeData.education}
          onChange={(data) => updateSection("education", data)}
        />
      )}
      {step === 3 && (
        <SkillsForm
          initialData={resumeData.skills}
          onChange={(data) => updateSection("skills", data)}
        />
      )}
      {step === 4 && (
        <WorkExperienceForm
          initialData={resumeData.experience}
          onChange={(data) => updateSection("experience", data)}
        />
      )}
      {step === 5 && (
        <AchievementsForm
          initialData={resumeData.achievements}
          onChange={(data) => updateSection("achievements", data)}
        />
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}
        {step < totalSteps ? (
          <Button onClick={() => setStep((prev) => Math.min(prev + 1, totalSteps))}>
            Next
          </Button>
        ) : (
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={updateResume}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Resume"}
          </Button>
        )}
      </div>
    </div>
  );
}
