"use client";
import { useState } from "react";

export default function SkillsForm({
  onChange,
}: {
  onChange?: (value: string[]) => void;
}) {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    if (!newSkill.trim()) return;
    const updated = [...skills, newSkill.trim()];
    setSkills(updated);
    setNewSkill("");
    onChange?.(updated);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">🛠 Skills</h3>
      <div className="flex gap-2">
        <input
          placeholder="Add a skill"
          className="border rounded p-2 flex-1"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Add
        </button>
      </div>

      <ul className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <li
            key={i}
            className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
