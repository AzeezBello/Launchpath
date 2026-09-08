import { describe, expect, it } from "vitest";
import { countWords, sanitizeEssayStatus, sanitizeEssayWordLimit } from "./essays";

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("one")).toBe(1);
    expect(countWords("one two\nthree   four")).toBe(4);
  });
});

describe("sanitizeEssayWordLimit", () => {
  it("accepts positive integers from numbers or strings", () => {
    expect(sanitizeEssayWordLimit(500)).toBe(500);
    expect(sanitizeEssayWordLimit("650")).toBe(650);
    expect(sanitizeEssayWordLimit(499.6)).toBe(500);
  });

  it("clears invalid values", () => {
    expect(sanitizeEssayWordLimit("")).toBeNull();
    expect(sanitizeEssayWordLimit(0)).toBeNull();
    expect(sanitizeEssayWordLimit(-5)).toBeNull();
    expect(sanitizeEssayWordLimit(200000)).toBeNull();
    expect(sanitizeEssayWordLimit("lots")).toBeNull();
  });
});

describe("sanitizeEssayStatus", () => {
  it("only allows the declared statuses", () => {
    expect(sanitizeEssayStatus("Final")).toBe("Final");
    expect(sanitizeEssayStatus("Done")).toBe("Not started");
  });
});
