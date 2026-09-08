"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="surface-panel max-w-md space-y-4 p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page hit an unexpected error. You can retry, or head back to the dashboard.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
