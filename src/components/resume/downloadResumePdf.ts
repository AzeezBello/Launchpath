import { jsPDF } from "jspdf";
import type { ResumeFormData } from "@/types/resume";

const PAGE_HEIGHT = 297; // A4 in mm
const MARGIN = 15;
const CONTENT_WIDTH = 180;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;

function makeCursor(doc: jsPDF) {
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const title = (text: string) => {
    ensureSpace(9);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20);
    doc.text(text, MARGIN, y + 7);
    y += 10;
  };

  const heading = (text: string) => {
    ensureSpace(10);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20);
    doc.text(text, MARGIN, y);
    y += 2;
    doc.setDrawColor(210);
    doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
    y += 6;
  };

  const line = (text: string, options?: { size?: number; bold?: boolean; color?: number }) => {
    if (!text) return;
    doc.setFontSize(options?.size ?? 10.5);
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    doc.setTextColor(options?.color ?? 20);

    const wrapped = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    ensureSpace(wrapped.length * 5.5);
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 5.5;
  };

  const spacer = (amount = 4) => {
    y += amount;
  };

  return { title, heading, line, spacer };
}

export function downloadResumeAsPdf(filename: string, resume: ResumeFormData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor = makeCursor(doc);

  const info = resume.personalInfo || { name: "", email: "", phone: "" };

  cursor.title(info.name || "Untitled Resume");

  const contactLine = [info.email, info.phone].filter(Boolean).join("  |  ");
  if (contactLine) cursor.line(contactLine, { size: 10.5, color: 90 });
  cursor.spacer(3);

  if (info.summary) {
    cursor.heading("Summary");
    cursor.line(info.summary);
    cursor.spacer();
  }

  if (resume.education && resume.education.length > 0) {
    cursor.heading("Education");
    resume.education.forEach((edu) => {
      cursor.line(`${edu.school} — ${edu.degree}${edu.year ? ` (${edu.year})` : ""}`, { bold: true });
    });
    cursor.spacer();
  }

  if (resume.experience && resume.experience.length > 0) {
    cursor.heading("Work Experience");
    resume.experience.forEach((exp) => {
      cursor.line(`${exp.role} — ${exp.company}${exp.duration ? ` (${exp.duration})` : ""}`, { bold: true });
      if (exp.description) cursor.line(exp.description, { color: 70 });
      cursor.spacer(2);
    });
    cursor.spacer(2);
  }

  if (resume.skills && resume.skills.length > 0) {
    cursor.heading("Skills");
    cursor.line(resume.skills.join("  •  "));
    cursor.spacer();
  }

  if (resume.achievements && resume.achievements.length > 0) {
    cursor.heading("Achievements");
    resume.achievements.forEach((ach) => {
      cursor.line(`${ach.title}${ach.date ? ` — ${ach.date}` : ""}`, { bold: true });
      if (ach.description) cursor.line(ach.description, { color: 70 });
      cursor.spacer(2);
    });
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
