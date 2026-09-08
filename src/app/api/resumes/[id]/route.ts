import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { RESUME_SELECT_COLUMNS, type ResumeRow, deriveResumeTitle, sanitizeResumeData } from "@/lib/server/resumes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "resumes:get-one");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:get-one",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return apiError("Failed to load resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Resume not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as ResumeRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "resumes:patch");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:patch",
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

  const body = (payload || {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if ("data" in body) {
    const data = sanitizeResumeData(body.data);
    if (!data.personalInfo?.name || !data.personalInfo?.email) {
      return apiError("Name and email are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
    }
    update.data = data;
    if (!("title" in body)) update.title = deriveResumeTitle(data);
  }
  if ("title" in body) {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    if (!title) {
      return apiError("Title cannot be empty", { status: 422, headers: mergeHeaders(rateLimit.headers) });
    }
    update.title = title;
  }

  if (Object.keys(update).length === 0) {
    return apiError("No valid fields to update", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("resumes")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(RESUME_SELECT_COLUMNS)
    .maybeSingle();

  if (error) {
    return apiError("Failed to update resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!data) {
    return apiError("Resume not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(data as ResumeRow, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "resumes:delete");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "resumes:delete",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { error, count } = await supabase
    .from("resumes")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return apiError("Failed to delete resume", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }
  if (!count) {
    return apiError("Resume not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  return apiSuccess(null, { status: 200, headers: mergeHeaders(rateLimit.headers) });
}
