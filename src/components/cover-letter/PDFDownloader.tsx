// src/app/dashboard/cover-letter/components/PDFDownloader.tsx
"use client";

import { jsPDF } from "jspdf";

export function downloadLetterAsPdf(filename: string, title: string, content: string) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 10, 15);
  doc.setFontSize(11);
  const split = doc.splitTextToSize(content, 180);
  doc.text(split, 10, 30);
  doc.save(filename);
}
