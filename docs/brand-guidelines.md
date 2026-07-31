# LaunchPath Brand Guidelines v1.0

> Last updated: 2026-07-30
> Status: Draft — "Ocean Professional" revamp
> Theme: Ocean Professional

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #3B82F6 |
| Secondary Color | #F59E0B |
| Accent Color | #10B981 |
| Primary Font | Manrope (body) |
| Display Font | Space Grotesk (headings) |
| Voice | Modern, Professional, Encouraging, Efficient |

---

## Brand Concept

**Theme: Ocean Professional**

LaunchPath is the opportunity workspace for students and early professionals — scholarships,
grants, admissions, jobs, resumes, cover letters, applications, and interviews in one place.
The brand needs to feel credible enough for a high-stakes scholarship application and light
enough that checking in daily doesn't feel like a chore.

Ocean Professional pairs a confident, trustworthy blue (the same hue family as most banking,
edtech, and productivity SaaS a student already trusts) with a warm amber for
attention/energy and an emerald green for progress and positive outcomes — application
accepted, opportunity saved, resume complete.

**Mood keywords:** modern, polished, trustworthy, calm-competent, momentum, clarity.

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary Blue | #3B82F6 | rgb(59,130,246) | CTAs, links, active nav, focus rings |
| Primary Dark | #2563EB | rgb(37,99,235) | Hover/pressed states, emphasis |
| Primary Light | #DBEAFE | rgb(219,234,254) | Subtle fills, selected chips, badges |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Secondary Amber | #F59E0B | rgb(245,158,11) | Highlights, deadlines/reminders, secondary CTAs |
| Secondary Dark | #D97706 | rgb(217,119,6) | Hover states on amber elements |
| Secondary Light | #FEF3C7 | rgb(254,243,199) | Warning/attention backgrounds |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Accent Emerald | #10B981 | rgb(16,185,129) | Success states, "Applied"/"Saved" confirmations, progress |
| Accent Dark | #059669 | rgb(5,150,105) | Hover states on emerald elements |
| Accent Light | #D1FAE5 | rgb(209,250,229) | Success banners, positive status badges |

### Neutral Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background (light) | #FAFBFF | Page background, light mode |
| Surface (light) | #FFFFFF | Cards, panels, light mode |
| Background (dark) | #0B1220 | Page background, dark mode |
| Surface (dark) | #131B2E | Cards, panels, dark mode |
| Text Primary | #101828 | Headings, body text (light mode) |
| Text Secondary | #667085 | Captions, muted text, metadata |
| Border | #E4E7EC | Dividers, card borders (light mode) |

### Semantic / Status Colors

| State | Hex | Usage |
|-------|-----|-------|
| Success | #10B981 | Accepted applications, completed interviews |
| Warning | #F59E0B | Upcoming deadlines, pending review |
| Error | #EF4444 | Rejected, failed actions, destructive confirms |
| Info | #3B82F6 | Neutral notices, informational banners |

### Accessibility

- Body text on light background targets ≥ 7:1 contrast (AAA).
- Primary Blue on white: ~3.9:1 — always pair with white/near-white text (already `--primary-foreground`), not as body-text color on white.
- All interactive elements (buttons, links, form controls, tab triggers) must retain a visible focus ring meeting WCAG 2.1 AA at minimum.

---

## 2. Typography

LaunchPath already uses a strong, modern pairing — kept as-is for this revamp.

```css
--font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif; /* headings */
--font-body: 'Manrope', system-ui, -apple-system, sans-serif;          /* body, UI copy */
```

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|----------------|---------------|--------|-------------|
| H1 | 36–48px | 28–32px | 600 (Space Grotesk) | 1.15 |
| H2 | 28–30px | 22–24px | 600 (Space Grotesk) | 1.2 |
| H3 | 20–22px | 18px | 600 (Space Grotesk) | 1.3 |
| Body | 15–16px | 15–16px | 400 (Manrope) | 1.5 |
| Small / caption | 12–13px | 12–13px | 500 (Manrope) | 1.4 |

---

## 3. Logo Usage

LaunchPath's mark is the "LP" monogram badge — a rounded square with a diagonal gradient
from Primary Blue to Accent Emerald, set in Space Grotesk bold.

| Variant | Use Case |
|---------|----------|
| LP badge + wordmark | Sidebar header, marketing nav, auth pages |
| LP badge only | Favicon, compact/mobile nav, loading states |

- Minimum size: 32px (badge only), 120px (badge + wordmark).
- Don't recolor the gradient outside the approved Blue → Emerald direction.
- Don't place on backgrounds with contrast ratio below AA against the badge's text.

---

## 4. Voice & Tone

**Brand personality:** Modern & polished, Professional & trustworthy, Encouraging & supportive, Efficient & focused.

### Voice Chart

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Modern & polished | Clean, contemporary, considered | Trendy for its own sake, gimmicky |
| Professional & trustworthy | Credible, precise, calm | Corporate, stiff, jargon-heavy |
| Encouraging & supportive | Warm, momentum-focused | Saccharine, over-hyped |
| Efficient & focused | Direct, action-oriented | Curt, cold |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Marketing / landing | Confident, benefit-led | "One calmer workspace for every application path." |
| Dashboard / product copy | Encouraging, momentum-focused | "Keep every opportunity moving with less friction." |
| Empty states | Supportive, action-oriented | "Nothing saved yet — tap the bookmark icon on any card to save it here." |
| Errors | Calm, solution-first | "Couldn't load applications. [reason] — try again." |
| Success confirmations | Warm, brief | "Saved.", "Application added.", "You're all set." |

---

## AI Image Generation

**Base prompt:** "Modern SaaS product photography/illustration for an education & career
platform, calm confident blue (#3B82F6) as the dominant color, warm amber (#F59E0B) and
emerald green (#10B981) as supporting accents, clean rounded shapes, soft gradients,
generous whitespace, no clutter."

**Keywords:** modern, polished, professional, trustworthy, calm-competent, momentum, clarity,
optimistic, minimal.

**Avoid:** harsh primary red/yellow combos, cluttered collage styles, stock-photo cheesiness,
overly corporate/stiff imagery.
