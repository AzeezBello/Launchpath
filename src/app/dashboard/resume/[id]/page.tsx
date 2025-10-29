"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import EducationForm from "@/components/resume/EducationForm";
import SkillsForm from "@/components/resume/SkillsForm";
import WorkExperienceForm from "@/components/resume/WorkExperienceForm";
import AchievementsForm from "@/components/resume/AchievementsForm";
import { useParams } from "next/navigation";

export default function EditResumePage() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    // Fetch resume data by ID (replace with real API)
    const fakeData = {
      education: [{ school: "Harvard", degree: "B.Sc." }],
      skills: ["React", "Next.js"],
      work: [],
      achievements: [],
    };
    setResumeData(fakeData);
  }, [id]);

  if (!resumeData) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Edit Resume - {id}</h1>

      {step === 1 && <EducationForm initialData={resumeData.education} />}
      {step === 2 && <SkillsForm initialData={resumeData.skills} />}
      {step === 3 && <WorkExperienceForm initialData={resumeData.work} />}
      {step === 4 && <AchievementsForm initialData={resumeData.achievements} />}

      <div className="flex justify-between">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button variant="default" onClick={() => alert("Resume Updated!")}>
            Update Resume
          </Button>
        )}
      </div>
    </div>
  );
}
