import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/75 bg-card/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm space-y-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-xs font-bold text-slate-950">
                LP
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">
                LaunchPath
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                v1.0
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The calm operating system for scholarships, research grants, jobs,
              admissions, resumes, and AI-assisted application workflows.
            </p>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Platform
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/#product" className="hover:text-foreground">
                  Product Studios
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-foreground">
                  Workflow Architecture
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-foreground">
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  Live Workspace
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Company
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About LaunchPath
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact &amp; Partnerships
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} LaunchPath. Engineered for calmer, high-velocity application pipelines.
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/80">
            Neon Serverless Postgres · TOTP MFA · AI Studio
          </p>
        </div>
      </div>
    </footer>
  );
}
