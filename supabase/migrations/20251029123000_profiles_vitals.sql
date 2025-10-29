begin;

alter table if exists public.profiles
  add column if not exists height_cm numeric,
  add column if not exists weight_kg numeric;

commit;

