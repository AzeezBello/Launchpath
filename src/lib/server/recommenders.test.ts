import { describe, expect, it } from "vitest";
import { sanitizeRecommenderDate, sanitizeRecommenderEmail, sanitizeRecommenderStatus } from "./recommenders";

describe("recommender sanitizers", () => {
  it("lower-cases and validates emails", () => {
    expect(sanitizeRecommenderEmail(" Prof@Uni.EDU ")).toBe("prof@uni.edu");
    expect(sanitizeRecommenderEmail("not-an-email")).toBe("");
    expect(sanitizeRecommenderEmail(undefined)).toBe("");
  });

  it("keeps only ISO due dates", () => {
    expect(sanitizeRecommenderDate("2026-10-01")).toBe("2026-10-01");
    expect(sanitizeRecommenderDate("Oct 1")).toBeNull();
  });

  it("falls back to 'To ask' for unknown statuses", () => {
    expect(sanitizeRecommenderStatus("Submitted")).toBe("Submitted");
    expect(sanitizeRecommenderStatus("Maybe")).toBe("To ask");
  });
});
