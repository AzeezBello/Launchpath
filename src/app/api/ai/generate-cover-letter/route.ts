import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { generateCoverLetter, sanitizeCoverLetterPrompt } from "@/lib/server/cover-letter";

const HOURLY_LIMIT = 20;

export async function POST(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "cover-letter:generate");
  if (!preAuth.ok) return preAuth.response;

  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "cover-letter:generate",
    userId: user.id,
    limit: HOURLY_LIMIT,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const sanitized = sanitizeCoverLetterPrompt(payload);
  if (!sanitized) {
    return apiError("Company and position are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  try {
    const result = await generateCoverLetter(sanitized);
    return apiSuccess(result, { status: 200, headers: mergeHeaders(rateLimit.headers) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate cover letter";
    return apiError(message, { status: 500, headers: mergeHeaders(rateLimit.headers) });
  }
}
