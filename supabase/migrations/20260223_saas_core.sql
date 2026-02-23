-- LaunchPath full Supabase schema
-- Covers all persisted features used by the app:
-- user_settings, resumes, cover_letters, applications, interviews
--
-- Safe to run multiple times (idempotent where possible).

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
-- 1) USER SETTINGS
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_settings_data_object_check'
      and conrelid = 'public.user_settings'::regclass
  ) then
    alter table public.user_settings
      add constraint user_settings_data_object_check
      check (jsonb_typeof(data) = 'object');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2) RESUMES
-- ---------------------------------------------------------------------------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes
  add column if not exists title text not null default 'Untitled Resume',
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resumes_data_object_check'
      and conrelid = 'public.resumes'::regclass
  ) then
    alter table public.resumes
      add constraint resumes_data_object_check
      check (jsonb_typeof(data) = 'object');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3) COVER LETTERS
-- ---------------------------------------------------------------------------
create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null default '',
  position text not null default '',
  tone text not null default 'professional',
  description text not null default '',
  content text not null default '',
  source text not null default 'manual',
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cover_letters
  add column if not exists company_name text not null default '',
  add column if not exists position text not null default '',
  add column if not exists tone text not null default 'professional',
  add column if not exists description text not null default '',
  add column if not exists content text not null default '',
  add column if not exists source text not null default 'manual',
  add column if not exists model text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cover_letters_source_check'
      and conrelid = 'public.cover_letters'::regclass
  ) then
    alter table public.cover_letters
      add constraint cover_letters_source_check
      check (source in ('openai', 'fallback', 'offline-template', 'manual'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4) APPLICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program text not null,
  status text not null default 'Pending Review',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check
    check (status in ('Pending Review', 'Accepted', 'Rejected', 'In Review'))
);

alter table public.applications
  add column if not exists program text,
  add column if not exists status text not null default 'Pending Review',
  add column if not exists date date not null default current_date,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_status_check'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications
      add constraint applications_status_check
      check (status in ('Pending Review', 'Accepted', 'Rejected', 'In Review'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5) INTERVIEWS
-- ---------------------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate text not null,
  position text not null,
  date date not null default current_date,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_status_check
    check (status in ('Scheduled', 'Completed', 'Pending'))
);

alter table public.interviews
  add column if not exists candidate text,
  add column if not exists position text,
  add column if not exists date date not null default current_date,
  add column if not exists status text not null default 'Pending',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'interviews_status_check'
      and conrelid = 'public.interviews'::regclass
  ) then
    alter table public.interviews
      add constraint interviews_status_check
      check (status in ('Scheduled', 'Completed', 'Pending'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
create index if not exists user_settings_updated_at_idx
  on public.user_settings (updated_at desc);

create index if not exists resumes_user_created_at_idx
  on public.resumes (user_id, created_at desc);

create index if not exists cover_letters_user_created_at_idx
  on public.cover_letters (user_id, created_at desc);
create index if not exists cover_letters_user_position_idx
  on public.cover_letters (user_id, position);

create index if not exists applications_user_date_idx
  on public.applications (user_id, date desc);
create index if not exists applications_user_status_idx
  on public.applications (user_id, status);

create index if not exists interviews_user_date_idx
  on public.interviews (user_id, date asc);
create index if not exists interviews_user_status_idx
  on public.interviews (user_id, status);

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_resumes_updated_at on public.resumes;
create trigger set_resumes_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

drop trigger if exists set_cover_letters_updated_at on public.cover_letters;
create trigger set_cover_letters_updated_at
before update on public.cover_letters
for each row
execute function public.set_updated_at();

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

drop trigger if exists set_interviews_updated_at on public.interviews;
create trigger set_interviews_updated_at
before update on public.interviews
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- GRANTS
-- ---------------------------------------------------------------------------
revoke all on table
  public.user_settings,
  public.resumes,
  public.cover_letters,
  public.applications,
  public.interviews
from anon;

grant select, insert, update, delete on table
  public.user_settings,
  public.resumes,
  public.cover_letters,
  public.applications,
  public.interviews
to authenticated;

grant all privileges on table
  public.user_settings,
  public.resumes,
  public.cover_letters,
  public.applications,
  public.interviews
to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.user_settings enable row level security;
alter table public.resumes enable row level security;
alter table public.cover_letters enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;

drop policy if exists "User settings owner access" on public.user_settings;
create policy "User settings owner access"
on public.user_settings
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Resumes owner access" on public.resumes;
create policy "Resumes owner access"
on public.resumes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Cover letters owner access" on public.cover_letters;
create policy "Cover letters owner access"
on public.cover_letters
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Applications owner access" on public.applications;
create policy "Applications owner access"
on public.applications
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Interviews owner access" on public.interviews;
create policy "Interviews owner access"
on public.interviews
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
