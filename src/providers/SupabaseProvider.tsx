"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SessionContextProvider,
  useSessionContext,
  useUser,
} from "@supabase/auth-helpers-react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

type Props = ThemeProviderProps & { children: React.ReactNode };

/**
 * Shares a single Supabase browser client + theme provider across the app.
 * This enables the `useUser` / `useSupabaseClient` hooks from
 * `@supabase/auth-helpers-react` and powers the ThemeToggle component.
 */
export function SupabaseProvider({ children, ...themeProps }: Props) {
  const [supabaseClient] = useState<SupabaseClient>(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <ThemeProvider {...themeProps}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        {children}
      </SessionContextProvider>
    </ThemeProvider>
  );
}

export function useSupabase() {
  const { supabaseClient, isLoading } = useSessionContext();
  const user = useUser();

  if (!supabaseClient) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }

  return {
    supabase: supabaseClient,
    user: user ?? null,
    loading: isLoading,
  };
}
