"use client";
import { useState } from "react";

interface Education {
  school: string;
  degree: string;
  year: string;
}

export default function EducationForm({
  onChange,
}: {
  onChange?: (value: Education[]) => void;
}) {
  const [education, setEducation] = useState<Education[]>([]);
  const [form, setForm] = useState<Education>({ school: "", degree: "", year: "" });

  const handleAdd = () => {
    if (!form.school || !form.degree) return;
    const updated = [...education, form];
    setEducation(updated);
    setForm({ school: "", degree: "", year: "" });
    onChange?.(updated);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">🎓 Education</h3>
      <input
        placeholder="School Name"
        className="border rounded p-2 w-full"
        value={form.school}
        onChange={(e) => setForm({ ...form, school: e.target.value })}
      />
      <input
        placeholder="Degree / Certificate"
        className="border rounded p-2 w-full"
        value={form.degree}
        onChange={(e) => setForm({ ...form, degree: e.target.value })}
      />
      <input
        placeholder="Year (e.g. 2024)"
        className="border rounded p-2 w-full"
        value={form.year}
        onChange={(e) => setForm({ ...form, year: e.target.value })}
      />
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      >
        Add Education
      </button>

      <ul className="space-y-2">
        {education.map((edu, i) => (
          <li key={i} className="border rounded p-2">
            <strong>{edu.school}</strong> – {edu.degree} ({edu.year})
          </li>
        ))}
      </ul>
    </div>
  );
}
