import { apiError, apiSuccess, applyRateLimit, clampInt, mergeHeaders, requireApiUser } from "@/lib/server/api";
import { isLikelyMissingTable } from "@/lib/server/settings";

type ApplicationStatus = "Pending Review" | "Accepted" | "Rejected" | "In Review";

type ApplicationRow = {
  id: string;
  user_id: string;
  program: string;
  status: ApplicationStatus;
  date: string;
};

const ALLOWED_STATUS = new Set<ApplicationStatus>([
  "Pending Review",
  "Accepted",
  "Rejected",
  "In Review",
]);

function sanitizeProgram(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 160);
}

function sanitizeStatus(value: unknown): ApplicationStatus {
  if (typeof value !== "string") return "Pending Review";
  const normalized = value.trim() as ApplicationStatus;
  return ALLOWED_STATUS.has(normalized) ? normalized : "Pending Review";
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
    route: "applications:get",
    userId: user.id,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const page = clampInt(searchParams.get("page"), 1, 1, 1000);
  const limit = clampInt(searchParams.get("limit"), 20, 1, 100);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("applications")
    .select("id, user_id, program, status, date", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(from, to);

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiSuccess(
        [],
        { status: 200, headers: mergeHeaders(rateLimit.headers) },
        { page, totalPages: 1, total: 0, source: "empty-fallback" }
      );
    }
    return apiError(
      "Failed to load applications",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  const rows = (data || []) as ApplicationRow[];
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
    route: "applications:post",
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
  const program = sanitizeProgram(body.program);
  const status = sanitizeStatus(body.status);
  const date = sanitizeDate(body.date);

  if (!program) {
    return apiError("Program is required", { status: 422, headers: mergeHeaders(rateLimit.headers) });
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      program,
      status,
      date,
    })
    .select("id, user_id, program, status, date")
    .single();

  if (error) {
    if (isLikelyMissingTable(error)) {
      return apiError(
        "Applications table is missing. Create table `applications` to enable cloud persistence.",
        { status: 501, headers: mergeHeaders(rateLimit.headers) }
      );
    }
    return apiError(
      "Failed to create application",
      { status: 500, headers: mergeHeaders(rateLimit.headers) },
      error.message
    );
  }

  return apiSuccess(data as ApplicationRow, { status: 201, headers: mergeHeaders(rateLimit.headers) });
}
