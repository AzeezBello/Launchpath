export type ApplicationStatus = "Pending Review" | "Accepted" | "Rejected" | "In Review";

export type ApplicationRow = {
  id: string;
  user_id: string;
  program: string;
  status: ApplicationStatus;
  date: string;
  opportunity_id: string | null;
  opportunity_type: string | null;
};

export const APPLICATION_SELECT_COLUMNS =
  "id, user_id, program, status, date, opportunity_id, opportunity_type";

export const APPLICATION_ALLOWED_STATUS = new Set<ApplicationStatus>([
  "Pending Review",
  "Accepted",
  "Rejected",
  "In Review",
]);

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
