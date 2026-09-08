"use client";

import { useEffect, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Experience } from "@/types/resume";
import { EntryActions, moveItem, removeItem, replaceItem } from "./EntryActions";

interface WorkExperienceFormProps {
  initialData?: Experience[];
  onChange?: (value: Experience[]) => void;
}

const EMPTY: Experience = { company: "", role: "", duration: "", description: "" };

export default function WorkExperienceForm({ onChange, initialData }: WorkExperienceFormProps) {
  const [work, setWork] = useState<Experience[]>(initialData || []);
  const [form, setForm] = useState<Experience>(EMPTY);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setWork(initialData || []);
  }, [initialData]);

  const commit = (next: Experience[]) => {
    setWork(next);
    onChange?.(next);
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    const entry: Experience = {
      company: form.company.trim(),
      role: form.role.trim(),
      duration: form.duration.trim(),
      description: form.description?.trim() || "",
    };
    commit(editingIndex === null ? [...work, entry] : replaceItem(work, editingIndex, entry));
    resetForm();
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...EMPTY, ...work[index] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold">Work experience</h3>
      </div>

      <div className="space-y-3 rounded-[1.25rem] border border-border/80 bg-background/45 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="exp-company">Company</Label>
            <Input
              id="exp-company"
              placeholder="Acme Inc."
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-role">Role</Label>
            <Input
              id="exp-role"
              placeholder="Product Design Intern"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-duration">Duration</Label>
          <Input
            id="exp-duration"
            placeholder="Jun 2024 – Present"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-description">What you did</Label>
          <Textarea
            id="exp-description"
            rows={3}
            placeholder="Lead with outcomes: shipped X, grew Y by Z%, owned ..."
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
            {editingIndex !== null ? "Save changes" : "Add experience"}
          </Button>
        </div>
      </div>

      {work.length > 0 && (
        <ul className="space-y-2">
          {work.map((exp, i) => (
            <li
              key={`${exp.company}-${i}`}
              className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/80 bg-card/70 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {exp.role} <span className="text-muted-foreground">at</span> {exp.company}
                </p>
                {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                {exp.description && (
                  <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{exp.description}</p>
                )}
              </div>
              <EntryActions
                index={i}
                count={work.length}
                editing={editingIndex === i}
                onEdit={() => startEdit(i)}
                onMove={(dir) => commit(moveItem(work, i, dir))}
                onDelete={() => {
                  commit(removeItem(work, i));
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
