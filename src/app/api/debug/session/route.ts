import { apiSuccess, applyRateLimit, mergeHeaders, requireApiUser } from "@/lib/server/api";

export async function GET(req: Request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "debug:session:get",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  return apiSuccess(
    {
      id: user.id,
      email: user.email || null,
      created_at: user.created_at,
    },
    { status: 200, headers: mergeHeaders(rateLimit.headers) }
  );
}
