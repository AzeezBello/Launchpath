import { apiError, apiSuccess, applyRateLimit } from "@/lib/server/api";
import { createNeonServerClient } from "@/lib/server/neon-db";

export async function GET(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:mfa:get",
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const db = createNeonServerClient();
  const [{ data: factors, error: factorsErr }, { data: aal, error: aalErr }] = await Promise.all([
    db.auth.mfa.listFactors(),
    db.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (factorsErr || aalErr) {
    return apiError("Unauthorized", { status: 401, headers: rateLimit.headers });
  }

  return apiSuccess(
    {
      totp: factors?.totp || [],
      aal: aal || { currentLevel: "aal1", nextLevel: "aal1" },
    },
    { status: 200, headers: rateLimit.headers }
  );
}

export async function POST(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:mfa:post",
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const db = createNeonServerClient();
  const body = (await req.json().catch(() => ({}))) as {
    action?: "enroll" | "verify";
    factorType?: string;
    friendlyName?: string;
    factorId?: string;
    code?: string;
  };

  if (body.action === "enroll") {
    const { data, error } = await db.auth.mfa.enroll({
      factorType: body.factorType || "totp",
      friendlyName: body.friendlyName || "Authenticator app",
    });
    if (error || !data) {
      return apiError(error?.message || "Failed to enroll MFA", { status: 400, headers: rateLimit.headers });
    }
    return apiSuccess(data, { status: 200, headers: rateLimit.headers });
  }

  if (body.action === "verify") {
    if (!body.factorId || !body.code) {
      return apiError("factorId and code are required", { status: 422, headers: rateLimit.headers });
    }
    const { data, error } = await db.auth.mfa.challengeAndVerify({
      factorId: body.factorId,
      code: body.code,
    });
    if (error) {
      return apiError(error.message, { status: 400, headers: rateLimit.headers });
    }
    return apiSuccess(data, { status: 200, headers: rateLimit.headers });
  }

  return apiError("Invalid MFA action", { status: 400, headers: rateLimit.headers });
}

export async function DELETE(req: Request) {
  const rateLimit = applyRateLimit({
    request: req,
    route: "auth:mfa:delete",
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.ok) return rateLimit.response;

  const { searchParams } = new URL(req.url);
  const factorId = searchParams.get("factorId") || "";
  if (!factorId) {
    return apiError("factorId is required", { status: 422, headers: rateLimit.headers });
  }

  const db = createNeonServerClient();
  const { data, error } = await db.auth.mfa.unenroll({ factorId });
  if (error) {
    return apiError(error.message, { status: 400, headers: rateLimit.headers });
  }
  return apiSuccess(data, { status: 200, headers: rateLimit.headers });
}
