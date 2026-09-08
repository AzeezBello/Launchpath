import { describe, expect, it } from "vitest";
import { daysUntil, describeDeadline, parseDeadline, toIsoDate } from "./deadlines";

const NOW = new Date(2026, 8, 7); // 2026-09-07 local

describe("parseDeadline", () => {
  it("parses ISO dates", () => {
    expect(toIsoDate(parseDeadline("2026-11-07")!)).toBe("2026-11-07");
  });

  it("parses 'Month day, year' and 'day Month year'", () => {
    expect(toIsoDate(parseDeadline("Nov 7, 2026")!)).toBe("2026-11-07");
    expect(toIsoDate(parseDeadline("7 Nov 2026")!)).toBe("2026-11-07");
    expect(toIsoDate(parseDeadline("December 3, 2025")!)).toBe("2025-12-03");
  });

  it("treats 'Month year' as the end of that month", () => {
    expect(toIsoDate(parseDeadline("Feb 2026")!)).toBe("2026-02-28");
    expect(toIsoDate(parseDeadline("September 2026")!)).toBe("2026-09-30");
  });

  it("returns null for rolling, varies, empty, and garbage", () => {
    expect(parseDeadline("Rolling")).toBeNull();
    expect(parseDeadline("Varies by country")).toBeNull();
    expect(parseDeadline("")).toBeNull();
    expect(parseDeadline(undefined)).toBeNull();
    expect(parseDeadline("Foo 12, 2026")).toBeNull();
  });
});

describe("describeDeadline", () => {
  it("labels passed deadlines", () => {
    const info = describeDeadline("Nov 7, 2025", NOW);
    expect(info.passed).toBe(true);
    expect(info.label).toBe("Passed");
    expect(info.tone).toBe("neutral");
  });

  it("escalates tone as the deadline approaches", () => {
    expect(describeDeadline("2026-09-07", NOW)).toMatchObject({ label: "Due today", tone: "danger", daysLeft: 0 });
    expect(describeDeadline("2026-09-08", NOW)).toMatchObject({ label: "Due tomorrow", tone: "danger" });
    expect(describeDeadline("2026-09-12", NOW)).toMatchObject({ label: "Due in 5 days", tone: "danger" });
    expect(describeDeadline("2026-09-30", NOW)).toMatchObject({ label: "Due in 23 days", tone: "warning" });
    expect(describeDeadline("2026-11-07", NOW).tone).toBe("info");
  });

  it("handles non-date text", () => {
    expect(describeDeadline("Rolling", NOW)).toMatchObject({ label: "Rolling", tone: "success", passed: false });
    expect(describeDeadline("", NOW)).toMatchObject({ label: "No deadline", tone: "neutral" });
    expect(describeDeadline("Varies by country", NOW).label).toBe("Varies by country");
  });
});

describe("daysUntil", () => {
  it("ignores time of day", () => {
    const late = new Date(2026, 8, 8, 23, 59);
    expect(daysUntil(late, new Date(2026, 8, 7, 0, 1))).toBe(1);
  });
});
