import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:login",
    limit: 25,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  try {
    const payload = (await req.json()) as Record<string, unknown>;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return apiError("Email and password are required", { status: 422, headers: rateLimit.headers });
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return apiError(error.message, { status: 400, headers: rateLimit.headers });
    }

    return apiSuccess(
      {
        user: data.user,
      },
      { status: 200, headers: rateLimit.headers }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, { status: 500, headers: rateLimit.headers });
  }
}
