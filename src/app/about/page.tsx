import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Target, Workflow } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel p-6 sm:p-8">
        <Badge variant="outline" className="w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          About LaunchPath
        </Badge>
        <h1 className="mt-4 text-balance text-4xl font-semibold sm:text-5xl">
          LaunchPath turns scattered applications into one clear operating system.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          The product is built for students and early professionals who are juggling
          scholarships, grants, admissions, resumes, jobs, and interview prep at the
          same time. The goal is simple: fewer tabs, better context, and a cleaner
          path to action.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Clear priorities",
            body: "See what needs attention next instead of piecing together status from scattered tools.",
            Icon: Target,
          },
          {
            title: "Unified workflows",
            body: "Keep opportunity discovery, application writing, and progress tracking in the same place.",
            Icon: Workflow,
          },
          {
            title: "Reliable foundations",
            body: "Auth, API fallbacks, theming, and dashboard structure are built for real product work.",
            Icon: CheckCircle2,
          },
        ].map(({ title, body, Icon }) => (
          <Card key={title}>
            <CardHeader>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <CardTitle className="pt-3">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
