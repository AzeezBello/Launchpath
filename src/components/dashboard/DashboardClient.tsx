"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useSupabase } from "@/providers/SupabaseProvider";

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirectTarget = pathname && pathname !== "/dashboard" ? `?redirectedFrom=${pathname}` : "";
      router.replace(`/login${redirectTarget}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="surface-panel flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
        <div>
          <p className="font-medium">Loading your workspace</p>
          <p className="text-sm text-muted-foreground">
            We are checking your session and preparing the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
