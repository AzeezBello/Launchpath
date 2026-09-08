"use client";

import { useEffect, useState } from "react";
import { Plus, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SkillsForm({
  onChange,
  initialData,
}: {
  initialData?: string[];
  onChange?: (value: string[]) => void;
}) {
  const [skills, setSkills] = useState<string[]>(initialData || []);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    setSkills(initialData || []);
  }, [initialData]);

  const commit = (next: string[]) => {
    setSkills(next);
    onChange?.(next);
  };

  // Accepts "React, TypeScript, SQL" in one go as well as single entries.
  const handleAdd = () => {
    const incoming = newSkill
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    const existing = new Set(skills.map((s) => s.toLowerCase()));
    const additions = incoming.filter((s) => !existing.has(s.toLowerCase()));
    if (additions.length > 0) commit([...skills, ...additions]);
    setNewSkill("");
  };

  const remove = (index: number) => commit(skills.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        <h3 className="text-lg font-semibold">Skills</h3>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="skill-input">Add skills</Label>
        <div className="flex gap-2">
          <Input
            id="skill-input"
            placeholder="React, data analysis, public speaking..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Separate several with commas. Skills drive job matching on your overview.
        </p>
      </div>

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <li
              key={`${skill}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 py-1 pl-3 pr-1.5 text-sm font-medium text-primary"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => remove(i)}
                className="rounded-full p-0.5 hover:bg-primary/15"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
