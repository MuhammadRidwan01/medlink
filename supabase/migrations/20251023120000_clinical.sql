-- Clinical schema with RLS policies
-- Creates: prescriptions, prescription_items, approvals, clinical_orders
-- Adds indexes and RLS policies per requirements

-- Ensure needed extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Schema
create schema if not exists clinical;

-- Tables
create table if not exists clinical.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  doctor_id uuid not null,
  status text not null check (status in ('draft','awaiting_approval','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists clinical.prescription_items (
  id bigserial primary key,
  prescription_id uuid not null references clinical.prescriptions(id) on delete cascade,
  name text,
  strength text,
  frequency text,
  duration text,
  notes text
);

create table if not exists clinical.approvals (
  id bigserial primary key,
  prescription_id uuid not null references clinical.prescriptions(id) on delete cascade,
  role text not null check (role in ('pharmacy')),
  status text not null check (status in ('awaiting','approved','rejected')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists clinical.clinical_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null,
  doctor_id uuid not null,
  type text not null check (type in ('lab','imaging')),
  name text,
  priority text,
  note text,
  status text not null check (status in ('pending','completed','canceled')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists prescriptions_user_id_idx on clinical.prescriptions (user_id);
create index if not exists prescriptions_doctor_id_idx on clinical.prescriptions (doctor_id);
create index if not exists prescriptions_status_idx on clinical.prescriptions (status);

create index if not exists prescription_items_prescription_id_idx on clinical.prescription_items (prescription_id);

create index if not exists approvals_prescription_id_idx on clinical.approvals (prescription_id);
create index if not exists approvals_status_idx on clinical.approvals (status);

create index if not exists clinical_orders_patient_id_idx on clinical.clinical_orders (patient_id);
create index if not exists clinical_orders_doctor_id_idx on clinical.clinical_orders (doctor_id);
create index if not exists clinical_orders_status_idx on clinical.clinical_orders (status);

-- Row Level Security
alter table clinical.prescriptions enable row level security;
alter table clinical.prescription_items enable row level security;
alter table clinical.approvals enable row level security;
alter table clinical.clinical_orders enable row level security;

-- Realtime: ensure tables are part of supabase publication and updates include old row
do $$
begin
  -- Add tables to realtime publication (idempotent)
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table clinical.prescriptions';
    execute 'alter publication supabase_realtime add table clinical.prescription_items';
    execute 'alter publication supabase_realtime add table clinical.approvals';
    execute 'alter publication supabase_realtime add table clinical.clinical_orders';
  end if;
exception when others then
  -- ignore if already added
  null;
end$$;

-- For UPDATE old-row visibility in realtime payloads
alter table clinical.prescriptions replica identity full;
alter table clinical.clinical_orders replica identity full;

-- Policies: prescriptions
-- Patient (user_id) can read own prescriptions
drop policy if exists patient_read_prescriptions on clinical.prescriptions;
create policy patient_read_prescriptions
on clinical.prescriptions
for select
using (user_id = auth.uid());

-- Doctor (doctor_id) can read drafts
drop policy if exists doctor_read_draft_prescriptions on clinical.prescriptions;
create policy doctor_read_draft_prescriptions
on clinical.prescriptions
for select
using (doctor_id = auth.uid() and status = 'draft');

-- Doctor can insert drafts they own
drop policy if exists doctor_insert_draft_prescriptions on clinical.prescriptions;
create policy doctor_insert_draft_prescriptions
on clinical.prescriptions
for insert
with check (doctor_id = auth.uid() and status = 'draft');

-- Doctor can update/delete drafts they own
drop policy if exists doctor_write_draft_prescriptions on clinical.prescriptions;
create policy doctor_write_draft_prescriptions
on clinical.prescriptions
for update
using (doctor_id = auth.uid() and status = 'draft')
with check (doctor_id = auth.uid() and status = 'draft');

drop policy if exists doctor_delete_draft_prescriptions on clinical.prescriptions;
create policy doctor_delete_draft_prescriptions
on clinical.prescriptions
for delete
using (doctor_id = auth.uid() and status = 'draft');

-- Pharmacy role can read awaiting_approval prescriptions
drop policy if exists pharmacy_read_awaiting_prescriptions on clinical.prescriptions;
create policy pharmacy_read_awaiting_prescriptions
on clinical.prescriptions
for select
using ((auth.jwt() ->> 'role') = 'pharmacy' and status = 'awaiting_approval');

-- Policies: prescription_items
-- Patient can read items of their prescriptions
drop policy if exists patient_read_prescription_items on clinical.prescription_items;
create policy patient_read_prescription_items
on clinical.prescription_items
for select
using (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.user_id = auth.uid()
));

-- Doctor can read items of draft prescriptions they own
drop policy if exists doctor_read_draft_prescription_items on clinical.prescription_items;
create policy doctor_read_draft_prescription_items
on clinical.prescription_items
for select
using (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.doctor_id = auth.uid() and p.status = 'draft'
));

-- Doctor can insert/update/delete items for draft prescriptions they own
drop policy if exists doctor_insert_draft_prescription_items on clinical.prescription_items;
create policy doctor_insert_draft_prescription_items
on clinical.prescription_items
for insert
with check (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.doctor_id = auth.uid() and p.status = 'draft'
));

drop policy if exists doctor_update_draft_prescription_items on clinical.prescription_items;
create policy doctor_update_draft_prescription_items
on clinical.prescription_items
for update
using (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.doctor_id = auth.uid() and p.status = 'draft'
))
with check (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.doctor_id = auth.uid() and p.status = 'draft'
));

