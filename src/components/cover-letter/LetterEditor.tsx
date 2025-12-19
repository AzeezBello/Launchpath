// src/app/dashboard/cover-letter/components/LetterEditor.tsx
"use client";

import React from "react";

export default function LetterEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={14} className="textarea w-full" />
  );
}
