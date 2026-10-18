import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Sparkles, Target, Workflow } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-8 md:space-y-28">
      <section className="surface-panel overflow-hidden p-8 sm:p-12 lg:p-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              About LaunchPath
            </Badge>
            <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              LaunchPath turns scattered applications into one calm operating system.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Built for students, researchers, and early-career professionals juggling
              scholarships, fellowships, admissions, resumes, and job applications at the
              same time. Fewer tabs, stronger context, and generous room to focus.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="mockup-frame overflow-hidden p-3">
            <div className="overflow-hidden rounded-[1.25rem] border border-slate-800/80 bg-slate-950">
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
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            title: "Clear priorities",
            body: "See what needs attention next instead of piecing together status from scattered spreadsheets and notes.",
            Icon: Target,
          },
          {
            title: "Unified workflows",
            body: "Keep opportunity discovery, AI application writing, and recommender tracking in the same calm workspace.",
            Icon: Workflow,
          },
          {
            title: "Serverless Neon foundation",
            body: "Backed by Neon Postgres, native TOTP multi-factor security, and resilient API fallbacks.",
            Icon: CheckCircle2,
          },
        ].map(({ title, body, Icon }) => (
          <Card key={title} className="hover-card p-2">
            <CardHeader>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <CardTitle className="pt-4 text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