drop policy if exists doctor_delete_draft_prescription_items on clinical.prescription_items;
create policy doctor_delete_draft_prescription_items
on clinical.prescription_items
for delete
using (exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.doctor_id = auth.uid() and p.status = 'draft'
));

-- Pharmacy role can read items for prescriptions awaiting approval
drop policy if exists pharmacy_read_prescription_items_for_approval on clinical.prescription_items;
create policy pharmacy_read_prescription_items_for_approval
on clinical.prescription_items
for select
using ((auth.jwt() ->> 'role') = 'pharmacy' and exists (
  select 1 from clinical.prescriptions p
  where p.id = prescription_id and p.status = 'awaiting_approval'
));

-- Policies: approvals
-- Patient and Doctor can read approvals for their prescriptions; Pharmacy can also read
drop policy if exists read_approvals_by_stakeholders on clinical.approvals;
create policy read_approvals_by_stakeholders
on clinical.approvals
for select
using (
  (auth.jwt() ->> 'role') = 'pharmacy'
  or exists (
    select 1 from clinical.prescriptions p
    where p.id = prescription_id and (p.user_id = auth.uid() or p.doctor_id = auth.uid())
  )
);

-- Pharmacy role can update approval status
drop policy if exists pharmacy_update_approvals on clinical.approvals;
create policy pharmacy_update_approvals
on clinical.approvals
for update
using ((auth.jwt() ->> 'role') = 'pharmacy')
with check ((auth.jwt() ->> 'role') = 'pharmacy');

-- Policies: clinical_orders
-- Patient reads their own orders
drop policy if exists patient_read_own_orders on clinical.clinical_orders;
create policy patient_read_own_orders
on clinical.clinical_orders
for select
using (patient_id = auth.uid());

-- Doctor can read own orders
drop policy if exists doctor_read_own_orders on clinical.clinical_orders;
create policy doctor_read_own_orders
on clinical.clinical_orders
for select
using (doctor_id = auth.uid());

-- Doctor writes (insert/update/delete) orders they own
drop policy if exists doctor_insert_orders on clinical.clinical_orders;
create policy doctor_insert_orders
on clinical.clinical_orders
for insert
with check (doctor_id = auth.uid());

drop policy if exists doctor_update_orders on clinical.clinical_orders;
create policy doctor_update_orders
on clinical.clinical_orders
for update
using (doctor_id = auth.uid())
with check (doctor_id = auth.uid());

drop policy if exists doctor_delete_orders on clinical.clinical_orders;
create policy doctor_delete_orders
on clinical.clinical_orders
for delete
using (doctor_id = auth.uid());
