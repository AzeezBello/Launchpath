import { apiSuccess } from "@/lib/server/api";
import { createNeonServerClient, readCurrentSessionPayload } from "@/lib/server/neon-db";

export async function GET() {
  const payload = await readCurrentSessionPayload();
  if (!payload) {
    return apiSuccess(
      {
        user: null,
        session: null,
        aal: { currentLevel: null, nextLevel: null },
      },
      { headers: { "Cache-Control": "private, no-cache" } }
    );
  }

  const db = createNeonServerClient();
  const { data: userData } = await db.auth.getUser();
  const user = userData.user;
  const currentLevel = payload.aal || "aal1";
  const nextLevel = payload.nextAal || "aal1";

  return apiSuccess(
    {
      user,
      session: user
        ? {
            user,
            aal: currentLevel,
            nextAal: nextLevel,
            expires_at: payload.exp,
          }
        : null,
      aal: { currentLevel, nextLevel },
    },
    { headers: { "Cache-Control": "private, no-cache" } }
  );
}
