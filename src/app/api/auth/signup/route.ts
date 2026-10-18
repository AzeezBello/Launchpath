import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit({
    request,
    route: "auth:signup",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim().slice(0, 120) : "";

    if (!email || password.length < 8) {
      return apiError("Valid email and password (min 8 characters) are required", {
        status: 422,
        headers: rateLimit.headers,
      });
    }

    const db = await createServerSupabaseClient();

    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return apiError(error.message, { status: 400, headers: rateLimit.headers });
    }

    if (data.user?.id) {
      await db.from("user_settings").upsert(
        {
          user_id: data.user.id,
          data: {
            profile: {
              fullName,
              headline: "",
              location: "",
              website: "",
              bio: "",
            },
          },
        },
        { onConflict: "user_id" }
      );
    }

    return apiSuccess(
      {
        user: data.user,
        session: data.session,
        message: "Account created successfully",
      },
      { status: 201, headers: rateLimit.headers }
    );
  } catch (err: unknown) {
    console.error("Signup error:", err);
    return apiError("Server error", { status: 500, headers: rateLimit.headers });
  }
}
