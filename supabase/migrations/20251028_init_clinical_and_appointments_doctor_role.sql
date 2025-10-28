-- Migration: init clinical schema, doctors, prescriptions, orders, appointments, and RLS
create schema if not exists clinical;

create table if not exists clinical.doctors (
  id uuid primary key references auth.users(id) on delete cascade,
  specialty text,
  license_no text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table clinical.doctors enable row level security;

drop policy if exists doctors_select_authenticated on clinical.doctors;
create policy doctors_select_authenticated on clinical.doctors for select to authenticated using (true);
drop policy if exists doctors_upsert_self on clinical.doctors;
create policy doctors_upsert_self on clinical.doctors for insert to authenticated with check (id = auth.uid());
drop policy if exists doctors_update_self on clinical.doctors;
create policy doctors_update_self on clinical.doctors for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table if not exists clinical.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete restrict,
  status text not null check (status in ('draft','awaiting_approval','approved','rejected')) default 'draft',
  created_at timestamptz not null default now()
);
alter table clinical.prescriptions enable row level security;

create table if not exists clinical.prescription_items (
  id bigserial primary key,
  prescription_id uuid not null references clinical.prescriptions(id) on delete cascade,
  name text,
  strength text,
  frequency text,
  duration text,
  notes text
);
alter table clinical.prescription_items enable row level security;

create table if not exists clinical.clinical_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete restrict,
  type text not null check (type in ('lab','imaging')),
  name text,
  priority text,
  note text,
  status text not null default 'pending' check (status in ('pending','completed','canceled')),
  created_at timestamptz not null default now()
);
alter table clinical.clinical_orders enable row level security;

create table if not exists clinical.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','canceled')),
  created_at timestamptz not null default now()
);
alter table clinical.appointments enable row level security;

create index if not exists idx_prescriptions_user on clinical.prescriptions(user_id);
create index if not exists idx_prescriptions_doctor on clinical.prescriptions(doctor_id);
create index if not exists idx_items_prescription on clinical.prescription_items(prescription_id);
create index if not exists idx_orders_patient on clinical.clinical_orders(patient_id);
create index if not exists idx_orders_doctor on clinical.clinical_orders(doctor_id);
create index if not exists idx_appointments_patient on clinical.appointments(patient_id);
create index if not exists idx_appointments_doctor on clinical.appointments(doctor_id);
create index if not exists idx_appointments_start on clinical.appointments(starts_at);

drop policy if exists rx_select_patient on clinical.prescriptions;
create policy rx_select_patient on clinical.prescriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists rx_select_doctor on clinical.prescriptions;
create policy rx_select_doctor on clinical.prescriptions for select to authenticated using (doctor_id = auth.uid());
drop policy if exists rx_insert_doctor on clinical.prescriptions;
create policy rx_insert_doctor on clinical.prescriptions for insert to authenticated with check (
  doctor_id = auth.uid() and exists (select 1 from clinical.doctors d where d.id = auth.uid() and d.is_active)
);
drop policy if exists rx_update_doctor on clinical.prescriptions;
create policy rx_update_doctor on clinical.prescriptions for update to authenticated using (
  doctor_id = auth.uid() and exists (select 1 from clinical.doctors d where d.id = auth.uid() and d.is_active)
) with check (doctor_id = auth.uid());

drop policy if exists rx_items_select_related on clinical.prescription_items;
create policy rx_items_select_related on clinical.prescription_items for select to authenticated using (
  exists (select 1 from clinical.prescriptions p where p.id = prescription_id and (p.user_id = auth.uid() or p.doctor_id = auth.uid()))
);
drop policy if exists rx_items_modify_doctor on clinical.prescription_items;
create policy rx_items_modify_doctor on clinical.prescription_items for insert to authenticated with check (
  exists (select 1 from clinical.prescriptions p where p.id = prescription_id and p.doctor_id = auth.uid() and exists (select 1 from clinical.doctors d where d.id = auth.uid() and d.is_active))
);
drop policy if exists rx_items_update_doctor on clinical.prescription_items;
create policy rx_items_update_doctor on clinical.prescription_items for update to authenticated using (
  exists (select 1 from clinical.prescriptions p where p.id = prescription_id and p.doctor_id = auth.uid())
) with check (true);

drop policy if exists orders_select_patient on clinical.clinical_orders;
create policy orders_select_patient on clinical.clinical_orders for select to authenticated using (patient_id = auth.uid());
drop policy if exists orders_select_doctor on clinical.clinical_orders;
create policy orders_select_doctor on clinical.clinical_orders for select to authenticated using (doctor_id = auth.uid());
drop policy if exists orders_insert_doctor on clinical.clinical_orders;
create policy orders_insert_doctor on clinical.clinical_orders for insert to authenticated with check (
  doctor_id = auth.uid() and exists (select 1 from clinical.doctors d where d.id = auth.uid() and d.is_active)
);
drop policy if exists orders_update_doctor on clinical.clinical_orders;
create policy orders_update_doctor on clinical.clinical_orders for update to authenticated using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists appt_select_patient on clinical.appointments;
create policy appt_select_patient on clinical.appointments for select to authenticated using (patient_id = auth.uid());
drop policy if exists appt_select_doctor on clinical.appointments;
create policy appt_select_doctor on clinical.appointments for select to authenticated using (doctor_id = auth.uid());
drop policy if exists appt_insert_doctor on clinical.appointments;
create policy appt_insert_doctor on clinical.appointments for insert to authenticated with check (
  doctor_id = auth.uid() and exists (select 1 from clinical.doctors d where d.id = auth.uid() and d.is_active)
);
drop policy if exists appt_update_doctor on clinical.appointments;
create policy appt_update_doctor on clinical.appointments for update to authenticated using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
