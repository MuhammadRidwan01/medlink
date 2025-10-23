-- Enable RLS (idempotent)
alter table if exists public.profiles enable row level security;

-- Clean slate
drop policy if exists profiles_owner_select on public.profiles;
drop policy if exists profiles_owner_update on public.profiles;
drop policy if exists profiles_owner_insert on public.profiles;

-- Read: hanya pemilik bisa baca
create policy profiles_owner_select
on public.profiles
for select
using (auth.uid() = id);

-- Update: hanya pemilik bisa update; row tetap milik pemilik
create policy profiles_owner_update
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Insert: izinkan pemilik membuat baris miliknya sendiri
create policy profiles_owner_insert
on public.profiles
for insert
with check (auth.uid() = id);
