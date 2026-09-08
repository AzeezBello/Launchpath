import { apiError, apiSuccess } from "@/lib/server/api";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { escapeHtml, isEmailConfigured, sendEmail } from "@/lib/server/email";
import { APPLICATION_OPEN_STATUSES } from "@/lib/server/applications";
import { logger } from "@/lib/logger";

// Runs once a day (see vercel.json). Sends one email per user listing every
// open application whose deadline is exactly REMIND_AT_DAYS away, so each
// deadline triggers at most one email per milestone without a sent-log table.
const REMIND_AT_DAYS = [7, 3, 1, 0];
const MAX_USERS_PER_RUN = 500;

type ApplicationRow = {
  user_id: string;
  program: string;
  status: string;
  deadline: string;
  url: string | null;
};

type SettingsRow = {
  user_id: string;
  data: { notifications?: { deadlineReminders?: boolean } } | null;
};

function isoDateOffset(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayLabel(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return apiError("Unauthorized", 401);
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return apiError("SUPABASE_SERVICE_ROLE_KEY is not configured", 501);
  }

  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const targetDates = new Map(REMIND_AT_DAYS.map((days) => [isoDateOffset(days), days]));

  const { data, error } = await admin
    .from("applications")
    .select("user_id, program, status, deadline, url")
    .in("status", APPLICATION_OPEN_STATUSES)
    .in("deadline", Array.from(targetDates.keys()))
    .order("deadline", { ascending: true });

  if (error) {
    logger.error("Deadline reminder query failed", error);
    return apiError("Failed to load applications", 500, error.message);
  }

  const rows = (data || []) as ApplicationRow[];
  if (rows.length === 0) {
    return apiSuccess({ users: 0, applications: 0, sent: 0, skipped: 0 });
  }

  // Group by user, then drop anyone who opted out.
  const byUser = new Map<string, ApplicationRow[]>();
  for (const row of rows) {
    const list = byUser.get(row.user_id) || [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  const userIds = Array.from(byUser.keys()).slice(0, MAX_USERS_PER_RUN);

  const { data: settingsRows } = await admin
    .from("user_settings")
    .select("user_id, data")
    .in("user_id", userIds);

  const optedOut = new Set(
    ((settingsRows || []) as SettingsRow[])
      .filter((row) => row.data?.notifications?.deadlineReminders === false)
      .map((row) => row.user_id)
  );

  let sent = 0;
  let skipped = 0;
  const emailReady = isEmailConfigured();

  for (const userId of userIds) {
    if (optedOut.has(userId)) {
      skipped += 1;
      continue;
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (userError || !email) {
      skipped += 1;
      continue;
    }

    const items = byUser.get(userId) || [];
    const lines = items.map((item) => {
      const days = targetDates.get(item.deadline) ?? 0;
      return { ...item, days, label: dayLabel(days) };
    });

    const soonest = Math.min(...lines.map((l) => l.days));
    const subject =
      lines.length === 1
        ? `Reminder: ${lines[0].program} is due ${lines[0].label}`
        : `${lines.length} applications due soon (nearest ${dayLabel(soonest)})`;

    const text = [
      "Here is what is coming up in your LaunchPath pipeline:",
      "",
      ...lines.map((l) => `- ${l.program} (${l.status}) — due ${l.label}${l.url ? `: ${l.url}` : ""}`),
      "",
      appUrl ? `Open your applications: ${appUrl}/dashboard/applications` : "",
      "",
      "You can turn these reminders off in Settings → Notifications.",
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #101828; max-width: 560px;">
        <h2 style="margin: 0 0 12px;">Deadlines coming up</h2>
        <p style="margin: 0 0 16px; color: #667085;">Here is what is due soon in your LaunchPath pipeline.</p>
        <ul style="padding-left: 18px; margin: 0 0 20px;">
          ${lines
            .map(
              (l) => `<li style="margin-bottom: 8px;">
                <strong>${escapeHtml(l.program)}</strong>
                <span style="color:#667085;">(${escapeHtml(l.status)})</span>
                — due <strong>${escapeHtml(l.label)}</strong>
                ${l.url ? ` · <a href="${escapeHtml(l.url)}">Open link</a>` : ""}
              </li>`
            )
            .join("")}
        </ul>
        ${
          appUrl
            ? `<p><a href="${escapeHtml(appUrl)}/dashboard/applications" style="display:inline-block;background:#3B82F6;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;">Open applications</a></p>`
            : ""
        }
        <p style="font-size: 12px; color: #667085; margin-top: 24px;">
          Turn these reminders off any time in Settings → Notifications.
        </p>
      </div>`;

    if (!emailReady) {
      skipped += 1;
      continue;
    }

    const result = await sendEmail({ to: email, subject, html, text });
    if (result.ok) sent += 1;
    else skipped += 1;
  }

  return apiSuccess({
    users: userIds.length,
    applications: rows.length,
    sent,
    skipped,
    emailConfigured: emailReady,
  });
}
