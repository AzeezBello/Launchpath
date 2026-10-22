import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  FolderKanban,
  GraduationCap,
  HandCoins,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const stats = [
  {
    code: "IDX-01",
    label: "Active opportunities indexed",
    value: "1,200+",
    detail: "Curated scholarships, fellowships, research grants, admissions, and remote roles.",
  },
  {
    code: "VEL-02",
    label: "Time reclaimed per cycle",
    value: "12 hrs",
    detail: "Automated resume alignment scoring, citation-backed cover letters, and deadline radar.",
  },
  {
    code: "OPS-03",
    label: "Applicants & cohorts active",
    value: "3.4k",
    detail: "Students, researchers, and early-career operators running multi-track pipelines.",
  },
];

const featureTiles = [
  {
    tag: "Discovery Engine",
    title: "Discovery that stays organized",
    body: "Search scholarships, grants, jobs, and admissions without losing deadlines, notes, or eligibility criteria.",
    metric: "4 unified tracks",
    Icon: Search,
    featured: true,
  },
  {
    tag: "AI Writing Studio",
    title: "Application assets in one place",
    body: "Generate cover letters, tailor resumes, and keep every draft linked to the exact opportunity.",
    metric: "94% avg. ATS match",
    Icon: WandSparkles,
    featured: false,
  },
  {
    tag: "Pipeline Command",
    title: "A calmer command center",
    body: "See what is due, what is active, and what needs attention from one distraction-free Kanban and list workspace.",
    metric: "8 pipeline stages",
    Icon: FolderKanban,
    featured: false,
  },
  {
    tag: "Infrastructure",
    title: "Neon Postgres foundation",
    body: "Serverless Neon Postgres persistence, TOTP MFA security, and deterministic AI fallbacks built for reliability.",
    metric: "Zero-downtime sync",
    Icon: ShieldCheck,
    featured: true,
  },
];

const workflow = [
  {
    step: "01",
    title: "Index every path in one view",
    body: "Scholarships, grants, jobs, and admissions live in a unified pipeline instead of scattered spreadsheets and browser tabs.",
  },
  {
    step: "02",
    title: "Draft tailored materials faster",
    body: "Use AI citation engines and saved resume versions to craft high-converting essays and cover letters in minutes.",
  },
  {
    step: "03",
    title: "Stay ahead of every deadline",
    body: "Know what is due next, where recommenders stand, and which applications deserve your focus today.",
  },
];

const plans = [
  {
    name: "Starter",
    code: "TIER-01",
    price: "$0",
    detail: "For solo applicants getting organized with zero friction.",
    perks: [
      "Unlimited opportunity searches across all 4 tracks",
      "5 tailored resumes & 50 tracked applications",
      "20 AI cover letters per month",
      "Full essay editor & recommender tracker",
    ],
    href: "/signup",
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    code: "TIER-02",
    price: "$18",
    detail: "For ambitious applicants and cohorts managing high volume.",
    perks: [
      "100 tailored resumes & 1,000 tracked applications",
      "250 AI cover letters & resume tailoring runs / mo",
      "Automated 7/3/1-day deadline email reminders",
      "Priority workspace support & multi-device MFA",
    ],
    href: "/signup",
    cta: "Start Pro",
    featured: true,
  },
];

