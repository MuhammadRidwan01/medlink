alter table if exists public.profiles
  add column if not exists phone text,
  add column if not exists address text;

