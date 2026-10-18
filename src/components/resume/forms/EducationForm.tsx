"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Education } from "@/types/resume";
import { EntryActions, moveItem, removeItem, replaceItem } from "./EntryActions";

interface EducationFormProps {
  initialData?: Education[];
  onChange?: (value: Education[]) => void;
}

const EMPTY: Education = { school: "", degree: "", year: "" };

export default function EducationForm({ onChange, initialData }: EducationFormProps) {
  const [education, setEducation] = useState<Education[]>(initialData || []);
  const [form, setForm] = useState<Education>(EMPTY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setEducation(initialData || []);
  }, [initialData]);

  const commit = (next: Education[]) => {
    setEducation(next);
    onChange?.(next);
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!form.school.trim() || !form.degree.trim()) return;
    const entry: Education = {
      school: form.school.trim(),
      degree: form.degree.trim(),
      year: form.year?.trim() || "",
    };
    commit(editingIndex === null ? [...education, entry] : replaceItem(education, editingIndex, entry));
    resetForm();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...EMPTY, ...education[index] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold">Education</h3>
      </div>

      <div className="space-y-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edu-school">School</Label>
            <Input
              id="edu-school"
              placeholder="University of Lagos"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edu-degree">Degree or certificate</Label>
            <Input
              id="edu-degree"
              placeholder="BSc Computer Science"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[200px_1fr] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="edu-year">Year</Label>
            <Input
              id="edu-year"
              placeholder="2024"
              value={form.year || ""}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:justify-end">
            {editingIndex !== null && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="button" onClick={handleSubmit}>
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? "Save changes" : "Add education"}
            </Button>
          </div>
        </div>
      </div>

      {education.length > 0 && (
        <ul className="space-y-2">
          {education.map((edu, i) => (
            <li
              key={`${edu.school}-${i}`}
              className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-card/70 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{edu.school}</p>
                <p className="text-sm text-muted-foreground">
                  {edu.degree}
                  {edu.year ? ` · ${edu.year}` : ""}
                </p>
              </div>
              <EntryActions
                index={i}
                count={education.length}
                editing={editingIndex === i}
                onEdit={() => startEdit(i)}
                onMove={(dir) => commit(moveItem(education, i, dir))}
                onDelete={() => {
                  commit(removeItem(education, i));
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
