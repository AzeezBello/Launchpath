-- LaunchPath: recommenders (reference / recommendation letter tracking)
-- Scholarships and admissions usually need 1-3 letters from named people.
-- Track who was asked, when it is due, and whether it was submitted.
--
-- Safe to run multiple times (idempotent where possible).

create table if not exists public.recommenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

alter table public.recommenders enable row level security;

drop policy if exists "Recommenders owner access" on public.recommenders;
create policy "Recommenders owner access"
on public.recommenders
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.recommenders from anon;
grant select, insert, update, delete on table public.recommenders to authenticated;
grant all privileges on table public.recommenders to service_role;