const faqs = [
  {
    id: "faq-1",
    question: "Does LaunchPath work without third-party AI or job APIs configured?",
    answer:
      "Yes. Opportunity feeds, resume scoring, and cover-letter generation include built-in deterministic fallbacks so your workspace remains fast and functional at all times.",
  },
  {
    id: "faq-2",
    question: "Can I use it for both academic funding and career applications?",
    answer:
      "That is the core architecture. Scholarships, research grants, graduate admissions, interviews, jobs, resumes, and recommenders all share the same calm workspace.",
  },
  {
    id: "faq-3",
    question: "How is my application data stored and secured?",
    answer:
      "All workspace records are persisted in serverless Neon Postgres with encrypted integration secrets, scrypt password hashing, and native TOTP multi-factor authentication.",
  },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-12 md:space-y-32">
      {/* Hero Section: asymmetric editorial framing + interactive studio preview */}
      <section className="relative pt-2 lg:pt-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border/85 bg-card/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-2xs backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            <span>Calm Opportunity Operating System</span>
            <span className="size-1 rounded-full bg-primary/60" />
            <span className="font-mono text-primary">Neon Cloud Live</span>
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(2.35rem,4.5vw+1rem,4.35rem)] font-semibold leading-[1.06] tracking-tight">
            Run scholarships, jobs, grants, and admissions with room to think.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            LaunchPath unifies opportunity discovery, AI-assisted writing, and deadline
            telemetry into one deliberate workspace—replacing tab chaos with clear momentum.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-11 px-7" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-7" asChild>
              <Link href="/dashboard">Explore live workspace</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              Serverless Neon Postgres
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              AI resume &amp; cover letter studio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" />
              Zero credit card required
            </span>
          </div>
        </div>

        {/* Interactive Hero Studio Stage with shadcn Tabs */}
        <div className="relative mx-auto mt-12 max-w-6xl lg:mt-14">
          <div className="pointer-events-none absolute -inset-x-6 -top-8 -bottom-8 -z-10 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_58%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.09),transparent_52%)] blur-2xl" />

          <Tabs defaultValue="command-center" className="w-full">
            <div className="mb-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-success" />
                <span className="font-mono uppercase tracking-[0.14em]">
                  Interactive Surface Preview
                </span>
              </div>
              <TabsList>
                <TabsTrigger value="command-center">
                  <FolderKanban className="size-3.5" />
                  Command Center
                </TabsTrigger>
                <TabsTrigger value="ai-studio">
                  <WandSparkles className="size-3.5" />
                  AI Writing Studio
                </TabsTrigger>
                <TabsTrigger value="deadline-radar">
                  <LineChart className="size-3.5" />
                  Deadline Radar
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="command-center">
              <div className="mockup-frame relative overflow-hidden p-2.5 sm:p-4">
                <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                  <Image
                    src="/images/workspace-hero-mockup.svg"
                    alt="LaunchPath Command Center mockup showing Kanban application pipeline, ATS match score, and funding tracker"
                    width={960}
                    height={640}
                    priority
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-studio">
              <div className="mockup-frame relative overflow-hidden p-2.5 sm:p-4">
                <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                  <Image
                    src="/images/ai-resume-studio.svg"
                    alt="AI Resume and Cover Letter Studio mockup with 94% role alignment score"
                    width={960}
                    height={640}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deadline-radar">
              <div className="mockup-frame relative overflow-hidden p-2.5 sm:p-4">
                <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                  <Image
                    src="/images/pipeline-analytics.svg"
                    alt="Pipeline Analytics and Deadline Radar mockup showing submission velocity"
                    width={960}
                    height={640}
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Architectural Telemetry Bar below Hero Mockup */}
          <Card className="relative z-10 mt-5 overflow-hidden py-0 lg:-mt-8 lg:mx-6">
            <div className="grid divide-y divide-border/75 md:grid-cols-[1.15fr_1.3fr_1fr] md:divide-x md:divide-y-0">
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Fit Intelligence
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    <span className="font-mono tabular-nums text-primary">94%</span> Resume Alignment
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Auto-scored against role &amp; grant criteria
                  </p>
                </div>
                <Badge variant="success" className="h-8 px-2.5 font-mono text-xs font-bold">
                  A+
                </Badge>
              </div>

              <div className="flex flex-col justify-center p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Multi-Track Coverage
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="default" className="normal-case tracking-normal">
                    <GraduationCap className="size-3" />
                    Scholarships
                  </Badge>
                  <Badge variant="default" className="normal-case tracking-normal">
                    <BriefcaseBusiness className="size-3" />
                    Jobs
                  </Badge>
                  <Badge variant="default" className="normal-case tracking-normal">
                    <HandCoins className="size-3" />
                    Grants &amp; Admissions
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Cloud Persistence
                  </p>
                  <p className="mt-1 text-base font-semibold">Neon Serverless DB</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Instant sync across essays &amp; deadlines
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Database className="size-4" />
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Architectural Telemetry Ledger (replaces generic 3-equal-card grid) */}
      <section id="product" className="cv-auto mx-auto max-w-6xl">
        <Card className="overflow-hidden py-0">
          <div className="grid divide-y divide-border/75 md:grid-cols-[1.25fr_1fr_1fr] md:divide-x md:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.code} className="flex flex-col justify-between p-7 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.code}
                  </span>
                  <span className="size-1.5 rounded-full bg-primary/70" />
                </div>
                <div className="mt-6">
                  <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-foreground">{stat.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Visual Product Studios — Asymmetric Bento Pair */}
      <section className="cv-auto space-y-12">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border/75 pb-8 lg:flex-row lg:items-end">
          <div className="space-y-3">
            <Badge variant="outline">
              <LineChart className="size-3.5 text-primary" />
              Focused Studios
            </Badge>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Every tool you need, framed with generous breathing room.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Instead of cramming dozens of noisy widgets onto one screen, LaunchPath
            separates discovery, drafting, and deadline tracking into calm, purpose-built studios.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          {/* Studio Card 1: AI Resume & Cover Letter Studio */}
          <Card className="hover-card justify-between overflow-hidden p-0">
            <CardHeader className="space-y-3 p-7 pb-0 sm:p-8 sm:pb-0">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="default">AI Writing &amp; ATS Studio</Badge>
                <span className="font-mono text-xs text-muted-foreground">STUDIO // 01</span>
              </div>
              <CardTitle className="text-2xl sm:text-[1.65rem]">
                Tailor resumes and cover letters with live role-alignment scoring.
              </CardTitle>
              <CardDescription className="max-w-xl text-sm sm:text-base">
                See exactly which achievements match the target scholarship or job
                description, insert citation-backed paragraphs, and export clean PDFs in one click.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-7 pt-4 sm:p-8 sm:pt-4">
              <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-xl">
                <Image
                  src="/images/ai-resume-studio.svg"
                  alt="AI Resume and Cover Letter Studio mockup with 94% role alignment score"
                  width={640}
                  height={440}
                  className="h-auto w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Studio Card 2: Deadline Radar & Velocity */}
          <Card className="hover-card justify-between overflow-hidden p-0">
            <CardHeader className="space-y-3 p-7 pb-0 sm:p-8 sm:pb-0">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">Deadline Radar &amp; Recommenders</Badge>
                <span className="font-mono text-xs text-muted-foreground">STUDIO // 02</span>
              </div>
              <CardTitle className="text-2xl sm:text-[1.65rem]">
                Spot upcoming milestones before they become emergencies.
              </CardTitle>
              <CardDescription className="max-w-xl text-sm sm:text-base">
                Automated milestone tracking keeps essays, recommendation letters, and
                interview rounds visible across your entire semester or job search.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-7 pt-4 sm:p-8 sm:pt-4">
              <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-xl">
                <Image
                  src="/images/pipeline-analytics.svg"
                  alt="Pipeline Analytics and Deadline Radar mockup showing submission velocity"
                  width={640}
                  height={440}
                  className="h-auto w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow & Feature Architecture */}
      <section id="workflow" className="cv-auto grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-6">
          <Badge variant="outline">How LaunchPath works</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A three-step cadence from first search to final submission.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Clear visual hierarchy and intentional negative space keep your attention on
            the next high-leverage action.
          </p>

          <div className="space-y-3.5 pt-2">
            {workflow.map((item) => (
              <Card key={item.step} className="py-5">
                <CardContent className="space-y-2.5 px-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="font-mono text-xs tabular-nums">
                      {item.step}
                    </Badge>
                    <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:pt-4">
          {featureTiles.map(({ tag, title, body, metric, Icon, featured }) => (
            <Card
              key={title}
              className={`hover-card justify-between ${
                featured ? "border-primary/25 bg-card" : "bg-card/80"
              }`}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {tag}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </CardContent>
              <CardFooter className="border-t border-border/65 text-xs">
                <span className="font-mono text-[11px] font-medium text-muted-foreground">
                  {metric}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing & shadcn Accordion FAQ Section */}
      <section id="pricing" className="cv-auto grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
        <Card className="p-7 sm:p-10">
          <div className="space-y-3">
            <Badge variant="outline">Pricing</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple pricing that respects your runway.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start free with full access to opportunity discovery and pipeline tracking.
              Upgrade only when you need higher AI generation volume.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`justify-between py-6 ${
                  plan.featured
                    ? "border-primary/40 bg-primary/[0.04] shadow-[0_18px_44px_-24px_rgba(59,130,246,0.32)]"
                    : "bg-background/55"
                }`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {plan.code}
                      </p>
                      <CardTitle className="mt-1 text-xl">{plan.name}</CardTitle>
                    </div>
                    {plan.featured && <Badge variant="default">Recommended</Badge>}
                  </div>
                  <CardDescription>{plan.detail}</CardDescription>

                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">/ month</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-5" />
                  <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    variant={plan.featured ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Card>

        <div id="faq" className="space-y-6">
          <div className="space-y-2 px-1">
            <Badge variant="outline">FAQ</Badge>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Common questions, answered clearly.
            </h3>
          </div>

          <Accordion type="single" defaultValue="faq-1" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="p-7 sm:p-8">
            <div className="space-y-3">
              <Badge variant="success">Ready in 60 seconds</Badge>
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Step into a calmer application workspace.
              </h3>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Create your account or sign in to explore the live dashboard, AI studio,
                and Neon-backed application pipeline.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Create an account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
