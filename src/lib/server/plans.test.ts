import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PLAN_LIMITS, checkPlanLimit, resolvePlan } from "./plans";

function fakeUser(appPlan?: string, userPlan?: string): User {
  return {
    id: "user-1",
    app_metadata: appPlan ? { plan: appPlan } : {},
    user_metadata: userPlan ? { plan: userPlan } : {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
  } as unknown as User;
}

/** Minimal chainable stub for `.from().select().eq().gte()` returning a count. */
function fakeSupabase(count: number, error: { code?: string; message: string } | null = null) {
  const result = Promise.resolve({ count, error });
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    then: result.then.bind(result),
  };
  return { from: vi.fn(() => chain) } as unknown as SupabaseClient;
}

describe("resolvePlan", () => {
  it("prefers app_metadata and normalises case", () => {
    expect(resolvePlan(fakeUser("PRO"))).toBe("pro");
    expect(resolvePlan(fakeUser("team"))).toBe("team");
    expect(resolvePlan(fakeUser(undefined, "pro"))).toBe("pro");
    expect(resolvePlan(fakeUser("pro", "starter"))).toBe("pro");
  });

  it("defaults to starter for unknown or missing values", () => {
    expect(resolvePlan(fakeUser())).toBe("starter");
    expect(resolvePlan(fakeUser("enterprise"))).toBe("starter");
  });
});

describe("checkPlanLimit", () => {
  it("allows creation below the limit", async () => {
    const result = await checkPlanLimit(fakeSupabase(3), fakeUser(), "resumes");
    expect(result).toMatchObject({ ok: true, plan: "starter", used: 3, limit: PLAN_LIMITS.starter.resumes });
  });

  it("blocks creation at the limit with a user-facing message", async () => {
    const result = await checkPlanLimit(fakeSupabase(PLAN_LIMITS.starter.applications), fakeUser(), "applications");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Starter");
      expect(result.message).toContain(String(PLAN_LIMITS.starter.applications));
    }
  });

  it("uses the higher limit for pro accounts", async () => {
    const result = await checkPlanLimit(fakeSupabase(PLAN_LIMITS.starter.resumes), fakeUser("pro"), "resumes");
    expect(result.ok).toBe(true);
  });

  it("treats a missing table as zero usage", async () => {
    const result = await checkPlanLimit(
      fakeSupabase(0, { code: "42P01", message: 'relation "resumes" does not exist' }),
      fakeUser(),
      "resumes"
    );
    expect(result).toMatchObject({ ok: true, used: 0 });
  });

  it("scopes cover letters to the current month", async () => {
    const supabase = fakeSupabase(0);
    await checkPlanLimit(supabase, fakeUser(), "coverLettersPerMonth");
    const chain = (supabase.from as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(chain.gte).toHaveBeenCalledWith("created_at", expect.stringMatching(/^\d{4}-\d{2}-01T00:00:00/));
  });
});
