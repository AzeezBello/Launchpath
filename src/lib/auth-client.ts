"use client";

/**
 * -------------------------------
 * ✅ CLIENT-SIDE AUTH UTILITIES
 * -------------------------------
 */

type AuthUser = Record<string, unknown>;

/** Save user data to cookie + localStorage */
export function setAuth(user: AuthUser) {
  if (!user) return;
  const serialized = encodeURIComponent(JSON.stringify(user));

  // Set cookie (client-side)
  document.cookie = `authUser=${serialized}; path=/; max-age=86400; SameSite=Lax`;

  // Also persist in localStorage for client UI
  localStorage.setItem("authUser", JSON.stringify(user));
}

/** Remove user data (logout) */
export function clearAuth() {
  document.cookie =
  "authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
  localStorage.removeItem("authUser");
}

/** Get user data from localStorage (client only) */
export function getClientUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("authUser");
  return data ? (JSON.parse(data) as AuthUser) : null;
}
