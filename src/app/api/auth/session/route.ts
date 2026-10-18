import { apiSuccess } from "@/lib/server/api";
import { createNeonServerClient } from "@/lib/server/neon-db";

export async function GET() {
  const db = createNeonServerClient();
  const [{ data: userData }, { data: sessionData }, { data: aalData }] = await Promise.all([
    db.auth.getUser(),
    db.auth.getSession(),
    db.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  const user = userData.user;
  return apiSuccess({
    user,
    session: user ? sessionData.session : null,
    aal: aalData || { currentLevel: "aal1", nextLevel: "aal1" },
  });
}
