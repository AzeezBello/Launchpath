export type CoverLetterRow = {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  tone: string;
  description: string;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
};

export const COVER_LETTER_SELECT_COLUMNS =
  "id, user_id, company_name, position, tone, description, content, source, created_at, updated_at";

const ALLOWED_SOURCES = new Set(["openai", "fallback", "offline-template", "manual"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export type CoverLetterInput = {
  company_name: string;
  position: string;
  tone: string;
  description: string;
  content: string;
  source: string;
};

/** Full-object sanitizer for create; `partial` returns only the keys present for PATCH. */
export function sanitizeCoverLetter(input: unknown, partial = false): Partial<CoverLetterInput> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Partial<CoverLetterInput> = {};

  const set = (key: keyof CoverLetterInput, value: string) => {
    out[key] = value;
  };

  if (!partial || "company_name" in raw) set("company_name", text(raw.company_name, 160));
  if (!partial || "position" in raw) set("position", text(raw.position, 160));
  if (!partial || "tone" in raw) set("tone", (text(raw.tone, 40) || "professional").toLowerCase());
  if (!partial || "description" in raw) set("description", text(raw.description, 3000));
  if (!partial || "content" in raw) set("content", text(raw.content, 20000));
  if (!partial || "source" in raw) {
    const source = text(raw.source, 40);
    set("source", ALLOWED_SOURCES.has(source) ? source : "manual");
  }

  return out;
}
