import crypto from "crypto";
import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { escapeHtml, isEmailConfigured, sendEmail } from "@/lib/server/email";
import { rawQuery } from "@/lib/server/neon-db";

export async function POST(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:forgot-password",
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  try {
    const body = (await req.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return apiError("Email is required", { status: 422, headers: rateLimit.headers });
    }

    const users = await rawQuery<{ id: string; email: string }>(
      `SELECT id, email FROM public.users WHERE lower(email) = $1 LIMIT 1`,
      [email]
    );

    if (users[0]) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await rawQuery(
        `INSERT INTO public.password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [users[0].id, tokenHash, expiresAt]
      );

      if (isEmailConfigured()) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
        await sendEmail({
          to: users[0].email,
          subject: "Reset your LaunchPath password",
          text: `Use this link to reset your LaunchPath password (valid for 1 hour): ${resetUrl}`,
          html: `<p>Click below to reset your LaunchPath password (valid for 1 hour):</p><p><a href="${escapeHtml(resetUrl)}">Reset Password</a></p>`,
        });
      }
    }

    return apiSuccess({ sent: true }, { status: 200, headers: rateLimit.headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process password reset";
    return apiError(message, { status: 500, headers: rateLimit.headers });
  }
}
