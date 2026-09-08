export type RecommenderStatus = "To ask" | "Requested" | "Submitted" | "Declined";

export type RecommenderRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  name: string;
  email: string;
  relationship: string;
  status: RecommenderStatus;
  due_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export const RECOMMENDER_SELECT_COLUMNS =
  "id, user_id, application_id, name, email, relationship, status, due_date, notes, created_at, updated_at";

export const RECOMMENDER_STATUSES: RecommenderStatus[] = ["To ask", "Requested", "Submitted", "Declined"];
const ALLOWED = new Set<RecommenderStatus>(RECOMMENDER_STATUSES);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeRecommenderText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Lower-cased, validated email or empty string. */
export function sanitizeRecommenderEmail(value: unknown) {
  const email = sanitizeRecommenderText(value, 160).toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

export function sanitizeRecommenderStatus(value: unknown): RecommenderStatus {
  if (typeof value !== "string") return "To ask";
  const status = value.trim() as RecommenderStatus;
  return ALLOWED.has(status) ? status : "To ask";
}

export function sanitizeRecommenderDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export function sanitizeRecommenderApplicationRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}
