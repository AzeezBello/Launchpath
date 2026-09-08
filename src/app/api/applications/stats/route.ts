import {
  apiError,
  apiSuccess,
  applyPreAuthRateLimit,
  applyRateLimit,
  mergeHeaders,
  requireApiUser,
} from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/server/applications";

type Row = {
  status: ApplicationStatus;
  opportunity_type: string | null;
  date: string;
};

const WEEKS = 8;

function startOfWeekUtc(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // Monday-based weeks
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

// GET /api/applications/stats → pipeline funnel, status breakdown, weekly volume.
export async function GET(req: Request) {
  const preAuth = applyPreAuthRateLimit(req, "applications:stats");
  if (!preAuth.ok) return preAuth.response;

  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "applications:stats",
    userId: user.id,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { data, error } = await supabase
    .from("applications")
    .select("status, opportunity_type, date")
    .eq("user_id", user.id)
    .limit(2000);

  const rows = (error && isLikelyMissingTable(error) ? [] : (data || [])) as Row[];
  if (error && !isLikelyMissingTable(error)) {
    return apiError("Failed to load stats", { status: 500, headers: mergeHeaders(rateLimit.headers) }, error.message);
  }

  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  const byType: Record<string, number> = {};
  for (const row of rows) {
    if (row.status in byStatus) byStatus[row.status] += 1;
    const type = row.opportunity_type || "manual";
    byType[type] = (byType[type] || 0) + 1;
  }

  const total = rows.length;
  const submitted = total - byStatus.Draft;
  const interviewing = byStatus.Interviewing + byStatus.Offer + byStatus.Accepted;
  const offers = byStatus.Offer + byStatus.Accepted;
  const accepted = byStatus.Accepted;
  const responded = interviewing + byStatus.Rejected;

  const funnel = [
    { stage: "Tracked", count: total },
    { stage: "Submitted", count: submitted },
    { stage: "Interviewing", count: interviewing },
    { stage: "Offers", count: offers },
    { stage: "Accepted", count: accepted },
  ];

  // Weekly volume by application date for the last WEEKS weeks, oldest first.
  const thisWeek = startOfWeekUtc(new Date());
  const weekly = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(thisWeek);
    start.setUTCDate(start.getUTCDate() - (WEEKS - 1 - i) * 7);
    return { weekStart: start.toISOString().slice(0, 10), count: 0 };
  });
  const firstWeek = new Date(weekly[0].weekStart);
  for (const row of rows) {
    const d = new Date(row.date);
    if (Number.isNaN(d.getTime()) || d < firstWeek) continue;
    const idx = Math.floor((startOfWeekUtc(d).getTime() - firstWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (idx >= 0 && idx < WEEKS) weekly[idx].count += 1;
  }

  const rate = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : null);

  return apiSuccess(
    {
      total,
      funnel,
      byStatus,
      byType,
      weekly,
      rates: {
        response: rate(responded, submitted),
        interview: rate(interviewing, submitted),
        offer: rate(offers, submitted),
      },
    },
    { status: 200, headers: mergeHeaders(rateLimit.headers) }
  );
}
