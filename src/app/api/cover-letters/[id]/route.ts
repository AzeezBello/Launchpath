import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { COVER_LETTER_SELECT_COLUMNS, type CoverLetterRow, sanitizeCoverLetter } from "@/lib/server/cover-letters";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "cover-letters:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letters:patch",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const update = sanitizeCoverLetter(payload, true);
  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }
  if ("content" in update && !update.content) {
    return apiError("Letter content cannot be empty", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(COVER_LETTER_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError("Failed to update cover letter", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Cover letter not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as CoverLetterRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "cover-letters:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letters:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("cover_letters")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError("Failed to delete cover letter", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!count) {
    return apiError("Cover letter not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
