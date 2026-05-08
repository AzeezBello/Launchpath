"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { getSupabasePublicEnv } from "@/lib/supabase-env";

type Props = ThemeProviderProps & { children: React.ReactNode };

type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

/**
 * Supabase provider using modern @supabase/ssr
 */
export function SupabaseProvider({ children, ...themeProps }: Props) {
  const env = getSupabasePublicEnv();
  const [supabaseClient] = useState<SupabaseClient>(() => createBrowserClient(env.url, env.anonKey));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  return (
    <ThemeProvider {...themeProps}>
      <SupabaseContext.Provider value={{ supabase: supabaseClient, user, loading }}>
        {children}
      </SupabaseContext.Provider>
    </ThemeProvider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
}
