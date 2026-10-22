"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const START_TOUR_EVENT = "launchpath:start-tour";

type TourStep = {
  target: string; // matches a data-tour attribute value
  title: string;
  body: string;
};

const STEPS: TourStep[] = [
  {
    target: "sidebar-brand",
    title: "Welcome to LaunchPath",
    body: "Everything for scholarships, grants, jobs, admissions, and your career tools lives in this workspace.",
  },
  {
    target: "nav-overview",
    title: "Your dashboard home",
    body: "Quick stats, plan usage, and your best next actions, all in one glance.",
  },
  {
    target: "nav-career",
    title: "Career workspace",
    body: "Build your resume, generate cover letters, and track applications and interviews here.",
  },
  {
    target: "nav-academic",
    title: "Academic pipeline",
    body: "Browse scholarships, grants, and admissions programs curated for you.",
  },
  {
    target: "nav-saved",
    title: "Save anything for later",
    body: "Bookmark an opportunity from its card, then come back and apply whenever you're ready.",
  },
  {
    target: "user-menu",
    title: "Account & settings",
    body: "Manage your profile, appearance, and integrations — and replay this tour anytime from here.",
  },
];

const CARD_WIDTH = 312;

function resolveTargetRect(target: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el || el.offsetParent === null) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
}

function isDesktopViewport() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const checkedAutoStart = useRef(false);

  useEffect(() => setMounted(true), []);

  const finish = useCallback((markComplete: boolean) => {
    setActive(false);
    setStepIndex(0);
    if (!markComplete) return;

    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding: { tourCompletedAt: new Date().toISOString() } }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (checkedAutoStart.current) return;
    checkedAutoStart.current = true;

    if (!isDesktopViewport()) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        const completedTour = payload?.data?.onboarding?.tourCompletedAt;
        if (!completedTour) {
          setTimeout(() => setActive(true), 600);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!isDesktopViewport()) return;
      setStepIndex(0);
      setActive(true);
    };
    window.addEventListener(START_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_TOUR_EVENT, handler);
  }, []);

  const measure = useCallback(() => {
    if (!active) return;
    const step = STEPS[stepIndex];
    const next = resolveTargetRect(step.target);
    if (!next) {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        finish(true);
      }
      return;
    }
    setRect(next);
  }, [active, stepIndex, finish]);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, measure]);

  if (!mounted || !active || !rect) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const cardTop =
    rect.bottom + 184 > window.innerHeight ? Math.max(16, rect.top - 160) : rect.bottom + 12;
  const cardLeft = Math.min(Math.max(16, rect.left), window.innerWidth - CARD_WIDTH - 16);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
        }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.08 }}
        className="absolute rounded-xl ring-2 ring-primary/80"
        style={{
          boxShadow: "0 0 0 9999px rgba(8,15,25,0.62)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-auto absolute rounded-2xl border border-border/85 bg-popover p-4 text-popover-foreground shadow-2xl"
          style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="outline" className="font-mono text-[10px]">
                {String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
              </Badge>
              <p className="pt-1 text-sm font-semibold">{step.title}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => finish(true)}
              aria-label="Close tour"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    i === stepIndex ? "w-4 bg-primary" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => finish(true)}
              >
                Skip
              </Button>
              <Button size="sm" onClick={() => (isLast ? finish(true) : setStepIndex((i) => i + 1))}>
                {isLast ? "Done" : "Next"}
                {!isLast && <ArrowRight className="size-3.5" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
