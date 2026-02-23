// src/app/dashboard/cover-letter/components/CoverLetterForm.tsx
"use client";

import React, { useState } from "react";

type Props = {
  onGenerate: (payload: { company: string; position: string; description?: string; tone?: string }) => void;
  loading?: boolean;
};

export default function CoverLetterForm({ onGenerate, loading }: Props) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Professional");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) {
      alert("Company and position required");
      return;
    }
    onGenerate({ company, position, description, tone: tone.toLowerCase() });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input className="input" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className="input" placeholder="Position title" value={position} onChange={(e) => setPosition(e.target.value)} />
      </div>

      <textarea className="textarea" placeholder="Job description or notes (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

      <div className="flex gap-2 items-center">
        {["Professional", "Friendly", "Confident", "Persuasive"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTone(t)}
            className={`px-3 py-1 rounded-full text-sm ${tone === t ? "bg-white/20 text-white" : "bg-transparent text-gray-300 hover:bg-white/10"}`}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </form>
  );
}
