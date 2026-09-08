export type ApplicationStatus =
  | "Draft"
  | "Pending Review"
  | "In Review"
  | "Interviewing"
  | "Offer"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

export type ApplicationRow = {
  id: string;
  user_id: string;
  program: string;
  status: ApplicationStatus;
  date: string;
  deadline: string | null;
  notes: string;
  url: string;
  resume_id: string | null;
  cover_letter_id: string | null;
  opportunity_id: string | null;
  opportunity_type: string | null;
};

export const APPLICATION_SELECT_COLUMNS =
  "id, user_id, program, status, date, deadline, notes, url, resume_id, cover_letter_id, opportunity_id, opportunity_type";

// Ordered the way a pipeline reads: earliest stage first.
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Draft",
  "Pending Review",
  "In Review",
  "Interviewing",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

export const APPLICATION_ALLOWED_STATUS = new Set<ApplicationStatus>(APPLICATION_STATUSES);

// Statuses where a deadline still matters for the user.
export const APPLICATION_OPEN_STATUSES: ApplicationStatus[] = [
  "Draft",
  "Pending Review",
  "In Review",
  "Interviewing",
  "Offer",
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sanitizeApplicationProgram(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 160);
}

export function sanitizeApplicationStatus(value: unknown): ApplicationStatus {
  if (typeof value !== "string") return "Pending Review";
  const normalized = value.trim() as ApplicationStatus;
  return APPLICATION_ALLOWED_STATUS.has(normalized) ? normalized : "Pending Review";
}

export function sanitizeApplicationDate(value: unknown) {
  if (typeof value !== "string") return new Date().toISOString().slice(0, 10);
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : new Date().toISOString().slice(0, 10);
}

/** Optional ISO date. Empty / invalid input clears the deadline (null). */
export function sanitizeApplicationDeadline(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

export function sanitizeApplicationNotes(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

/** Only http(s) URLs are kept; anything else becomes an empty string. */
export function sanitizeApplicationUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 600);
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

/** Optional foreign key. Empty / malformed input clears the link (null). */
export function sanitizeApplicationRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}
