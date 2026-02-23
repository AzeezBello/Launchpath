import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:logout",
    limit: 60,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return apiError(error.message, { status: 400, headers: rateLimit.headers });
    }

    return apiSuccess({ message: "Signed out successfully" }, { status: 200, headers: rateLimit.headers });
  } catch (err: unknown) {
    console.error("Logout error:", err);
    return apiError("Server error", { status: 500, headers: rateLimit.headers });
  }
}
