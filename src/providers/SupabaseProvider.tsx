"use client";

import { useState, createContext, useContext, useEffect, useCallback } from "react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import type { User } from "@/lib/auth-token";
import { createNeonBrowserClient, notifyAuthListeners, type NeonBrowserClient } from "@/lib/supabaseClient";

type Props = ThemeProviderProps & { children: React.ReactNode };

type AuthContextType = {
  supabase: NeonBrowserClient;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth & Workspace provider backed by Neon Postgres session API
 */
export function SupabaseProvider({ children, ...themeProps }: Props) {
  const [client] = useState<NeonBrowserClient>(() => createNeonBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const getSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await client.auth.getSession();
    setUser(session?.user ?? null);
    notifyAuthListeners("TOKEN_REFRESHED", session ?? null);
  }, [client]);

  return (
    <ThemeProvider {...themeProps}>
      <AuthContext.Provider value={{ supabase: client, user, loading, refreshSession }}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export function useSupabase() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
}
