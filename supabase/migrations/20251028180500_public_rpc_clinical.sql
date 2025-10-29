-- Public RPC for clinical doctors to avoid exposing non-public schema via PostgREST db_schemas
-- Grants and functions are safe without superuser privileges

-- Allow roles to resolve the clinical schema objects
grant usage on schema clinical to authenticated, service_role;

-- Ensure table privileges; RLS still controls row access
grant select, insert, update on clinical.doctors to authenticated, service_role;

-- Function: get_doctors()
-- Returns visible doctors rows under RLS of clinical.doctors
create or replace function public.get_doctors()
returns setof clinical.doctors
language sql
security invoker
set search_path = public, clinical
as $$
  select id, specialty, license_no, is_active, created_at
  from clinical.doctors;
$$;
grant execute on function public.get_doctors() to authenticated, service_role;

-- Function: upsert_doctor(specialty, license_no)
-- Uses auth.uid() so caller can't spoof user id
create or replace function public.upsert_doctor(specialty text, license_no text)
returns clinical.doctors
language plpgsql
security invoker
set search_path = public, clinical
as $$
declare
  v_uid uuid := auth.uid();
  v_row clinical.doctors;
begin
  if v_uid is null then
    raise exception 'Unauthorized' using errcode = '28P01';
  end if;

  insert into clinical.doctors as d (id, specialty, license_no, is_active)
  values (v_uid, upsert_doctor.specialty, upsert_doctor.license_no, true)
  on conflict (id) do update set
    specialty = excluded.specialty,
    license_no = excluded.license_no,
    is_active = true
  returning d.* into v_row;

  return v_row;
end;
$$;
grant execute on function public.upsert_doctor(text, text) to authenticated, service_role;
