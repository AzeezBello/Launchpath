// src/app/dashboard/cover-letter/components/GeneratedLetterPreview.tsx
"use client";

import React from "react";
import { jsPDF } from "jspdf";

type Props = {
  content: string;
  meta?: { company?: string; position?: string; tone?: string };
  onSave: () => void;
  source?: string;
};

export default function GeneratedLetterPreview({ content, meta, onSave, source }: Props) {
  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`${meta?.position || "Cover Letter"} — ${meta?.company || ""}`, 10, 15);
    const split = doc.splitTextToSize(content, 180);
    doc.text(split, 10, 30);
    doc.save(`${(meta?.position || "cover_letter").replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="glass p-4 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">{meta?.position || "Cover Letter"}</h3>
          <p className="text-sm text-gray-400">{meta?.company}</p>
        </div>

        <div className="flex gap-2 items-center">
          {source && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200 border border-white/10">
              {source === "openai" ? "OpenAI" : "Template"}
            </span>
          )}
          <button onClick={onSave} className="btn">Save</button>
          <button onClick={downloadPdf} className="btn outline">Download PDF</button>
        </div>
      </div>

      <pre className="whitespace-pre-wrap text-sm text-gray-100">{content}</pre>
    </div>
  );
}
