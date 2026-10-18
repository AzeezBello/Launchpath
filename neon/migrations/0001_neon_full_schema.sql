-- LaunchPath Full Neon Postgres Schema
-- Replaces Supabase Auth + Database completely with native Neon Postgres tables.
-- Safe to run multiple times (idempotent).

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 0) USERS, MFA FACTORS & PASSWORD RESET TOKENS (Native Neon Auth)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null default 'user'
    constraint users_role_check check (role in ('user', 'admin', 'superadmin')),
  user_metadata jsonb not null default '{}'::jsonb,
  app_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (lower(email));

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create table if not exists public.user_mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  friendly_name text default 'Authenticator app',
  factor_type text not null default 'totp',
  secret text not null,
  status text not null default 'unverified'
    constraint user_mfa_factors_status_check check (status in ('unverified', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_mfa_factors_user_idx on public.user_mfa_factors (user_id);

drop trigger if exists set_user_mfa_factors_updated_at on public.user_mfa_factors;
create trigger set_user_mfa_factors_updated_at
before update on public.user_mfa_factors
for each row
execute function public.set_updated_at();

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_user_idx on public.password_reset_tokens (user_id);

-- ---------------------------------------------------------------------------
-- 1) USER SETTINGS
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_data_object_check check (jsonb_typeof(data) = 'object')
);

create index if not exists user_settings_updated_at_idx
  on public.user_settings (updated_at desc);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2) RESUMES
-- ---------------------------------------------------------------------------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resumes_data_object_check check (jsonb_typeof(data) = 'object')
);

create index if not exists resumes_user_created_at_idx
  on public.resumes (user_id, created_at desc);

drop trigger if exists set_resumes_updated_at on public.resumes;
create trigger set_resumes_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3) COVER LETTERS
-- ---------------------------------------------------------------------------
create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text not null default '',
  position text not null default '',
  tone text not null default 'professional',
  description text not null default '',
  content text not null default '',
  source text not null default 'manual',
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cover_letters_source_check
    check (source in ('openai', 'fallback', 'offline-template', 'manual'))
);

create index if not exists cover_letters_user_created_at_idx
  on public.cover_letters (user_id, created_at desc);
create index if not exists cover_letters_user_position_idx
  on public.cover_letters (user_id, position);

drop trigger if exists set_cover_letters_updated_at on public.cover_letters;
create trigger set_cover_letters_updated_at
before update on public.cover_letters
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) APPLICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  program text not null,
  status text not null default 'Pending Review',
  date date not null default current_date,
  deadline date,
  notes text not null default '',
  url text not null default '',
  resume_id uuid references public.resumes(id) on delete set null,
  cover_letter_id uuid references public.cover_letters(id) on delete set null,
  opportunity_id text,
  opportunity_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check
    check (
      status in (
        'Draft',
        'Pending Review',
        'In Review',
        'Interviewing',
        'Offer',
        'Accepted',
        'Rejected',
        'Withdrawn'
      )
    ),
  constraint applications_opportunity_type_check
    check (opportunity_type is null or opportunity_type in ('scholarship', 'grant', 'job', 'admission'))
);

create index if not exists applications_user_date_idx
  on public.applications (user_id, date desc);
create index if not exists applications_user_status_idx
  on public.applications (user_id, status);
create index if not exists applications_user_deadline_idx
  on public.applications (user_id, deadline asc)
  where deadline is not null;
create unique index if not exists applications_user_opportunity_uidx
  on public.applications (user_id, opportunity_id, opportunity_type)
  where opportunity_id is not null;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5) INTERVIEWS
-- ---------------------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  candidate text not null,
  position text not null,
  date date not null default current_date,
  status text not null default 'Pending',
  application_id uuid references public.applications(id) on delete set null,
  notes text not null default '',
  location text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_status_check
    check (status in ('Scheduled', 'Completed', 'Pending'))
);

create index if not exists interviews_user_date_idx
  on public.interviews (user_id, date asc);
create index if not exists interviews_user_status_idx
  on public.interviews (user_id, status);
create index if not exists interviews_user_application_idx
  on public.interviews (user_id, application_id)
  where application_id is not null;

drop trigger if exists set_interviews_updated_at on public.interviews;
create trigger set_interviews_updated_at
before update on public.interviews
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6) SAVED OPPORTUNITIES
-- ---------------------------------------------------------------------------
create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  opportunity_id text not null,
  opportunity_type text not null,
  title text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint saved_opportunities_type_check
    check (opportunity_type in ('scholarship', 'grant', 'job', 'admission')),
  constraint saved_opportunities_meta_object_check
    check (jsonb_typeof(meta) = 'object')
);

create unique index if not exists saved_opportunities_user_opportunity_uidx
  on public.saved_opportunities (user_id, opportunity_id, opportunity_type);
create index if not exists saved_opportunities_user_created_at_idx
  on public.saved_opportunities (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7) ESSAYS
-- ---------------------------------------------------------------------------
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  title text not null default 'Untitled essay',
  prompt text not null default '',
  content text not null default '',
  word_limit integer,
  status text not null default 'Not started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint essays_status_check
    check (status in ('Not started', 'Drafting', 'Review', 'Final')),
  constraint essays_word_limit_check
    check (word_limit is null or (word_limit > 0 and word_limit <= 100000))
);

create index if not exists essays_user_updated_at_idx
  on public.essays (user_id, updated_at desc);
create index if not exists essays_user_application_idx
  on public.essays (user_id, application_id)
  where application_id is not null;

drop trigger if exists set_essays_updated_at on public.essays;
create trigger set_essays_updated_at
before update on public.essays
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8) RECOMMENDERS
-- ---------------------------------------------------------------------------
create table if not exists public.recommenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  name text not null,
  email text not null default '',
  relationship text not null default '',
  status text not null default 'To ask',
  due_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recommenders_status_check
    check (status in ('To ask', 'Requested', 'Submitted', 'Declined'))
);

create index if not exists recommenders_user_due_idx
  on public.recommenders (user_id, due_date asc)
  where due_date is not null;
create index if not exists recommenders_user_application_idx
  on public.recommenders (user_id, application_id)
  where application_id is not null;

drop trigger if exists set_recommenders_updated_at on public.recommenders;
create trigger set_recommenders_updated_at
before update on public.recommenders
for each row
execute function public.set_updated_at();
