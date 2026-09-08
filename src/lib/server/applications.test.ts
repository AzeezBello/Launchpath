import { describe, expect, it } from "vitest";
import {
  APPLICATION_STATUSES,
  sanitizeApplicationDeadline,
  sanitizeApplicationProgram,
  sanitizeApplicationRef,
  sanitizeApplicationStatus,
  sanitizeApplicationUrl,
} from "./applications";

describe("application sanitizers", () => {
  it("accepts every declared status and falls back otherwise", () => {
    for (const status of APPLICATION_STATUSES) {
      expect(sanitizeApplicationStatus(status)).toBe(status);
    }
    expect(sanitizeApplicationStatus("Ghosted")).toBe("Pending Review");
    expect(sanitizeApplicationStatus(42)).toBe("Pending Review");
  });

  it("trims and caps the program name", () => {
    expect(sanitizeApplicationProgram("  Chevening  ")).toBe("Chevening");
    expect(sanitizeApplicationProgram("x".repeat(500)).length).toBe(160);
    expect(sanitizeApplicationProgram(null)).toBe("");
  });

  it("only keeps ISO deadlines, clearing anything else", () => {
    expect(sanitizeApplicationDeadline("2026-11-07")).toBe("2026-11-07");
    expect(sanitizeApplicationDeadline("2026-11-07T10:00:00Z")).toBe("2026-11-07");
    expect(sanitizeApplicationDeadline("Nov 7")).toBeNull();
    expect(sanitizeApplicationDeadline("")).toBeNull();
    expect(sanitizeApplicationDeadline(undefined)).toBeNull();
  });

  it("only keeps http(s) URLs", () => {
    expect(sanitizeApplicationUrl("https://example.com/apply")).toBe("https://example.com/apply");
    expect(sanitizeApplicationUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeApplicationUrl("not a url")).toBe("");
    expect(sanitizeApplicationUrl("")).toBe("");
  });

  it("validates foreign-key references as UUIDs", () => {
    expect(sanitizeApplicationRef("0b0c6d7e-1111-4222-8333-444455556666")).toBe(
      "0b0c6d7e-1111-4222-8333-444455556666"
    );
    expect(sanitizeApplicationRef("123")).toBeNull();
    expect(sanitizeApplicationRef("")).toBeNull();
  });
});
