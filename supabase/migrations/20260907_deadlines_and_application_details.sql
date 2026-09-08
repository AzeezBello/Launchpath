-- LaunchPath: deadline engine + richer applications and interviews
-- Adds:
--   public.applications.deadline / notes / url / resume_id / cover_letter_id
--   expanded application status set (Draft, Interviewing, Offer, Withdrawn)
--   public.interviews.application_id / notes / location
--
-- Safe to run multiple times (idempotent where possible).

-- ---------------------------------------------------------------------------
-- 1) APPLICATIONS: deadline, notes, url, attached documents
-- ---------------------------------------------------------------------------
alter table public.applications
  add column if not exists deadline date,
  add column if not exists notes text not null default '',
  add column if not exists url text not null default '',
  add column if not exists resume_id uuid references public.resumes(id) on delete set null,
  add column if not exists cover_letter_id uuid references public.cover_letters(id) on delete set null;

-- Expand the allowed status set. Existing values remain valid.
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications
  add constraint applications_status_check
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
  );

create index if not exists applications_user_deadline_idx
  on public.applications (user_id, deadline asc)
  where deadline is not null;

-- ---------------------------------------------------------------------------
-- 2) INTERVIEWS: link to an application, prep notes, location
-- ---------------------------------------------------------------------------
alter table public.interviews
  add column if not exists application_id uuid references public.applications(id) on delete set null,
  add column if not exists notes text not null default '',
  add column if not exists location text not null default '';

create index if not exists interviews_user_application_idx
  on public.interviews (user_id, application_id)
  where application_id is not null;
