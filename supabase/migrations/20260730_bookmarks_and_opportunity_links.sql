-- LaunchPath: saved/bookmarked opportunities + opportunity-linked applications
-- Adds:
--   public.saved_opportunities (bookmark a scholarship/grant/job/admission)
--   public.applications.opportunity_id / opportunity_type (link an application back to its source opportunity)
--
-- Safe to run multiple times (idempotent where possible).

-- ---------------------------------------------------------------------------
-- 1) SAVED OPPORTUNITIES
-- ---------------------------------------------------------------------------
create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id text not null,
  opportunity_type text not null,
  title text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.saved_opportunities
  add column if not exists opportunity_id text,
  add column if not exists opportunity_type text,
  add column if not exists title text not null default '',
  add column if not exists meta jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'saved_opportunities_type_check'
      and conrelid = 'public.saved_opportunities'::regclass
  ) then
    alter table public.saved_opportunities
      add constraint saved_opportunities_type_check
      check (opportunity_type in ('scholarship', 'grant', 'job', 'admission'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'saved_opportunities_meta_object_check'
      and conrelid = 'public.saved_opportunities'::regclass
  ) then
    alter table public.saved_opportunities
      add constraint saved_opportunities_meta_object_check
      check (jsonb_typeof(meta) = 'object');
  end if;
end
$$;

create unique index if not exists saved_opportunities_user_opportunity_uidx
  on public.saved_opportunities (user_id, opportunity_id, opportunity_type);

create index if not exists saved_opportunities_user_created_at_idx
  on public.saved_opportunities (user_id, created_at desc);

alter table public.saved_opportunities enable row level security;

drop policy if exists "Saved opportunities owner access" on public.saved_opportunities;
create policy "Saved opportunities owner access"
on public.saved_opportunities
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.saved_opportunities from anon;
grant select, insert, update, delete on table public.saved_opportunities to authenticated;
grant all privileges on table public.saved_opportunities to service_role;

-- ---------------------------------------------------------------------------
-- 2) APPLICATIONS: link back to source opportunity
-- ---------------------------------------------------------------------------
alter table public.applications
  add column if not exists opportunity_id text,
  add column if not exists opportunity_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_opportunity_type_check'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications
      add constraint applications_opportunity_type_check
      check (opportunity_type is null or opportunity_type in ('scholarship', 'grant', 'job', 'admission'));
  end if;
end
$$;

-- Prevents double-"Apply" clicks from creating duplicate application rows
-- for the same opportunity; manual (non-linked) applications are unaffected.
create unique index if not exists applications_user_opportunity_uidx
  on public.applications (user_id, opportunity_id, opportunity_type)
  where opportunity_id is not null;
