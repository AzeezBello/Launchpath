"use client";
import { useEffect, useState } from "react";

import { Experience } from "@/types/resume";

interface WorkExperienceFormProps {
  initialData?: Experience[];
  onChange?: (value: Experience[]) => void;
}


export default function WorkExperienceForm({
  onChange, initialData,
}: WorkExperienceFormProps) {
  const [work, setWork] = useState<Experience[]>(initialData || []);
  const [form, setForm] = useState<Experience>({
    company: "",
    role: "",
    duration: "",
    description: "",
  });

  const handleAdd = () => {
    if (!form.company || !form.role) return;
    const updated = [...work, form];
    setWork(updated);
    setForm({ company: "", role: "", duration: "", description: "" });
    onChange?.(updated);
  };

  useEffect(() => {
    setWork(initialData || []);
  }, [initialData]);

  useEffect(() => {
    onChange?.(work);
  }, [work, onChange]);

  return (
    <div className="glass-card p-4 rounded-xl shadow-md space-y-3">
      <h3 className="text-lg font-semibold">💼 Work Experience</h3>
      <input
        placeholder="Company"
        className="border rounded p-2 w-full"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <input
        placeholder="Role"
        className="border rounded p-2 w-full"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      />
      <input
        placeholder="Duration (e.g. 2020 - 2024)"
        className="border rounded p-2 w-full"
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />
      <textarea
        placeholder="Description"
        className="border rounded p-2 w-full"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      >
        Add Experience
      </button>
      <ul className="space-y-2">
        {work.map((exp, i) => (
          <li key={i} className="border rounded p-2">
            <strong>{exp.company}</strong> – {exp.role} <br />
            <span className="text-sm text-gray-500">{exp.duration}</span>
            <p>{exp.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
