// src/app/dashboard/cover-letter/components/GeneratedLetterPreview.tsx
"use client";

import { jsPDF } from "jspdf";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{meta?.position || "Cover Letter"}</CardTitle>
          <CardDescription>{meta?.company}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {source && (
            <Badge variant="outline">{source === "openai" ? "OpenAI" : "Template"}</Badge>
          )}
          <Button variant="secondary" size="sm" onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap rounded-2xl border border-border/70 bg-background/60 p-4 text-sm leading-relaxed text-foreground">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
