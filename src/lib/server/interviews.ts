export type InterviewStatus = "Scheduled" | "Completed" | "Pending";

export type InterviewRow = {
  id: string;
  user_id: string;
  candidate: string;
  position: string;
  date: string;
  status: InterviewStatus;
};

export const INTERVIEW_SELECT_COLUMNS = "id, user_id, candidate, position, date, status";

export const INTERVIEW_ALLOWED_STATUS = new Set<InterviewStatus>(["Scheduled", "Completed", "Pending"]);

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
