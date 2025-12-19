"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "@/components/resume/forms/PersonalInfoForm";
import EducationForm from "@/components/resume/forms/EducationForm";
import SkillsForm from "@/components/resume/forms/SkillsForm";
import WorkExperienceForm from "@/components/resume/forms/WorkExperienceForm";
import AchievementsForm from "@/components/resume/forms/AchievementsForm";
import { createClient } from "@/utils/supabase/client";

import { useRouter } from "next/navigation";
import {
  ResumeFormData,
} from "@/types/resume";

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
  const supabase = createClient();

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
        <PersonalInfoForm
          initialData={formData.personalInfo}
          onChange={(data) => updateSection("personalInfo", data)}
        />
      ),
    },
    {
      id: 2,
      content: (
        <EducationForm
          initialData={formData.education}
          onChange={(data) => updateSection("education", data)}
        />
      ),
    },
    {
      id: 3,
      content: (
        <SkillsForm
          initialData={formData.skills}
          onChange={(data) => updateSection("skills", data)}
        />
      ),
    },
    {
      id: 4,
      content: (
        <WorkExperienceForm
          initialData={formData.experience}
          onChange={(data) => updateSection("experience", data)}
        />
      ),
    },
    {
      id: 5,
      content: (
        <AchievementsForm
          initialData={formData.achievements}
          onChange={(data) => updateSection("achievements", data)}
        />
      ),
    },
  ];

  const saveResume = async () => {
    if (!formData.personalInfo?.name || !formData.personalInfo?.email) {
      toast.error("Please add your name and email before saving.");
      return;
    }

    setSaving(true);
    const title =
      formData.title ||
      (formData.personalInfo?.name
        ? `${formData.personalInfo.name}'s Resume`
        : "Untitled Resume");

    const { error } = await supabase.from("resumes").insert({
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
    <div className="p-6 space-y-6 max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
      <h1 className="text-2xl font-semibold text-white mb-4">
        Create New Resume
      </h1>

      {steps[step - 1]?.content}

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
            onClick={saveResume}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Resume"}
          </Button>
        )}
      </div>
    </div>
  );
}
