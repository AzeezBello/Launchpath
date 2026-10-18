import Image from "next/image";
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_85%_88%,rgba(16,185,129,0.1),transparent_28%)]" />

      <div className="mx-auto grid min-h-screen max-w-7xl gap-14 px-6 py-12 sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-14 lg:py-16">
        <div className="hidden flex-col justify-between gap-10 lg:flex">
          <div className="space-y-10">
            <Link href="/" className="inline-flex items-center gap-3.5">
              <span className="flex size-11 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.92),rgba(16,185,129,0.88))] text-sm font-bold text-slate-950 shadow-[0_14px_36px_-18px_rgba(59,130,246,0.8)]">
                LP
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">LaunchPath</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Opportunity workspace
                </p>
              </div>
            </Link>

            <div className="space-y-5">
              <Badge variant="outline" className="w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Calm application operating system
              </Badge>
              <h1 className="text-balance max-w-xl text-4xl font-semibold leading-[1.12] xl:text-5xl">
                One spacious workspace for every application path.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground xl:text-lg">
                Discover opportunities, draft stronger materials, and stay ahead of
                deadlines without juggling scattered tabs.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="mockup-frame overflow-hidden p-2.5">
              <div className="overflow-hidden rounded-[1.25rem] border border-slate-800/80 bg-slate-950">
                <Image
                  src="/images/workspace-hero-mockup.svg"
                  alt="LaunchPath workspace preview"
                  width={960}
                  height={640}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/80 bg-card/85 p-6">
              <div className="grid gap-3.5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="surface-panel w-full max-w-md p-8 sm:p-11">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.9),rgba(16,185,129,0.85))] text-sm font-bold text-slate-950">
                LP
              </span>
              <span className="text-sm font-semibold">LaunchPath</span>
            </Link>

            <Badge variant="outline" className="w-fit">
              {eyebrow}
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>

            <div className="mt-9">{children}</div>

            {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
