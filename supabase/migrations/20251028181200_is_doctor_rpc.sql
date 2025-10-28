-- Public RPC: is_doctor() -> boolean
-- Returns true if current authenticated user has an active doctor row
create or replace function public.is_doctor()
returns boolean
language sql
security invoker
set search_path = public, clinical
as $$
  select exists(
    select 1 from clinical.doctors d
    where d.id = auth.uid() and d.is_active
  );
$$;

grant execute on function public.is_doctor() to authenticated, service_role;
