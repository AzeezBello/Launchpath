"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EducationForm from "@/components/resume/EducationForm";
import SkillsForm from "@/components/resume/SkillsForm";
import WorkExperienceForm from "@/components/resume/WorkExperienceForm";
import AchievementsForm from "@/components/resume/AchievementsForm";

export default function NewResumePage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Create New Resume</h1>

      {step === 1 && <EducationForm />}
      {step === 2 && <SkillsForm />}
      {step === 3 && <WorkExperienceForm />}
      {step === 4 && <AchievementsForm />}

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button variant="default" onClick={() => alert("Resume Saved!")}>
            Save Resume
          </Button>
        )}
      </div>
    </div>
  );
}
