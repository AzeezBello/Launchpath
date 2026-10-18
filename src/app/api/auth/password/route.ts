import crypto from "crypto";
import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { createNeonServerClient, hashPassword, rawQuery, rowToUser, writeSessionCookie } from "@/lib/server/neon-db";

export async function POST(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:password",
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  try {
    const body = (await req.json()) as { password?: string; token?: string };
    const password = typeof body.password === "string" ? body.password : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (password.length < 8) {
      return apiError("Password must be at least 8 characters", { status: 422, headers: rateLimit.headers });
    }

    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const rows = await rawQuery<{ id: string; user_id: string }>(
        `SELECT id, user_id FROM public.password_reset_tokens
         WHERE token_hash = $1 AND expires_at > now()
         LIMIT 1`,
        [tokenHash]
      );
      if (!rows[0]) {
        return apiError("Invalid or expired reset link", { status: 400, headers: rateLimit.headers });
      }

      const passwordHash = hashPassword(password);
      await rawQuery(`UPDATE public.users SET password_hash = $1, updated_at = now() WHERE id = $2`, [
        passwordHash,
        rows[0].user_id,
      ]);
      await rawQuery(`DELETE FROM public.password_reset_tokens WHERE user_id = $1`, [rows[0].user_id]);

      const userRows = await rawQuery<{
        id: string;
        email: string;
        password_hash: string;
        role: "user" | "admin" | "superadmin";
        user_metadata: Record<string, unknown> | null;
        app_metadata: Record<string, unknown> | null;
        created_at: string;
      }>(`SELECT * FROM public.users WHERE id = $1 LIMIT 1`, [rows[0].user_id]);

      if (userRows[0]) {
        const user = rowToUser(userRows[0]);
        await writeSessionCookie(user);
      }

      return apiSuccess({ updated: true }, { status: 200, headers: rateLimit.headers });
    }

    const db = createNeonServerClient();
    const { data, error } = await db.auth.updateUser({ password });
    if (error) {
      return apiError(error.message, { status: 400, headers: rateLimit.headers });
    }

    return apiSuccess({ user: data.user }, { status: 200, headers: rateLimit.headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update password";
    return apiError(message, { status: 500, headers: rateLimit.headers });
  }
}
