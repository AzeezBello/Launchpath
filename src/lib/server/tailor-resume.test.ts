import { describe, expect, it } from "vitest";
import { extractKeywords, keywordCoverage, tailorFallback } from "./tailor-resume";
import type { ResumeFormData } from "@/types/resume";

const RESUME: ResumeFormData = {
  title: "Ada Resume",
  personalInfo: { name: "Ada", email: "ada@example.com", summary: "Engineer who ships." },
  skills: ["Public speaking", "Python", "SQL", "Figma"],
  experience: [{ company: "Acme", role: "Analyst", duration: "2024", description: "Built dashboards in SQL." }],
  education: [],
  achievements: [],
};

const JD = `We are hiring a Data Analyst. You will write SQL, build dashboards, and use Python for analysis.
Strong SQL and Python skills are required; dashboards experience is a plus. Python, SQL, dashboards.`;

describe("extractKeywords", () => {
  it("ranks recurring, non-stopword terms first", () => {
    const keywords = extractKeywords(JD, 5);
    expect(keywords.slice(0, 3)).toEqual(expect.arrayContaining(["sql", "python", "dashboards"]));
    expect(keywords).not.toContain("the");
    expect(keywords).not.toContain("skills");
  });
});

describe("keywordCoverage", () => {
  it("splits keywords into matched and missing", () => {
    const { matched, missing } = keywordCoverage(RESUME, JD);
    expect(matched).toEqual(expect.arrayContaining(["sql", "python", "dashboards"]));
    expect(missing).toContain("analysis");
    expect(missing).not.toContain("sql");
  });
});

describe("tailorFallback", () => {
  it("moves matching skills first and targets the summary without inventing facts", () => {
    const result = tailorFallback({ resume: RESUME, position: "Data Analyst", company: "Stripe", jobDescription: JD });

    expect(result.source).toBe("fallback");
    expect(result.data.skills?.slice(0, 2)).toEqual(expect.arrayContaining(["Python", "SQL"]));
    // Non-matching skills keep their original relative order (stable sort).
    expect(result.data.skills?.slice(2)).toEqual(["Public speaking", "Figma"]);
    expect(result.data.personalInfo?.summary).toContain("Data Analyst");
    expect(result.data.personalInfo?.summary).toContain("Engineer who ships.");
    expect(result.data.title).toBe("Ada Resume — Data Analyst");
    expect(result.data.experience).toEqual(RESUME.experience);
  });

  it("does not repeat the role when the summary already mentions it", () => {
    const resume = { ...RESUME, personalInfo: { ...RESUME.personalInfo!, summary: "Data analyst at heart." } };
    const result = tailorFallback({ resume, position: "Data Analyst", jobDescription: JD });
    expect(result.data.personalInfo?.summary).toBe("Data analyst at heart.");
  });
});
