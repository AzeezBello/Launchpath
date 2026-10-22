import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  title: "LaunchPath | Scholarships, Jobs, Grants & Admissions in one workspace",
  description:
    "LaunchPath is the opportunity OS for students and early professionals—track scholarships, grants, admissions, jobs, resumes, and AI cover letters in one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
        <SupabaseProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
        </SupabaseProvider>
      </body>
    </html>
  );
}
