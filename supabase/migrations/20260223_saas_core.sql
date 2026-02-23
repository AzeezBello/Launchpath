-- LaunchPath SaaS core schema
-- Run via Supabase SQL editor or migration tooling.

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

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_date_idx on public.applications (date desc);

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

create index if not exists interviews_user_id_idx on public.interviews (user_id);
create index if not exists interviews_date_idx on public.interviews (date asc);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
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

alter table public.user_settings enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table if exists public.resumes enable row level security;
alter table if exists public.cover_letters enable row level security;

drop policy if exists "User settings owner read" on public.user_settings;
create policy "User settings owner read"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "User settings owner write" on public.user_settings;
create policy "User settings owner write"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Applications owner read" on public.applications;
create policy "Applications owner read"
on public.applications
for select
using (auth.uid() = user_id);

drop policy if exists "Applications owner write" on public.applications;
create policy "Applications owner write"
on public.applications
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Interviews owner read" on public.interviews;
create policy "Interviews owner read"
on public.interviews
for select
using (auth.uid() = user_id);

drop policy if exists "Interviews owner write" on public.interviews;
create policy "Interviews owner write"
on public.interviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Resumes owner access" on public.resumes;
create policy "Resumes owner access"
on public.resumes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Cover letters owner access" on public.cover_letters;
create policy "Cover letters owner access"
on public.cover_letters
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
