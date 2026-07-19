-- This migration creates storage only. No application path writes birth data or
-- calculates a chart until Supabase credentials and ephemeris licensing exist.

create table if not exists public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'My birth chart',
  birth_date date not null,
  birth_time time without time zone not null,
  birth_place text not null,
  latitude double precision,
  longitude double precision,
  timezone_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint birth_profiles_id_user_id_key unique (id, user_id),
  constraint birth_profiles_label_not_blank check (length(btrim(label)) between 1 and 120),
  constraint birth_profiles_place_not_blank check (length(btrim(birth_place)) between 1 and 512),
  constraint birth_profiles_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint birth_profiles_longitude_range check (longitude is null or longitude between -180 and 180),
  constraint birth_profiles_resolution_complete check (
    (latitude is null and longitude is null and timezone_name is null)
    or (latitude is not null and longitude is not null and length(btrim(timezone_name)) > 0)
  )
);

create table if not exists public.natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  birth_profile_id uuid not null,
  schema_version smallint not null default 1,
  engine_provider text not null,
  engine_version text not null,
  chart_data jsonb not null,
  calculated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint natal_charts_profile_owner_fkey
    foreign key (birth_profile_id, user_id)
    references public.birth_profiles (id, user_id)
    on delete cascade,
  constraint natal_charts_schema_version_positive check (schema_version > 0),
  constraint natal_charts_engine_provider_not_blank check (length(btrim(engine_provider)) > 0),
  constraint natal_charts_engine_version_not_blank check (length(btrim(engine_version)) > 0),
  constraint natal_charts_data_is_object check (jsonb_typeof(chart_data) = 'object'),
  constraint natal_charts_data_version_matches check (
    jsonb_typeof(chart_data -> 'schemaVersion') = 'number'
    and chart_data ->> 'schemaVersion' = schema_version::text
  )
);

create index if not exists birth_profiles_user_updated_idx
  on public.birth_profiles (user_id, updated_at desc);

create index if not exists natal_charts_user_updated_idx
  on public.natal_charts (user_id, updated_at desc);

create index if not exists natal_charts_profile_idx
  on public.natal_charts (birth_profile_id, calculated_at desc);

create or replace function public.set_dodecanic_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists birth_profiles_set_updated_at on public.birth_profiles;
create trigger birth_profiles_set_updated_at
before update on public.birth_profiles
for each row execute function public.set_dodecanic_updated_at();

drop trigger if exists natal_charts_set_updated_at on public.natal_charts;
create trigger natal_charts_set_updated_at
before update on public.natal_charts
for each row execute function public.set_dodecanic_updated_at();

alter table public.birth_profiles enable row level security;
alter table public.birth_profiles force row level security;
alter table public.natal_charts enable row level security;
alter table public.natal_charts force row level security;

drop policy if exists "Users can read their birth profiles" on public.birth_profiles;
create policy "Users can read their birth profiles"
on public.birth_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their birth profiles" on public.birth_profiles;
create policy "Users can create their birth profiles"
on public.birth_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their birth profiles" on public.birth_profiles;
create policy "Users can update their birth profiles"
on public.birth_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their birth profiles" on public.birth_profiles;
create policy "Users can delete their birth profiles"
on public.birth_profiles for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their natal charts" on public.natal_charts;
create policy "Users can read their natal charts"
on public.natal_charts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their natal charts" on public.natal_charts;
create policy "Users can create their natal charts"
on public.natal_charts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their natal charts" on public.natal_charts;
create policy "Users can update their natal charts"
on public.natal_charts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their natal charts" on public.natal_charts;
create policy "Users can delete their natal charts"
on public.natal_charts for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.birth_profiles, public.natal_charts from anon;
grant select, insert, update, delete on table public.birth_profiles, public.natal_charts to authenticated;
grant all on table public.birth_profiles, public.natal_charts to service_role;
revoke execute on function public.set_dodecanic_updated_at() from public;
