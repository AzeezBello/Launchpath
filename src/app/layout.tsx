import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export const metadata = {
  title: "LaunchPath | Scholarships, Jobs, Grants & Admissions in one workspace",
  description:
    "LaunchPath is the opportunity OS for students and early professionals—track scholarships, grants, admissions, jobs, resumes, and AI cover letters in one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white antialiased overflow-x-hidden">
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
