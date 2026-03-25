import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const BENEFITS = [
  "Track jobs, scholarships, grants, and admissions together.",
  "Generate resumes and cover letters without losing context.",
  "Keep deadlines, drafts, and next actions visible in one dashboard.",
];

const STATS = [
  { label: "Opportunity types", value: "6" },
  { label: "Hours saved monthly", value: "12+" },
  { label: "One shared workspace", value: "1" },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_24%)]" />

      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="hidden flex-col justify-between py-6 lg:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(45,212,191,0.9),rgba(14,165,233,0.85))] text-sm font-bold text-slate-950 shadow-[0_14px_36px_-18px_rgba(20,184,166,0.8)]">
                LP
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">LaunchPath</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Opportunity workspace
                </p>
              </div>
            </Link>

            <div className="mt-14 space-y-5">
              <Badge variant="outline" className="w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Cleaner application workflow
              </Badge>
              <h1 className="text-balance max-w-xl text-5xl font-semibold leading-tight">
                One calmer workspace for every application path.
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                LaunchPath helps you discover opportunities, write stronger materials,
                and keep deadlines visible without juggling a dozen tabs.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-border/80 bg-card/80 p-4"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.75rem] border border-border/80 bg-card/82 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Why teams keep it open
              </p>
              <div className="mt-4 space-y-4">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="surface-panel w-full max-w-md p-7 sm:p-9">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(45,212,191,0.9),rgba(14,165,233,0.85))] text-sm font-bold text-slate-950">
                LP
              </span>
              <span className="text-sm font-semibold">LaunchPath</span>
            </Link>

            <Badge variant="outline" className="w-fit">
              {eyebrow}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
