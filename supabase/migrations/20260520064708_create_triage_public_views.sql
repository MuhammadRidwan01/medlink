begin;

-- Create views in public schema to maintain compatibility with application code
-- while the underlying tables reside in the clinical schema.
-- security_invoker = true ensures that RLS policies on the underlying tables are respected.

create or replace view public.triage_sessions with (security_invoker = true) as
    select * from clinical.triage_sessions;

create or replace view public.triage_messages with (security_invoker = true) as
    select * from clinical.triage_messages;

-- Grant access to the views for authenticated and anon users
grant select, insert, update, delete on public.triage_sessions to anon, authenticated;
grant select, insert, update, delete on public.triage_messages to anon, authenticated;

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';

commit;
