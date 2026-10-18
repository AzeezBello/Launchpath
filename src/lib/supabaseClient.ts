"use client";

import type { User } from "@/lib/auth-token";

export type { User };

export type BrowserSession = {
  user: User;
  aal: "aal1" | "aal2";
  nextAal: "aal1" | "aal2";
  expires_at?: number;
};

type AuthChangeListener = (event: string, session: BrowserSession | null) => void;

const listeners = new Set<AuthChangeListener>();

function notifyAuthListeners(event: string, session: BrowserSession | null) {
  for (const listener of listeners) {
    try {
      listener(event, session);
    } catch {
      // ignore listener errors
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class BrowserQueryChain<T = any> implements PromiseLike<{ data: T | null; error: { message: string } | null }> {
  private table: string;
  private filters: Record<string, string> = {};
  private limitNum: number | null = null;
  private singleMode: "many" | "single" | "maybeSingle" = "many";

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*") {
    void columns;
    return this;
  }

  eq(col: string, val: string) {
    this.filters[col] = val;
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    void col;
    void opts;
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  single<R = T>() {
    this.singleMode = "single";
    return this as unknown as BrowserQueryChain<R>;
  }

  maybeSingle<R = T>() {
    this.singleMode = "maybeSingle";
    return this as unknown as BrowserQueryChain<R>;
  }

  async execute(): Promise<{ data: T | null; error: { message: string } | null }> {
    try {
      let endpoint = "";
      if (this.table === "resumes") {
        endpoint = this.filters.id ? `/api/resumes/${encodeURIComponent(this.filters.id)}` : "/api/resumes";
      } else if (this.table === "cover_letters") {
        endpoint = this.filters.id
          ? `/api/cover-letters/${encodeURIComponent(this.filters.id)}`
          : "/api/cover-letters";
      } else if (this.table === "applications") {
        endpoint = this.filters.id
          ? `/api/applications/${encodeURIComponent(this.filters.id)}`
          : "/api/applications";
      } else {
        return { data: null, error: { message: `Unsupported client table: ${this.table}` } };
      }

      const res = await fetch(endpoint, { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        return { data: null, error: { message: payload?.error || "Request failed" } };
      }

      const raw = payload?.data ?? null;
      if (Array.isArray(raw)) {
        const sliced = this.limitNum !== null ? raw.slice(0, this.limitNum) : raw;
        if (this.singleMode === "single" || this.singleMode === "maybeSingle") {
          return { data: (sliced[0] ?? null) as unknown as T, error: null };
        }
        return { data: sliced as unknown as T, error: null };
      }

      return { data: raw as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : "Network error" },
      };
    }
  }

  then<TResult1 = { data: T | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export type MfaFactorItem = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: "verified" | "unverified";
  created_at: string;
};

export function createNeonBrowserClient() {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from<T = any>(table: string) {
      return new BrowserQueryChain<T>(table);
    },
    auth: {
      async getSession(): Promise<{ data: { session: BrowserSession | null }; error: null }> {
        try {
          const res = await fetch("/api/auth/session", { cache: "no-store" });
          const payload = await res.json().catch(() => null);
          const session = (payload?.data?.session as BrowserSession | null) ?? null;
          return { data: { session }, error: null };
        } catch {
          return { data: { session: null }, error: null };
        }
      },

      async getUser(): Promise<{ data: { user: User | null }; error: null }> {
        const { data } = await this.getSession();
        return { data: { user: data.session?.user ?? null }, error: null };
      },

      onAuthStateChange(callback: AuthChangeListener) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      },

      async signOut() {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          notifyAuthListeners("SIGNED_OUT", null);
          return { error: null };
        } catch (err) {
          return { error: { message: err instanceof Error ? err.message : "Logout failed" } };
        }
      },

      async updateUser({ password, token }: { password: string; token?: string }) {
        try {
          const res = await fetch("/api/auth/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, token }),
          });
          const payload = await res.json().catch(() => null);
          if (!res.ok || !payload?.success) {
            return { data: null, error: new Error(payload?.error || "Failed to update password") };
          }
          return { data: payload.data, error: null };
        } catch (err) {
          return { data: null, error: err instanceof Error ? err : new Error("Network error") };
        }
      },

      async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
        void options;
        try {
          const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const payload = await res.json().catch(() => null);
          if (!res.ok || !payload?.success) {
            return { data: null, error: new Error(payload?.error || "Failed to send reset link") };
          }
          return { data: payload.data, error: null };
        } catch (err) {
          return { data: null, error: err instanceof Error ? err : new Error("Network error") };
        }
      },

      async signInWithOAuth(options: { provider: string; options?: { redirectTo?: string } }) {
        void options;
        return {
          data: null,
          error: new Error("Please sign in with your email and password."),
        };
      },

      mfa: {
        async getAuthenticatorAssuranceLevel() {
          try {
            const res = await fetch("/api/auth/mfa", { cache: "no-store" });
            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.success) {
              return { data: null, error: new Error(payload?.error || "Unauthorized") };
            }
            return {
              data: payload.data.aal as { currentLevel: "aal1" | "aal2"; nextLevel: "aal1" | "aal2" },
              error: null,
            };
          } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error("Network error") };
          }
        },

        async listFactors(): Promise<{ data: { totp: MfaFactorItem[] }; error: Error | null }> {
          try {
            const res = await fetch("/api/auth/mfa", { cache: "no-store" });
            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.success) {
              return { data: { totp: [] }, error: new Error(payload?.error || "Failed to load factors") };
            }
            return { data: { totp: (payload.data.totp || []) as MfaFactorItem[] }, error: null };
          } catch (err) {
            return { data: { totp: [] }, error: err instanceof Error ? err : new Error("Network error") };
          }
        },

        async enroll({ factorType, friendlyName }: { factorType: string; friendlyName: string }) {
          try {
            const res = await fetch("/api/auth/mfa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "enroll", factorType, friendlyName }),
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.success) {
              return { data: null, error: new Error(payload?.error || "Failed to enroll") };
            }
            return { data: payload.data, error: null };
          } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error("Network error") };
          }
        },

        async challengeAndVerify({ factorId, code }: { factorId: string; code: string }) {
          try {
            const res = await fetch("/api/auth/mfa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "verify", factorId, code }),
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.success) {
              return { data: null, error: new Error(payload?.error || "Verification failed") };
            }
            return { data: payload.data, error: null };
          } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error("Network error") };
          }
        },

        async unenroll({ factorId }: { factorId: string }) {
          try {
            const res = await fetch(`/api/auth/mfa?factorId=${encodeURIComponent(factorId)}`, {
              method: "DELETE",
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.success) {
              return { data: null, error: new Error(payload?.error || "Failed to remove factor") };
            }
            return { data: payload.data, error: null };
          } catch (err) {
            return { data: null, error: err instanceof Error ? err : new Error("Network error") };
          }
        },
      },
    },
  };
}

export type NeonBrowserClient = ReturnType<typeof createNeonBrowserClient>;

let client: NeonBrowserClient | null = null;

export function getSupabaseBrowserClient(): NeonBrowserClient {
  if (!client) {
    client = createNeonBrowserClient();
  }
  return client;
}

export const supabase = getSupabaseBrowserClient();
export { notifyAuthListeners };
