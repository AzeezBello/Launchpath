import type { ResumeFormData } from "@/types/resume";

export type ResumeRow = {
  id: string;
  user_id: string;
  title: string;
  data: ResumeFormData;
  created_at: string;
  updated_at: string;
};

export const RESUME_SELECT_COLUMNS = "id, user_id, title, data, created_at, updated_at";

const MAX_LIST = 40;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalText(value: unknown, max: number) {
  const out = text(value, max);
  return out || undefined;
}

/**
 * Bounds every field of the resume payload. The shape is user-authored JSON,
 * so cap list lengths and string sizes rather than trusting the client.
 */
export function sanitizeResumeData(input: unknown): ResumeFormData {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const info = (raw.personalInfo && typeof raw.personalInfo === "object" ? raw.personalInfo : {}) as Record<
    string,
    unknown
  >;

  const list = (value: unknown) => (Array.isArray(value) ? value.slice(0, MAX_LIST) : []);

  return {
    title: optionalText(raw.title, 120),
    personalInfo: {
      name: text(info.name, 120),
      email: text(info.email, 160),
      phone: optionalText(info.phone, 40),
      summary: optionalText(info.summary, 1500),
    },
    education: list(raw.education)
      .map((e) => {
        const r = (e || {}) as Record<string, unknown>;
        return { school: text(r.school, 160), degree: text(r.degree, 160), year: optionalText(r.year, 40) };
      })
      .filter((e) => e.school || e.degree),
    skills: list(raw.skills)
      .map((s) => text(s, 60))
      .filter(Boolean),
    experience: list(raw.experience)
      .map((e) => {
        const r = (e || {}) as Record<string, unknown>;
        return {
          company: text(r.company, 160),
          role: text(r.role, 160),
          duration: text(r.duration, 80),
          description: optionalText(r.description, 2000),
        };
      })
      .filter((e) => e.company || e.role),
    achievements: list(raw.achievements)
      .map((a) => {
        const r = (a || {}) as Record<string, unknown>;
        return { title: text(r.title, 160), description: optionalText(r.description, 1000), date: optionalText(r.date, 40) };
      })
      .filter((a) => a.title),
  };
}

export function deriveResumeTitle(data: ResumeFormData, explicit?: unknown) {
  const given = text(explicit, 120) || data.title || "";
  if (given) return given;
  const name = data.personalInfo?.name;
  return name ? `${name}'s Resume` : "Untitled Resume";
}
