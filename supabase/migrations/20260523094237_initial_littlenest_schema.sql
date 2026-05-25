create type public.family_mode as enum ('single', 'twins');
create type public.child_sex as enum ('boy', 'girl');
create type public.twin_type as enum ('boy_boy', 'girl_girl', 'boy_girl');
create type public.app_language as enum ('en', 'he', 'ru');
create type public.tracking_log_type as enum (
  'sleep',
  'feed',
  'solid_food',
  'diaper',
  'mood',
  'note',
  'illness',
  'teething',
  'medication',
  'unusual_day'
);
create type public.ai_provider as enum ('gemini', 'openai', 'claude');
create type public.ai_prompt_type as enum ('sleep', 'hunger', 'food_tasting', 'recipe');
create type public.ai_feedback_rating as enum ('good', 'okay', 'bad');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My family',
  mode public.family_mode not null,
  twin_type public.twin_type,
  language public.app_language not null default 'en',
  created_at timestamptz not null default now(),
  constraint valid_twin_type check (
    (mode = 'single' and twin_type is null)
    or (mode = 'twins' and twin_type is not null)
  )
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  sex public.child_sex not null,
  date_of_birth date not null,
  created_at timestamptz not null default now()
);

create table public.growth_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  head_circumference_cm numeric(5,2),
  note text
);

create table public.tracking_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  log_type public.tracking_log_type not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  amount_ml numeric(6,2),
  food_name text,
  mood text,
  diaper_kind text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.food_tests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  food_name text not null,
  test_count integer not null default 0 check (test_count >= 0 and test_count <= 3),
  last_tested_at timestamptz,
  allergy_note text,
  source_url text,
  created_at timestamptz not null default now()
);

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  prompt_type public.ai_prompt_type not null,
  language public.app_language not null,
  context jsonb not null,
  created_at timestamptz not null default now()
);

create table public.ai_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ai_requests(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider public.ai_provider not null,
  title text not null,
  body text not null,
  confidence_label text not null check (confidence_label in ('Low', 'Medium', 'High')),
  sources jsonb not null default '[]'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.ai_responses(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  rating public.ai_feedback_rating not null,
  note text,
  created_at timestamptz not null default now(),
  unique (response_id, owner_id)
);

create table public.local_reminder_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reminder_kind text not null,
  enabled boolean not null default true,
  minutes_before integer not null default 15,
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.profiles to authenticated, service_role;
grant select, insert, update, delete on table public.families to authenticated, service_role;
grant select, insert, update, delete on table public.children to authenticated, service_role;
grant select, insert, update, delete on table public.growth_entries to authenticated, service_role;
grant select, insert, update, delete on table public.tracking_logs to authenticated, service_role;
grant select, insert, update, delete on table public.food_tests to authenticated, service_role;
grant select, insert, update, delete on table public.ai_requests to authenticated, service_role;
grant select, insert, update, delete on table public.ai_responses to authenticated, service_role;
grant select, insert, update, delete on table public.ai_feedback to authenticated, service_role;
grant select, insert, update, delete on table public.local_reminder_settings to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.growth_entries enable row level security;
alter table public.tracking_logs enable row level security;
alter table public.food_tests enable row level security;
alter table public.ai_requests enable row level security;
alter table public.ai_responses enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.local_reminder_settings enable row level security;

create policy "profiles owner read"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles owner insert"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles owner update"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "families owner all"
on public.families
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "children owner all"
on public.children
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "growth owner all"
on public.growth_entries
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "logs owner all"
on public.tracking_logs
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "food tests owner all"
on public.food_tests
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "ai requests owner all"
on public.ai_requests
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "ai responses owner all"
on public.ai_responses
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "ai feedback owner all"
on public.ai_feedback
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "reminders owner all"
on public.local_reminder_settings
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create index families_owner_id_idx on public.families(owner_id);
create index children_family_id_idx on public.children(family_id);
create index growth_entries_child_measured_idx on public.growth_entries(child_id, measured_at desc);
create index tracking_logs_child_started_idx on public.tracking_logs(child_id, started_at desc);
create index food_tests_child_idx on public.food_tests(child_id);
create unique index food_tests_child_food_name_uidx on public.food_tests(child_id, lower(food_name));
create index ai_requests_owner_created_idx on public.ai_requests(owner_id, created_at desc);
create index ai_responses_request_idx on public.ai_responses(request_id);
