"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EducationForm from "@/components/forms/EducationForm";
import WorkExperienceForm from "@/components/forms/WorkExperienceForm";
import SkillsForm from "@/components/forms/SkillsForm";
import AchievementsForm from "@/components/forms/AchievementsForm";
import ResumePreview from "@/components/resume/ResumePreview";

export default function ResumeModal() {
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "" });
  const [education, setEducation] = useState<any[]>([]);
  const [work, setWork] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-primary text-white rounded hover:opacity-90">
          ➕ Create Resume
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create or Edit Resume</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">👤 Personal Info</h3>
              <input
                placeholder="Full Name"
                className="border p-2 w-full rounded mb-2"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
              />
              <input
                placeholder="Email"
                className="border p-2 w-full rounded mb-2"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                className="border p-2 w-full rounded"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
            </div>

            <EducationForm onChange={setEducation} />
            <WorkExperienceForm onChange={setWork} />
            <SkillsForm onChange={setSkills} />
            <AchievementsForm onChange={setAchievements} />
          </div>

          <div>
            <ResumePreview
              personalInfo={personal}
              education={education}
              workExperience={work}
              skills={skills}
              achievements={achievements}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
