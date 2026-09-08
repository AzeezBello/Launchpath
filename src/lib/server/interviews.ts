export type InterviewStatus = "Scheduled" | "Completed" | "Pending";

export type InterviewRow = {
  id: string;
  user_id: string;
  candidate: string;
  position: string;
  date: string;
  status: InterviewStatus;
  application_id: string | null;
  notes: string;
  location: string;
};

export const INTERVIEW_SELECT_COLUMNS =
  "id, user_id, candidate, position, date, status, application_id, notes, location";

export const INTERVIEW_ALLOWED_STATUS = new Set<InterviewStatus>(["Scheduled", "Completed", "Pending"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sanitizeInterviewText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function sanitizeInterviewStatus(value: unknown): InterviewStatus {
  if (typeof value !== "string") return "Pending";
  const status = value.trim() as InterviewStatus;
  return INTERVIEW_ALLOWED_STATUS.has(status) ? status : "Pending";
}

export function sanitizeInterviewDate(value: unknown) {
  if (typeof value !== "string") return new Date().toISOString().slice(0, 10);
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : new Date().toISOString().slice(0, 10);
}

/** Optional link to an application. Empty / malformed input clears it (null). */
export function sanitizeInterviewApplicationRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}
