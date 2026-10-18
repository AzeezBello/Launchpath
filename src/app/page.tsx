import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
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
    label: "Active opportunities indexed",
    value: "1,200+",
    detail: "Scholarships, fellowships, grants, and early-career roles.",
  },
  {
    label: "Hours saved every month",
    value: "12 hrs",
    detail: "Automated resume tailoring, cover letters, and deadline alerts.",
  },
  {
    label: "Applicants & teams on LaunchPath",
    value: "3.4k",
    detail: "Running high-volume career and academic pipelines.",
  },
];

const featureTiles = [
  {
    title: "Discovery that stays organized",
    body: "Search scholarships, grants, jobs, and admissions without losing deadlines, notes, or requirements.",
    Icon: Search,
  },
  {
    title: "Application assets in one place",
    body: "Generate cover letters, build resumes, and keep every draft tied to the right opportunity.",
    Icon: WandSparkles,
  },
  {
    title: "A calmer command center",
    body: "See what is due, what is active, and what needs attention from one spacious, distraction-free dashboard.",
    Icon: FolderKanban,
  },
  {
    title: "Neon Postgres foundation",
    body: "Serverless Neon Postgres persistence, TOTP MFA security, and AI fallbacks make this production-ready out of the box.",
    Icon: ShieldCheck,
  },
];

const workflow = [
  {
    step: "01",
    title: "Track every path in one view",
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
    price: "$0",
    detail: "For solo applicants getting organized with zero friction.",
    perks: [
      "Unlimited opportunity searches",
      "5 tailored resumes & 50 tracked applications",
      "20 AI cover letters per month",
    ],
    href: "/signup",
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$18",
    detail: "For ambitious applicants and teams managing high volume.",
    perks: [
      "100 resumes & 1,000 tracked applications",
      "250 AI cover letters per month",
      "Automated deadline reminders & priority support",
    ],
    href: "/signup",
    cta: "Start Pro",
    featured: true,
  },
];

const faqs = [
  {
    question: "Does LaunchPath work without third-party AI or job APIs configured?",
    answer:
      "Yes. Opportunity feeds, resume scoring, and cover-letter generation include built-in deterministic fallbacks so your workspace remains fast and functional at all times.",
  },
  {
    question: "Can I use it for both academic funding and career applications?",
    answer:
      "That is the core architecture. Scholarships, research grants, graduate admissions, interviews, jobs, resumes, and recommenders all share the same calm workspace.",
  },
  {
    question: "How is my application data stored and secured?",
    answer:
      "All workspace records are persisted in serverless Neon Postgres with encrypted integration secrets, scrypt password hashing, and native TOTP multi-factor authentication.",
  },
];

