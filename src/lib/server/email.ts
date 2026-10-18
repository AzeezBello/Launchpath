import { logger } from "@/lib/logger";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailResult = { ok: true; id?: string } | { ok: false; skipped: boolean; error?: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Sends one transactional email through Resend's REST API (no SDK needed).
 * When RESEND_API_KEY / EMAIL_FROM are missing the send is skipped, not failed,
 * so local development never throws.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    logger.warn?.("Email skipped: RESEND_API_KEY or EMAIL_FROM not configured", { to: message.to });
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error("Email send failed", { status: res.status, body });
      return { ok: false, skipped: false, error: `Resend responded ${res.status}` };
    }

    const payload = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: payload.id };
  } catch (error) {
    logger.error("Email send threw", error);
    return { ok: false, skipped: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
