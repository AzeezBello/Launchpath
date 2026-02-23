"use client";

import type { PersonalInfo, Education, Experience, Achievement } from "@/types/resume";

interface ResumePreviewProps {
  personalInfo: PersonalInfo;
  education?: Education[];
  workExperience?: Experience[];
  skills?: string[];
  achievements?: Achievement[];
}

export default function ResumePreview({
  personalInfo,
  education = [],
  workExperience = [],
  skills = [],
  achievements = [],
}: ResumePreviewProps) {
  return (
    <div className="border rounded p-4 space-y-4 bg-white dark:bg-gray-900">
      <div>
        <h2 className="text-2xl font-bold">{personalInfo.name || "Your Name"}</h2>
        <p>{personalInfo.email}</p>
        <p>{personalInfo.phone}</p>
      </div>

      <div>
        <h3 className="font-semibold text-lg">🎓 Education</h3>
        <ul>
          {education.map((edu, i) => (
            <li key={i}>
              <strong>{edu.school}</strong> - {edu.degree} ({edu.year})
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg">💼 Work Experience</h3>
        <ul>
          {workExperience.map((exp, i) => (
            <li key={i}>
              <strong>{exp.company}</strong> - {exp.role} ({exp.duration})<br />
              <p>{exp.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-lg">🛠 Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span
              key={i}
              className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg">🏆 Achievements</h3>
        <ul>
          {achievements.map((ach, i) => (
            <li key={i}>
              <strong>{ach.title}</strong> - {ach.date}
              <p>{ach.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
