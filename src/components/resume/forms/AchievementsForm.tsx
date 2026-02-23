"use client";
import { useEffect, useState } from "react";
import type { Achievement } from "@/types/resume";

export default function AchievementsForm({
  onChange,
  initialData,
}: {
  initialData?: Achievement[];
  onChange?: (value: Achievement[]) => void;
}) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialData || []);
  const [newAchievement, setNewAchievement] = useState<Achievement>({
    title: "",
    description: "",
    date: "",
  });

  const handleAdd = () => {
    if (!newAchievement.title.trim()) return;
    const updated = [...achievements, newAchievement];
    setAchievements(updated);
    setNewAchievement({ title: "", description: "", date: "" });
    onChange?.(updated);
  };

  useEffect(() => {
    setAchievements(initialData || []);
  }, [initialData]);

  useEffect(() => {
    onChange?.(achievements);
  }, [achievements, onChange]);

  return (
    <div className="glass-card p-4 rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold">🏆 Achievements</h3>
      <div className="space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Title"
          value={newAchievement.title}
          onChange={(e) =>
            setNewAchievement({ ...newAchievement, title: e.target.value })
          }
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Date (e.g. 2024)"
          value={newAchievement.date}
          onChange={(e) =>
            setNewAchievement({ ...newAchievement, date: e.target.value })
          }
        />
        <textarea
          className="border p-2 rounded w-full"
          placeholder="Description"
          value={newAchievement.description}
          onChange={(e) =>
            setNewAchievement({
              ...newAchievement,
              description: e.target.value,
            })
          }
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Add Achievement
        </button>
      </div>
      <ul className="space-y-2">
        {achievements.map((ach, idx) => (
          <li key={idx} className="border rounded p-2">
            <strong>{ach.title}</strong> — {ach.date}
            <p>{ach.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