export default function Home() {
  return (
    <div className="space-y-28 pb-12 md:space-y-40">
      {/* Hero Section with generous negative space & layered product mockup */}
      <section className="relative pt-4 lg:pt-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Calm Opportunity Operating System</span>
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span className="text-primary">Neon Cloud Live</span>
          </div>

          <h1 className="text-balance mx-auto mt-8 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Run scholarships, jobs, grants, and admissions with room to think.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            LaunchPath brings opportunity discovery, AI-assisted writing, and deadline
            tracking into one spacious workspace—replacing tab chaos with clear momentum.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/dashboard">Explore live workspace</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Serverless Neon Postgres
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              AI resume &amp; cover letter studio
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Zero credit card required
            </span>
          </div>
        </div>

        {/* Hero Visual Mockup Stage */}
        <div className="relative mx-auto mt-16 max-w-6xl lg:mt-20">
          <div className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-10 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.14),transparent_55%)] blur-2xl" />

          <div className="mockup-frame relative overflow-hidden p-3 sm:p-5 lg:p-6">
            <div className="overflow-hidden rounded-[1.35rem] border border-slate-800/80 bg-slate-950 shadow-2xl">
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

          {/* Floating Callout Cards on Desktop */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg: -mt-12 lg:px-8">
            <div className="surface-panel relative z-10 flex items-center justify-between p-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Fit Intelligence
                </p>
                <p className="mt-1.5 text-lg font-semibold">94% Resume Alignment</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Auto-scored against role requirements
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-sm font-bold text-success">
                A+
              </span>
            </div>

            <div className="surface-panel relative z-10 flex items-center justify-between p-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Multi-Track Coverage
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Scholarships
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    Jobs
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <HandCoins className="h-3.5 w-3.5" />
                    Grants
                  </span>
                </div>
              </div>
            </div>

            <div className="surface-panel relative z-10 flex items-center justify-between p-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Cloud Persistence
                </p>
                <p className="mt-1.5 text-lg font-semibold">Neon Serverless DB</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Instant sync across essays &amp; deadlines
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Database className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Spacious Metrics Bar */}
      <section id="product" className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="hover-card rounded-[2rem] border border-border/75 bg-card/85 p-8 sm:p-10"
            >
              <p className="text-4xl font-semibold tracking-tight sm:text-5xl">{stat.value}</p>
              <p className="mt-4 text-base font-semibold text-foreground">{stat.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Product Tour / Mockup Bento Grid */}
      <section className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="w-fit">
            <LineChart className="h-3.5 w-3.5" />
            Designed for clarity
          </Badge>
          <h2 className="text-balance mt-5 text-3xl font-semibold sm:text-5xl">
            Every tool you need, framed with generous breathing room.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Instead of cramming dozens of noisy widgets onto one screen, LaunchPath
            separates discovery, drafting, and deadline tracking into calm, focused studios.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Mockup Card 1: AI Resume & Cover Letter Studio */}
          <div className="surface-panel flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                AI Writing &amp; ATS Studio
              </Badge>
              <h3 className="text-2xl font-semibold sm:text-3xl">
                Tailor resumes and cover letters with live role-alignment scoring.
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                See exactly which achievements match the target scholarship or job
                description, insert AI-drafted paragraphs, and export clean PDFs in one click.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-slate-800/80 bg-slate-950 shadow-xl">
              <Image
                src="/images/ai-resume-studio.svg"
                alt="AI Resume and Cover Letter Studio mockup with 94% role alignment score"
                width={640}
                height={440}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          {/* Mockup Card 2: Deadline Radar & Velocity */}
          <div className="surface-panel flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                Deadline Radar &amp; Recommenders
              </Badge>
              <h3 className="text-2xl font-semibold sm:text-3xl">
                Spot upcoming milestones before they become last-minute emergencies.
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                Automated milestone tracking keeps essays, recommendation letters, and
                interview rounds visible across your entire semester or job search.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-slate-800/80 bg-slate-950 shadow-xl">
              <Image
                src="/images/pipeline-analytics.svg"
                alt="Pipeline Analytics and Deadline Radar mockup showing submission velocity"
                width={640}
                height={440}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow & Feature Architecture */}
      <section className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-6">
          <Badge variant="outline" className="w-fit">
            How LaunchPath works
          </Badge>
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">
            A three-step cadence from first search to final submission.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Clear visual hierarchy and intentional negative space keep your attention on
            the next high-leverage action.
          </p>

          <div className="space-y-5 pt-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.75rem] border border-border/80 bg-card/85 p-7"
              >
                <div className="flex items-center gap-3.5">
                  <span className="rounded-full bg-primary/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
                <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:pt-8">
          {featureTiles.map(({ title, body, Icon }) => (
            <div
              key={title}
              className="hover-card flex flex-col justify-between rounded-[2rem] border border-border/80 bg-card/85 p-8"
            >
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {body}
                </p>
              </div>
              <div className="mt-8 border-t border-border/60 pt-4 text-xs font-medium text-muted-foreground">
                Included in all workspaces
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Native Accordion FAQ Section */}
      <section id="pricing" className="grid gap-12 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
        <div className="surface-panel p-8 sm:p-12">
          <Badge variant="outline" className="w-fit">
            Pricing
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
            Simple pricing that respects your runway.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start free with full access to opportunity discovery and pipeline tracking.
            Upgrade only when you need higher AI generation volume.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-[2rem] border p-8 ${
                  plan.featured
                    ? "border-primary/35 bg-primary/8 shadow-[0_24px_60px_-32px_rgba(59,130,246,0.38)]"
                    : "border-border/80 bg-background/55"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold">{plan.name}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {plan.detail}
                      </p>
                    </div>
                    {plan.featured && <Badge>Recommended</Badge>}
                  </div>

                  <p className="mt-8 text-4xl font-semibold sm:text-5xl">
                    {plan.price}
                    <span className="ml-1.5 text-sm font-medium text-muted-foreground">/mo</span>
                  </p>

                  <ul className="mt-8 space-y-3.5 text-sm text-muted-foreground">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                  className="mt-9 w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div id="faq" className="space-y-6">
          <div className="px-2">
            <Badge variant="outline" className="w-fit">
              FAQ
            </Badge>
            <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">
              Common questions, answered clearly.
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                name="launchpath-faq"
                open={index === 0}
                className="group rounded-[1.75rem] border border-border/80 bg-card/85 p-6 sm:p-7"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  <span>{faq.question}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/60 text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="surface-panel p-8 sm:p-10">
            <h3 className="text-2xl font-semibold">Ready to step into a calmer workspace?</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Create your account or sign in to explore the live dashboard, AI studio,
              and Neon-backed application pipeline.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create an account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
