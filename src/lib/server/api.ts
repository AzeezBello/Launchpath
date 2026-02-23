import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type JsonInit = number | ResponseInit;

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  limit: number;
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAfterSeconds: number;
};

type RateLimitGuardInput = {
  request: Request;
  route: string;
  limit: number;
  windowMs: number;
  userId?: string;
  keySuffix?: string;
};

type RateLimitGuardResult =
  | {
      ok: true;
      headers: Headers;
      result: RateLimitResult;
    }
  | {
      ok: false;
      response: NextResponse;
      result: RateLimitResult;
    };

const requestBuckets = new Map<string, number[]>();
let rateLimitChecks = 0;

function parseInit(init?: JsonInit) {
  if (typeof init === "number") {
    return { status: init, headers: undefined as HeadersInit | undefined };
  }

  return {
    status: init?.status ?? 200,
    headers: init?.headers,
  };
}

export function apiSuccess<T>(data: T, init?: JsonInit, meta?: Record<string, unknown>) {
  const parsed = parseInit(init);

  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status: parsed.status,
      headers: parsed.headers,
    }
  );
}

export function apiError(error: string, init?: JsonInit, details?: unknown) {
  const parsed = parseInit(init);

  return NextResponse.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    {
      status: parsed.status,
      headers: parsed.headers,
    }
  );
}

export function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

export function normalizeQuery(raw: string | null, maxLength = 120) {
  return (raw || "").trim().toLowerCase().slice(0, maxLength);
}

export async function requireApiUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null as User | null,
      errorResponse: apiError("Unauthorized", 401),
    };
  }

  return {
    supabase,
    user,
    errorResponse: null,
  };
}

function maybeSweepRateLimitBuckets(now: number) {
  rateLimitChecks += 1;

  // Periodically drop stale keys so the in-memory map does not grow forever.
  if (rateLimitChecks % 200 !== 0) return;

  for (const [key, stamps] of requestBuckets.entries()) {
    const recent = stamps.filter((stamp) => now - stamp < 24 * 60 * 60 * 1000);
    if (recent.length === 0) {
      requestBuckets.delete(key);
      continue;
    }
    requestBuckets.set(key, recent);
  }
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitInput): RateLimitResult {
  const now = Date.now();
  maybeSweepRateLimitBuckets(now);

  const recent = (requestBuckets.get(key) || []).filter((stamp) => now - stamp < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    requestBuckets.set(key, recent);
    return {
      limit,
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      resetAfterSeconds: retryAfterSeconds,
    };
  }

  const updated = [...recent, now];
  requestBuckets.set(key, updated);
  const oldest = updated[0] ?? now;
  const resetAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));

  return {
    limit,
    allowed: true,
    remaining: Math.max(0, limit - updated.length),
    retryAfterSeconds: 0,
    resetAfterSeconds,
  };
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  return "unknown";
}

function toRateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(result.resetAfterSeconds));
  headers.set("RateLimit-Limit", String(result.limit));
  headers.set("RateLimit-Remaining", String(result.remaining));
  headers.set("RateLimit-Reset", String(result.resetAfterSeconds));
  return headers;
}

export function mergeHeaders(...headerSets: Array<HeadersInit | undefined>) {
  const merged = new Headers();
  for (const headers of headerSets) {
    if (!headers) continue;
    const current = new Headers(headers);
    current.forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
}

export function applyRateLimit({
  request,
  route,
  limit,
  windowMs,
  userId,
  keySuffix,
}: RateLimitGuardInput): RateLimitGuardResult {
  const actor = userId ? `user:${userId}` : `ip:${getClientIp(request)}`;
  const key = ["ratelimit", route, actor, keySuffix || ""].filter(Boolean).join(":");
  const result = checkRateLimit({ key, limit, windowMs });
  const headers = toRateLimitHeaders(result);

  if (!result.allowed) {
    headers.set("Retry-After", String(result.retryAfterSeconds));
    return {
      ok: false,
      result,
      response: apiError(
        "Rate limit exceeded. Try again later.",
        { status: 429, headers },
        {
          route,
          limit: result.limit,
          retryAfterSeconds: result.retryAfterSeconds,
        }
      ),
    };
  }

  return {
    ok: true,
    headers,
    result,
  };
}
