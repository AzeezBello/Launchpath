import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, Sparkles, Target, Workflow } from "lucide-react";

const PILLARS = [
  {
    code: "01 // PRIORITIES",
    title: "Clear priorities over tab sprawl",
    body: "See what needs attention next instead of piecing together status from scattered spreadsheets, bookmarks, and sticky notes.",
    Icon: Target,
  },
  {
    code: "02 // UNIFIED",
    title: "Unified career & academic workflows",
    body: "Keep opportunity discovery, AI application writing, and recommender tracking in the same calm operating system.",
    Icon: Workflow,
  },
  {
    code: "03 // RESILIENT",
    title: "Serverless Neon foundation",
    body: "Backed by Neon Postgres, native TOTP multi-factor security, and deterministic API fallbacks that never block your work.",
    Icon: CheckCircle2,
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-8 md:space-y-24">
      <Card className="overflow-hidden p-7 sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-5">
            <Badge variant="outline">
              <Sparkles className="size-3.5 text-primary" />
              About LaunchPath
            </Badge>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              LaunchPath turns scattered applications into one calm operating system.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Built for students, researchers, and early-career professionals juggling
              scholarships, fellowships, admissions, resumes, and job applications at the
              same time. Fewer tabs, stronger context, and generous room to focus.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="mockup-frame overflow-hidden p-2.5">
            <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
              <Image
                src="/images/ai-resume-studio.svg"
                alt="LaunchPath AI Studio preview"
                width={640}
                height={440}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="space-y-3">
          <Badge variant="secondary" className="font-mono">
            DESIGN PRINCIPLES
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Engineered for high-stakes applications without the cognitive overload.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every surface in LaunchPath is designed around calm momentum—combining
            structured data telemetry with distraction-free writing studios.
          </p>
        </div>

        <Card className="divide-y divide-border/75 py-0 overflow-hidden">
          {PILLARS.map(({ code, title, body, Icon }) => (
            <div key={code} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {code}
                </p>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <Separator />
    </div>
  );
}
