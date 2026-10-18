import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="surface-panel max-w-md space-y-4 p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            That link doesn&apos;t go anywhere. It may have moved, or the address has a typo.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
