import { describe, expect, it } from "vitest";
import { deriveResumeTitle, sanitizeResumeData } from "./resumes";

describe("sanitizeResumeData", () => {
  it("normalises a full payload and drops empty entries", () => {
    const data = sanitizeResumeData({
      personalInfo: { name: "  Ada  ", email: "ada@example.com", phone: "", summary: "Builder." },
      education: [{ school: "MIT", degree: "BSc", year: "2024" }, { school: "", degree: "" }],
      skills: ["React", "", "  SQL "],
      experience: [{ company: "Acme", role: "Engineer", duration: "2024", description: "Shipped." }, {}],
      achievements: [{ title: "Winner" }, { title: "" }],
    });

    expect(data.personalInfo).toEqual({ name: "Ada", email: "ada@example.com", phone: undefined, summary: "Builder." });
    expect(data.education).toHaveLength(1);
    expect(data.skills).toEqual(["React", "SQL"]);
    expect(data.experience).toHaveLength(1);
    expect(data.achievements).toEqual([{ title: "Winner", description: undefined, date: undefined }]);
  });

  it("caps list lengths and string sizes", () => {
    const data = sanitizeResumeData({
      personalInfo: { name: "x".repeat(500), email: "e" },
      skills: Array.from({ length: 100 }, (_, i) => `skill-${i}`),
    });
    expect(data.personalInfo?.name.length).toBe(120);
    expect(data.skills?.length).toBe(40);
  });

  it("survives garbage input", () => {
    expect(sanitizeResumeData(null).skills).toEqual([]);
    expect(sanitizeResumeData("nope").education).toEqual([]);
    expect(sanitizeResumeData({ skills: "not-an-array" }).skills).toEqual([]);
  });
});

describe("deriveResumeTitle", () => {
  it("prefers an explicit title, then the data title, then the name", () => {
    const data = sanitizeResumeData({ title: "Data title", personalInfo: { name: "Ada", email: "a" } });
    expect(deriveResumeTitle(data, "Explicit")).toBe("Explicit");
    expect(deriveResumeTitle(data)).toBe("Data title");
    expect(deriveResumeTitle(sanitizeResumeData({ personalInfo: { name: "Ada", email: "a" } }))).toBe("Ada's Resume");
    expect(deriveResumeTitle(sanitizeResumeData({}))).toBe("Untitled Resume");
  });
});
