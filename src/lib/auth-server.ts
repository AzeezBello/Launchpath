import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * -------------------------------
 * ✅ SERVER-SIDE AUTH UTILITIES (Async)
 * -------------------------------
 */

type AuthUser = Record<string, unknown>;

/** Get user cookie (server-side only) */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies(); // ✅ must await
    const userCookie = cookieStore.get("authUser")?.value;
    if (!userCookie) return null;
    return JSON.parse(decodeURIComponent(userCookie)) as AuthUser;
  } catch (err) {
    console.error("getServerUser error:", err);
    return null;
  }
}

/** Protect server-side routes (for SSR or layouts) */
export async function requireAuth() {
  const user = await getServerUser(); // ✅ must await
  if (!user) redirect("/login");
  return user;
}
