-- Ratified Dodecanic v1 allows an explicitly unknown birth time. A future
-- provider uses disclosed solar-chart mode; it must never invent an exact time.

alter table public.birth_profiles
  add column if not exists birth_time_known boolean not null default true;

alter table public.birth_profiles
  alter column birth_time drop not null;

alter table public.birth_profiles
  drop constraint if exists birth_profiles_time_mode_consistent;

alter table public.birth_profiles
  add constraint birth_profiles_time_mode_consistent check (
    (birth_time_known and birth_time is not null)
    or (not birth_time_known and birth_time is null)
  );

comment on column public.birth_profiles.birth_time_known is
  'False means the user explicitly selected unknown time; solar-chart mode applies.';

alter table public.natal_charts
  alter column schema_version set default 2;
