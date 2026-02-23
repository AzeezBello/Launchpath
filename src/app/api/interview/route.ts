import { apiError, apiSuccess, applyRateLimit, clampInt, mergeHeaders, requireApiUser } from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";

type InterviewStatus = "Scheduled" | "Completed" | "Pending";

type InterviewRow = {
  id: string;
  user_id: string;
  candidate: string;
  position: string;
  date: string;
  status: InterviewStatus;
};

const ALLOWED_STATUS = new Set<InterviewStatus>(["Scheduled", "Completed", "Pending"]);

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function sanitizeStatus(value: unknown): InterviewStatus {
  if (typeof value !== "string") return "Pending";
  const status = value.trim() as InterviewStatus;
  return ALLOWED_STATUS.has(status) ? status : "Pending";
}

function sanitizeDate(value: unknown) {
  if (typeof value !== "string") return new Date().toISOString().slice(0, 10);
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : new Date().toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), 1, 1, 1000);
  const limit = clampInt(searchParams.get("limit"), 10, 1, 50);
  const rawStatus = searchParams.get("status");
  const statusFilter = rawStatus ? sanitizeStatus(rawStatus) : null;

  if (rawStatus && !ALLOWED_STATUS.has(rawStatus as InterviewStatus)) {
    return apiError("Invalid status filter", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("interviews")
    .select("id, user_id, candidate, position, date, status", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess(
        [],
        { status: 200, headers: mergeHeaders(rateLimit.headers) },
        { page, totalPages: 1, total: 0, source: "empty-fallback" }
      );
    }
    return apiError(
      "Failed to load interviews",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const rows = (data || []) as InterviewRow[];
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return apiSuccess(
    rows,
    { status: 200, headers: mergeHeaders(rateLimit.headers) },
    {
      page,
      totalPages,
      total,
    }
  );
}

export async function POST(req: Request) {
  const { supabase, user, errorResponse } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const rateLimit = applyRateLimit({
    request: req,
    route: "interview:post",
    userId: user.id,
    limit: 40,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return apiError("Invalid JSON body", { status: 400, headers: mergeHeaders(rateLimit.headers) });
  }

  const body = payload as Record<string, unknown>;
  const candidate = sanitizeText(body.candidate, 120);
  const position = sanitizeText(body.position, 120);
  const date = sanitizeDate(body.date);
  const status = sanitizeStatus(body.status);

  if (!candidate || !position) {
    return apiError("Candidate and position are required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      candidate,
      position,
      date,
      status,
    })
    .select("id, user_id, candidate, position, date, status")
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError(
        "Interviews table is missing. Create table `interviews` to enable persistence.",
        { status: 501, headers: mergeHeaders(rateLimit.headers) }
      );
    }
    return apiError(
      "Failed to create interview",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(data as InterviewRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
