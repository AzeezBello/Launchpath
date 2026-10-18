import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { ESSAY_SELECT_COLUMNS, type EssayRow } from "@/lib/server/essays";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/essays/:id/duplicate → a fresh "Copy of" essay so a strong
// answer can be adapted for a similar prompt without touching the original.
export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;

  const preAuth = applyPreAuthRateLimit(req, "essays:duplicate");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "essays:duplicate",
    userId: user.id,
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data: source, error: loadError } = await supabase
    .from("essays")
    .select(ESSAY_SELECT_COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<EssayRow>();

  if (loadError) {
    return apiError("Failed to load essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, loadError.message);
  }
  if (!source) {
    return apiError("Essay not found", { status: 404, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data: row, error } = await supabase
    .from("essays")
    .insert({
      user_id: user.id,
      title: `Copy of ${source.title}`.slice(0, 200),
      prompt: source.prompt,
      content: source.content,
      word_limit: source.word_limit,
      status: "Drafting",
      application_id: null,
    })
    .select(ESSAY_SELECT_COLUMNS)
    .single();

  if (error) {
    return apiError("Failed to duplicate essay", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  return apiSuccess(row as EssayRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
