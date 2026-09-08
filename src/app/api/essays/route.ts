import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  clampInt,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";
import {
  ESSAY_SELECT_COLUMNS,
  type EssayRow,
  sanitizeEssayApplicationRef,
  sanitizeEssayStatus,
  sanitizeEssayText,
  sanitizeEssayWordLimit,
} from "@/lib/server/essays";

export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "essays:get");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const limit = clampInt(searchParams.get("limit"), 100, 1, 200);
  const applicationId = sanitizeEssayApplicationRef(searchParams.get("applicationId"));

  let query = supabase
    .from("essays")
    .select(ESSAY_SELECT_COLUMNS)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (applicationId) query = query.eq("application_id", applicationId);

  const { data, error } = await query;

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess([], { status: 200, headers: mergeHeaders(rateLimit.headers) }, { source: "empty-fallback" });
    }
    return apiError("Failed to load essays", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess((data || []) as EssayRow[], { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "essays:post");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:post",
    userId: user.id,
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const body = (payload || {}) as Record<string, unknown>;
  const title = sanitizeEssayText(body.title, 200);
  if (!title) {
    return apiError("Title is required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("essays")
    .insert({
      user_id: user.id,
      title,
      prompt: sanitizeEssayText(body.prompt, 4000),
      content: sanitizeEssayText(body.content, 60000),
      word_limit: sanitizeEssayWordLimit(body.wordLimit),
      status: sanitizeEssayStatus(body.status),
      application_id: sanitizeEssayApplicationRef(body.applicationId),
    })
    .select(ESSAY_SELECT_COLUMNS)
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError("Essays table is missing. Run supabase/migrations/20260908_essays.sql.", {
        status: 501,
        headers: mergeHeaders(rateLimit.headers),
      });
    }
    return apiError("Failed to create essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(data as EssayRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
