"use client";

import { useEffect, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Achievement } from "@/types/resume";
import { EntryActions, moveItem, removeItem, replaceItem } from "./EntryActions";

const EMPTY: Achievement = { title: "", description: "", date: "" };

export default function AchievementsForm({
  onChange,
  initialData,
}: {
  initialData?: Achievement[];
  onChange?: (value: Achievement[]) => void;
}) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialData || []);
  const [form, setForm] = useState<Achievement>(EMPTY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setAchievements(initialData || []);
  }, [initialData]);

  const commit = (next: Achievement[]) => {
    setAchievements(next);
    onChange?.(next);
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const entry: Achievement = {
      title: form.title.trim(),
      description: form.description?.trim() || "",
      date: form.date?.trim() || "",
    };
    commit(
      editingIndex === null ? [...achievements, entry] : replaceItem(achievements, editingIndex, entry)
    );
    resetForm();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...EMPTY, ...achievements[index] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold">Achievements</h3>
      </div>

      <div className="space-y-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="space-y-1.5">
            <Label htmlFor="ach-title">Title</Label>
            <Input
              id="ach-title"
              placeholder="Dean's List, Hackathon winner, published paper..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ach-date">When</Label>
            <Input
              id="ach-date"
              placeholder="2024"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ach-description">Details</Label>
          <Textarea
            id="ach-description"
            rows={2}
            placeholder="One line on what it was and why it mattered."
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          {editingIndex !== null && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={handleSubmit}>
            <Plus className="h-4 w-4" />
            {editingIndex !== null ? "Save changes" : "Add achievement"}
          </Button>
        </div>
      </div>

      {achievements.length > 0 && (
        <ul className="space-y-2">
          {achievements.map((ach, i) => (
            <li
              key={`${ach.title}-${i}`}
              className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-card/70 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {ach.title}
                  {ach.date ? <span className="text-muted-foreground"> · {ach.date}</span> : null}
                </p>
                {ach.description && <p className="mt-1 text-sm text-muted-foreground">{ach.description}</p>}
              </div>
              <EntryActions
                index={i}
                count={achievements.length}
                editing={editingIndex === i}
                onEdit={() => startEdit(i)}
                onMove={(dir) => commit(moveItem(achievements, i, dir))}
                onDelete={() => {
                  commit(removeItem(achievements, i));
                  if (editingIndex === i) resetForm();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
