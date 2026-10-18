// Client-safe deadline helpers shared by opportunity cards, applications,
// and the overview "Due soon" widget.
//
// Opportunity deadlines arrive as free text ("Nov 7, 2025", "Feb 2026",
// "Rolling", "Varies by country") while application deadlines are ISO dates.
// Everything funnels through parseDeadline() so the UI has one notion of
// "when is this due" and one notion of "has it passed".

export type DeadlineTone = "danger" | "warning" | "info" | "neutral" | "success";

export type DeadlineInfo = {
  /** Parsed date, or null when the text is not a real date ("Rolling", "Varies"). */
  date: Date | null;
  /** Whole days from today until the deadline. Negative when it has passed. */
  daysLeft: number | null;
  /** True when a real date was found and it is before today. */
  passed: boolean;
  /** Short badge text, e.g. "Due in 3 days", "Passed", "Rolling". */
  label: string;
  tone: DeadlineTone;
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Parse a deadline string into a Date at local midnight. Supports:
 *   "2026-11-07"            ISO date
 *   "Nov 7, 2026"           Month day, year
 *   "7 Nov 2026"            day Month year
 *   "Feb 2026" / "May 2026" Month year (treated as end of that month)
 * Returns null for anything else, including "Rolling" and "Varies".
 */
export function parseDeadline(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const monthDayYear = text.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDayYear) {
    const month = MONTHS[monthDayYear[1].toLowerCase()];
    if (month === undefined) return null;
    return new Date(Number(monthDayYear[3]), month, Number(monthDayYear[2]));
  }

  const dayMonthYear = text.match(/^(\d{1,2})\s+([A-Za-z]+)\.?,?\s+(\d{4})$/);
  if (dayMonthYear) {
    const month = MONTHS[dayMonthYear[2].toLowerCase()];
    if (month === undefined) return null;
    return new Date(Number(dayMonthYear[3]), month, Number(dayMonthYear[1]));
  }

  const monthYear = text.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase()];
    if (month === undefined) return null;
    const year = Number(monthYear[2]);
    return new Date(year, month, lastDayOfMonth(year, month));
  }

  return null;
}

export function daysUntil(date: Date, now = new Date()) {
  const ms = startOfDay(date).getTime() - startOfDay(now).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function describeDeadline(raw: string | null | undefined, now = new Date()): DeadlineInfo {
  const date = parseDeadline(raw);

  if (!date) {
    const text = (raw || "").trim();
    const lower = text.toLowerCase();
    if (!text) {
      return { date: null, daysLeft: null, passed: false, label: "No deadline", tone: "neutral" };
    }
    if (lower.includes("rolling") || lower.includes("ongoing")) {
      return { date: null, daysLeft: null, passed: false, label: "Rolling", tone: "success" };
    }
    return { date: null, daysLeft: null, passed: false, label: text, tone: "neutral" };
  }

  const left = daysUntil(date, now);

  if (left < 0) {
    return { date, daysLeft: left, passed: true, label: "Passed", tone: "neutral" };
  }
  if (left === 0) {
    return { date, daysLeft: left, passed: false, label: "Due today", tone: "danger" };
  }
  if (left === 1) {
    return { date, daysLeft: left, passed: false, label: "Due tomorrow", tone: "danger" };
  }
  if (left <= 7) {
    return { date, daysLeft: left, passed: false, label: `Due in ${left} days`, tone: "danger" };
  }
  if (left <= 30) {
    return { date, daysLeft: left, passed: false, label: `Due in ${left} days`, tone: "warning" };
  }
  return { date, daysLeft: left, passed: false, label: formatDeadline(date), tone: "info" };
}

export function formatDeadline(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** ISO yyyy-mm-dd for <input type="date"> values, in local time. */
export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DEADLINE_TONE_CLASS: Record<DeadlineTone, string> = {
  danger: "bg-destructive/15 text-destructive",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  neutral: "bg-muted text-muted-foreground",
};
