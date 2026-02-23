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
```

### Notes

- `OPENAI_API_KEY` is optional. If missing, cover letters use deterministic fallback templates.
- `NEXT_PUBLIC_BASE_URL` is used for signup email redirect URL generation.

## Database Setup (Supabase)

Run the migration:

- `supabase/migrations/20260223_saas_core.sql`

This migration creates and secures:

- `user_settings`
- `applications`
- `interviews`

It also applies owner-only RLS policies to:

- `resumes` (if table exists)
- `cover_letters` (if table exists)

### Required Existing Tables

The app also expects these tables for existing features:

- `resumes` with fields used by app: `id`, `user_id`, `title`, `data`, `created_at`
- `cover_letters` with fields used by app: `id`, `user_id`, `company_name`, `position`, `tone`, `description`, `content`, `created_at`

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
  - Body: `{ program, status?, date? }`

Requires authenticated user and returns only caller-owned records.

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
2. Run SQL migration: `supabase/migrations/20260223_saas_core.sql`.
3. Verify Supabase Auth providers (email/password, Google if used).
4. Confirm RLS policies are enabled and active.
5. Test critical flows: login, resume save, cover letter generation, settings update, applications/interviews create.

## Troubleshooting

### 401 from API routes

- Verify user is logged in and session cookies are present.
- Confirm Supabase URL/anon key are correct.

### Settings/Applications/Interviews return empty fallback

- The related table may not exist yet. Run the migration.

### Cover letter uses fallback instead of OpenAI

- `OPENAI_API_KEY` missing or invalid.
- Endpoint intentionally falls back to keep UX available.

### Rate limit hit too quickly during testing

- Limits are per IP/user and process-local.
- Restarting dev server clears in-memory buckets.

