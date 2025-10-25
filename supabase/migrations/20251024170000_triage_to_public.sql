begin;

-- Move triage tables from clinical schema into public for PostgREST access
alter table if exists clinical.triage_messages drop constraint if exists triage_messages_session_id_fkey;

alter table if exists clinical.triage_sessions set schema public;
alter table if exists clinical.triage_messages set schema public;

alter table public.triage_messages
  add constraint triage_messages_session_id_fkey
  foreign key (session_id) references public.triage_sessions(id) on delete cascade;

-- Ensure RLS is enabled on the tables
alter table public.triage_sessions enable row level security;
alter table public.triage_messages enable row level security;

-- Recreate RLS policies on triage_sessions
drop policy if exists patient_select_triage_sessions on public.triage_sessions;
create policy patient_select_triage_sessions
  on public.triage_sessions
  for select
  using (patient_id = auth.uid());

drop policy if exists patient_insert_triage_sessions on public.triage_sessions;
create policy patient_insert_triage_sessions
  on public.triage_sessions
  for insert
  with check (patient_id = auth.uid());

drop policy if exists patient_update_triage_sessions on public.triage_sessions;
create policy patient_update_triage_sessions
  on public.triage_sessions
  for update
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

drop policy if exists doctor_select_triage_sessions on public.triage_sessions;
create policy doctor_select_triage_sessions
  on public.triage_sessions
  for select
  using (doctor_id = auth.uid());

drop policy if exists doctor_update_triage_sessions on public.triage_sessions;
create policy doctor_update_triage_sessions
  on public.triage_sessions
  for update
  using (doctor_id = auth.uid())
  with check (doctor_id = auth.uid());

-- Recreate RLS policies on triage_messages
drop policy if exists patient_select_triage_messages on public.triage_messages;
create policy patient_select_triage_messages
  on public.triage_messages
  for select
  using (
    exists (
      select 1 from public.triage_sessions s
      where s.id = session_id and s.patient_id = auth.uid()
    )
  );

drop policy if exists patient_insert_triage_messages on public.triage_messages;
create policy patient_insert_triage_messages
  on public.triage_messages
  for insert
  with check (
    exists (
      select 1 from public.triage_sessions s
      where s.id = session_id and s.patient_id = auth.uid()
    )
  );

drop policy if exists doctor_select_triage_messages on public.triage_messages;
create policy doctor_select_triage_messages
  on public.triage_messages
  for select
  using (
    exists (
      select 1 from public.triage_sessions s
      where s.id = session_id and s.doctor_id = auth.uid()
    )
  );

drop policy if exists doctor_insert_triage_messages on public.triage_messages;
create policy doctor_insert_triage_messages
  on public.triage_messages
  for insert
  with check (
    exists (
      select 1 from public.triage_sessions s
      where s.id = session_id and s.doctor_id = auth.uid()
    )
  );

-- Ensure authenticated users can access the tables (with RLS enforcement)
grant usage on schema public to authenticated;
grant select, insert, update on public.triage_sessions to authenticated;
grant select, insert, update on public.triage_messages to authenticated;

commit;
