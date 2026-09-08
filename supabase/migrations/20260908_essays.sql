-- LaunchPath: essays / personal statements
-- Scholarship and admissions applications ask for essays against a prompt,
-- often with a word limit. This table tracks each one, optionally linked to
-- the application it belongs to.
--
-- Safe to run multiple times (idempotent where possible).

create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

alter table public.essays enable row level security;

drop policy if exists "Essays owner access" on public.essays;
create policy "Essays owner access"
on public.essays
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.essays from anon;
grant select, insert, update, delete on table public.essays to authenticated;
grant all privileges on table public.essays to service_role;
