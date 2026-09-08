export type EssayStatus = "Not started" | "Drafting" | "Review" | "Final";

export type EssayRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  title: string;
  prompt: string;
  content: string;
  word_limit: number | null;
  status: EssayStatus;
  created_at: string;
  updated_at: string;
};

export const ESSAY_SELECT_COLUMNS =
  "id, user_id, application_id, title, prompt, content, word_limit, status, created_at, updated_at";

export const ESSAY_STATUSES: EssayStatus[] = ["Not started", "Drafting", "Review", "Final"];
const ALLOWED_STATUS = new Set<EssayStatus>(ESSAY_STATUSES);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sanitizeEssayText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sanitizeEssayStatus(value: unknown): EssayStatus {
  if (typeof value !== "string") return "Not started";
  const status = value.trim() as EssayStatus;
  return ALLOWED_STATUS.has(status) ? status : "Not started";
}

/** Optional positive integer; anything else clears the limit (null). */
export function sanitizeEssayWordLimit(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded > 0 && rounded <= 100000 ? rounded : null;
}

export function sanitizeEssayApplicationRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
