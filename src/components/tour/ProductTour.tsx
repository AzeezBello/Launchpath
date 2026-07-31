"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const CARD_WIDTH = 300;

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

  // Auto-launch once per account, desktop only (the tour targets the sidebar,
  // which is hidden below the lg breakpoint).
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

  // Manual replay trigger (e.g. from the account menu).
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
      // Target not present on this screen size/route — skip forward, or end the tour.
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
    rect.bottom + 176 > window.innerHeight ? Math.max(16, rect.top - 152) : rect.bottom + 14;
  const cardLeft = Math.min(Math.max(16, rect.left), window.innerWidth - CARD_WIDTH - 16);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute rounded-2xl ring-2 ring-primary/70"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(8,15,25,0.6)",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-auto absolute rounded-2xl border border-border/80 bg-popover p-4 text-popover-foreground shadow-xl"
          style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{step.title}</p>
            <button
              type="button"
              onClick={() => finish(true)}
              aria-label="Close tour"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? "w-4 bg-primary" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => finish(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
              <Button size="sm" onClick={() => (isLast ? finish(true) : setStepIndex((i) => i + 1))}>
                {isLast ? "Done" : "Next"}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
