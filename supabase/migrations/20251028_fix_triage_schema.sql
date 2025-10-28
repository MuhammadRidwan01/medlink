-- Create clinical schema if missing
create schema if not exists clinical;

-- If your app code references clinical.triage_sessions and clinical.triage_messages,
-- expose views that map to existing public tables so code works without changes.

do $$ begin
  perform 1 from information_schema.tables where table_schema='public' and table_name='triage_sessions';
  if found then
    create or replace view clinical.triage_sessions as
      select * from public.triage_sessions;
  end if;
end $$;

do $$ begin
  perform 1 from information_schema.tables where table_schema='public' and table_name='triage_messages';
  if found then
    create or replace view clinical.triage_messages as
      select * from public.triage_messages;
  end if;
end $$;

-- Ensure basic grants (RLS is on the base tables). Views inherit base perms.
grant usage on schema clinical to authenticated;
grant select, insert, update, delete on all tables in schema clinical to authenticated;
