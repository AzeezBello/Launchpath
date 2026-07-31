# LaunchPath

LaunchPath is a SaaS web app for students and early professionals to manage scholarships, grants, admissions, job opportunities, resumes, applications, interviews, and AI-generated cover letters in one dashboard.

## Table of Contents

1. Overview
2. Core Features
3. Tech Stack
4. Project Structure
5. Local Setup
6. Environment Variables
7. Database Setup (Supabase)
8. Scripts
9. API Documentation
10. Auth and Access Control
11. Rate Limiting
12. Deployment
13. Troubleshooting

## Overview

LaunchPath uses Next.js App Router + Supabase Auth/DB with a multi-feature dashboard:

- Opportunity discovery: scholarships, grants, admissions, jobs
- Career tools: resume builder, cover letter generation, interview tracking
- User workspace: settings, usage tracking, protected routes

The app is designed to run with real persistence in Supabase and includes API-level rate limiting.

## Core Features

- Email/password and Google OAuth auth with Supabase
- Protected dashboard routes (`/dashboard/*`)
- Resume create/edit/delete flow backed by Supabase
- Cover letter generation using OpenAI, with fallback template mode
- Applications and interviews CRUD-lite endpoints (GET/POST)
- User settings storage (`user_settings`)
- Usage/billing summary endpoint (`/api/billing/usage`)
- API response standardization and per-route rate limiting

## Tech Stack

- Framework: Next.js 15 (App Router), React 19, TypeScript
- Styling/UI: Tailwind CSS, Radix UI, Lucide icons, Framer Motion
- Auth + DB: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- AI: OpenAI SDK (`gpt-4o-mini` when key is available)
- Notifications: Sonner

## Project Structure

```txt
src/
  app/
    api/                      # API routes
    dashboard/                # Authenticated app pages
    login, signup, ...        # Public/auth pages
  components/                 # Reusable UI + feature components
  data/opportunities.ts       # Seed/static opportunity datasets
  lib/
    server/                   # API helpers (auth, rate limit, settings, AI)
  providers/                  # Supabase + theme providers
  utils/                      # Supabase clients + feature helpers
supabase/
  migrations/                 # SQL migrations
```

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended
- Supabase project
- (Optional) OpenAI API key for real AI generation

### Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_optional
COLLEGE_SCORECARD_API_KEY=your_college_scorecard_api_key_optional
ENCRYPTION_KEY=your_random_secret_optional_but_recommended
```

### Notes

- `OPENAI_API_KEY` is optional. If missing, cover letters use deterministic fallback templates.
- `COLLEGE_SCORECARD_API_KEY` is optional. If missing, `/api/admissions` serves the static dataset only (see [Live Data Sources](#live-data-sources)). Get a free key at https://api.data.gov/signup/.
- `ENCRYPTION_KEY` is optional but strongly recommended in production. It encrypts the integration tokens (`meta_token`, `tiktok_token`, `google_refresh`) stored in `user_settings` and the settings cookie. Without it, those fields are stored in plaintext (today's behavior). Use any long random string (e.g. `openssl rand -base64 32`) — it's hashed internally, so it doesn't need a specific format or length.
- `NEXT_PUBLIC_BASE_URL` is used for signup email redirect URL generation.
- On Vercel, ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for each target environment (`Production`, `Preview`, and `Development`) before deploying.

## Live Data Sources

`/api/jobs`, `/api/grants`, and `/api/admissions` blend live third-party data with the static seed lists in `src/data/opportunities.ts`. Each source degrades gracefully to static-only data if the upstream call fails or times out, so these endpoints never hard-fail.

| Endpoint | Live source | Key required | Notes |
|---|---|---|---|
| `/api/jobs` | [Remotive](https://remotive.com) | No | Remotive asks for at most ~4 requests/day against their API, so results are cached server-side for 6 hours. |
| `/api/grants` | [Grants.gov Search2](https://api.grants.gov) | No | U.S. federal grant opportunities only; cached for 6 hours. |
| `/api/admissions` | [College Scorecard](https://collegescorecard.ed.gov/data/api-documentation/) | Yes (`COLLEGE_SCORECARD_API_KEY`) | U.S. institutions only, and only used to supplement "United States" searches without a field-of-study filter — Scorecard doesn't support free-text field search. |
| `/api/scholarships` | Static only | — | No credible free/public scholarships API exists (established providers like Scholarship Owl/Fastweb don't offer open APIs). If you have access to a specific provider's API, it can be wired in the same way as the others. |

## Database Setup (Supabase)

Run the migrations, in order:

- `supabase/migrations/20260223_saas_core.sql`
- `supabase/migrations/20260730_bookmarks_and_opportunity_links.sql`

These create and secure:

- `user_settings`
- `resumes`
- `cover_letters`
- `applications` (plus `opportunity_id`/`opportunity_type` link columns)
- `interviews`
- `saved_opportunities`

## Scripts

- `npm run dev`: start dev server with Turbopack
- `npm run build`: production build with Turbopack
- `npm run start`: run production server
- `npm run lint`: run ESLint

If Turbopack build fails in restricted environments, use:

```bash
npx next build
```

## API Documentation

Base path: `/api`

### Response Shape

Most endpoints use a unified envelope:

- Success: `{ success: true, data: ..., meta?: ... }`
- Error: `{ success: false, error: string, details?: ... }`

### Auth

- `POST /api/auth/signup`
  - Body: `{ email, password, fullName? }`
  - Creates a user via Supabase Auth
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Signs in user
- `POST /api/auth/logout`
  - Signs out current session

### Opportunities (public endpoints)

- `GET /api/jobs?query=`
- `GET /api/grants?query=`
- `GET /api/scholarships?query=`
- `GET /api/admissions?country=&field=`

These endpoints serve curated datasets and support filtering.

### Cover Letters

- `POST /api/ai/generate-cover-letter`
- `POST /api/cover-letter` (alias to same handler)
  - Body: `{ company, position, description?, tone? }`
  - Requires authenticated user
  - Returns `{ content, source }` where source is `openai`, `fallback`, or `offline-template`

### Applications

- `GET /api/applications?page=1&limit=20`
- `POST /api/applications`
  - Body: `{ program, status?, date?, opportunityId?, opportunityType? }`
  - `opportunityId`/`opportunityType` are optional and link the application back to the opportunity it was created from (via the "Apply" action). Re-applying to the same opportunity returns the existing row instead of erroring.
- `GET /api/applications/linked`
  - Returns `{ opportunity_id, opportunity_type, status }[]` for every opportunity-linked application (unpaginated, capped at 500) — used to render "Applied" state on opportunity cards.

Requires authenticated user and returns only caller-owned records.

### Saved Opportunities (bookmarks)

- `GET /api/bookmarks?page=1&limit=60`
- `POST /api/bookmarks`
  - Body: `{ opportunityId, opportunityType, title, meta? }` where `opportunityType` is one of `scholarship | grant | job | admission`
  - Saving an already-saved opportunity is idempotent (returns the existing row).
- `DELETE /api/bookmarks?id=` or `DELETE /api/bookmarks?opportunityId=&opportunityType=`

Requires authenticated user and returns only caller-owned records. Backed by the `saved_opportunities` table.

### Interviews

- `GET /api/interview?page=1&limit=10&status=Scheduled|Completed|Pending`
- `POST /api/interview`
  - Body: `{ candidate, position, date?, status? }`

Requires authenticated user and returns only caller-owned records.

### Settings and Usage

- `GET /api/settings`
- `PATCH /api/settings`
  - Body: partial settings object (`profile`, `integrations`, `security`, `appearance`)
- `GET /api/billing/usage`
  - Returns plan + usage + usage percentages

### Debug

- `GET /api/debug/session`
  - Authenticated endpoint for session sanity checks

## Auth and Access Control

- Middleware (`src/middleware.ts`) protects `/dashboard/*` routes.
- Unauthenticated users are redirected to `/login` with `redirectedFrom`.
- APIs requiring user scope validate session via Supabase server client.
- RLS policies enforce ownership at DB level for user-scoped tables.

## Rate Limiting

API rate limits are enforced in `src/lib/server/api.ts` and applied per route.

Headers returned:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`
- `Retry-After` (when `429`)

Current defaults include:

- Login: 25 requests / 10 minutes (IP-based)
- Signup: 10 requests / hour (IP-based)
- Cover letter generation: 20 requests / hour (user-based)
- Settings + user CRUD endpoints: per-minute user-based limits
- Discovery endpoints: per-minute IP-based limits

Important: current limiter is in-memory and process-local. For multi-instance production, move limiter storage to Redis/Upstash.

## Deployment

### Recommended

- Vercel for Next.js hosting
- Supabase for Auth + Postgres

### Deployment Checklist

1. Set all required environment variables in your host.
2. Run SQL migrations in `supabase/migrations/` in order.
3. Verify Supabase Auth providers (email/password, Google if used).
4. Confirm RLS policies are enabled and active.
5. Test critical flows: login, resume save, cover letter generation, settings update, applications/interviews create, saving/applying to an opportunity.

## Troubleshooting

### 401 from API routes

- Verify user is logged in and session cookies are present.
- Confirm Supabase URL/anon key are correct.

### Build fails with `@supabase/ssr: Your project's URL and API key are required`

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your deployment environment.
- In Vercel: Project Settings -> Environment Variables -> add both vars for all environments.
- Redeploy after updating variables.

### Settings/Applications/Interviews return empty fallback

- The related table may not exist yet. Run the migration.

### Cover letter uses fallback instead of OpenAI

- `OPENAI_API_KEY` missing or invalid.
- Endpoint intentionally falls back to keep UX available.

### Rate limit hit too quickly during testing

- Limits are per IP/user and process-local.
- Restarting dev server clears in-memory buckets.
