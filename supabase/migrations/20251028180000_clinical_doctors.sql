-- Create clinical.doctors with RLS so RPCs and grants work
create schema if not exists clinical;

create table if not exists clinical.doctors (
  id uuid primary key,
  specialty text not null,
  license_no text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helpful index for lookups by activity
create index if not exists doctors_is_active_idx on clinical.doctors(is_active);

-- Ensure a single license per doctor (adjust if multi-license is needed)
create unique index if not exists doctors_license_no_uidx on clinical.doctors(license_no);

-- RLS
alter table clinical.doctors enable row level security;

-- Any authenticated user can read active doctors
drop policy if exists doctors_ro on clinical.doctors;
create policy doctors_ro on clinical.doctors
  for select
  to authenticated
  using (is_active);

-- Owners can manage their own row (insert/update)
drop policy if exists doctors_owner_rw on clinical.doctors;
create policy doctors_owner_rw on clinical.doctors
  for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Service role full access
drop policy if exists doctors_service_all on clinical.doctors;
create policy doctors_service_all on clinical.doctors
  for all
  to service_role
  using (true)
  with check (true);

-- Add to realtime publication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    EXECUTE 'alter publication supabase_realtime add table clinical.doctors';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore if already added
  NULL;
END $$;

-- Old row needed for update payloads if consuming realtime changes
alter table clinical.doctors replica identity full;