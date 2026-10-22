import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const BENEFITS = [
  "Track jobs, scholarships, grants, and admissions in one shared pipeline.",
  "Generate tailored resumes and cover letters with role-alignment scoring.",
  "Keep deadlines, recommenders, and next actions visible with Neon Cloud sync.",
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_85%_88%,rgba(16,185,129,0.08),transparent_28%)]" />

      <div className="mx-auto grid min-h-screen max-w-7xl gap-12 px-6 py-10 sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-14 lg:py-14">
        <div className="hidden flex-col justify-between gap-8 lg:flex">
          <div className="space-y-8">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-xs font-bold text-slate-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_16px_-4px_rgba(59,130,246,0.5)] scale-100 transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]">
                LP
              </span>
              <div>
                <p className="font-display text-base font-semibold tracking-tight leading-none">
                  LaunchPath
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground leading-none">
                  Opportunity OS
                </p>
              </div>
            </Link>

            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                <Sparkles className="size-3.5 text-primary" />
                Calm application operating system
              </Badge>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight xl:text-[2.75rem]">
                One spacious workspace for every application path.
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground xl:text-base">
                Discover opportunities, draft stronger materials, and stay ahead of
                deadlines without juggling scattered tabs.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="mockup-frame overflow-hidden p-2">
              <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
                <Image
                  src="/images/workspace-hero-mockup.svg"
                  alt="LaunchPath workspace preview"
                  width={960}
                  height={640}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            <Card className="py-5">
              <CardContent className="grid gap-3 px-5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {benefit}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md p-7 sm:p-9">
            <div>
              <Link href="/" className="mb-7 inline-flex items-center gap-2.5 lg:hidden">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3B82F6,#10B981)] font-display text-xs font-bold text-slate-950">
                  LP
                </span>
                <span className="font-display text-sm font-semibold">LaunchPath</span>
              </Link>

              <Badge variant="outline" className="w-fit">
                {eyebrow}
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>

              <div className="mt-7">{children}</div>

              {footer ? (
                <div className="mt-6 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:text-sm">
                  {footer}
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
