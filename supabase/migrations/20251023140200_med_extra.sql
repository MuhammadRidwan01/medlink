-- medications master
create table if not exists public.medications(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  generic_name text,
  atc_code text,
  created_at timestamptz default now()
);

-- pharmacies directory (for future roles/workflows)
create table if not exists public.pharmacies(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  created_at timestamptz default now()
);

-- simple interaction pairs (demo)
create table if not exists public.drug_interactions(
  id bigserial primary key,
  a text not null,
  b text not null,
  severity text check (severity in ('low','moderate','high')) not null,
  note text
);

-- RLS minimal (read-only public for reference tables, locked write)
alter table public.medications enable row level security;
alter table public.pharmacies enable row level security;
alter table public.drug_interactions enable row level security;

create policy meds_ro on public.medications for select using (true);
create policy pharm_ro on public.pharmacies for select using (true);
create policy di_ro on public.drug_interactions for select using (true);

-- deny writes by default (no insert/update/delete policies)
-- seed optional
-- insert into public.medications(name,generic_name,atc_code) values ('Amoxicillin','amoxicillin','J01CA04');
