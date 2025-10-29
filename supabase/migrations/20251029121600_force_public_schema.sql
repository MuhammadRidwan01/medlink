begin;

-- Force all operations to use public schema
-- Drop any conflicting objects in clinical schema
drop table if exists clinical.triage_sessions cascade;
drop table if exists clinical.triage_messages cascade;

-- Ensure tables exist in public schema with correct structure
create table if not exists public.triage_sessions (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references public.profiles(id) on delete cascade,
    doctor_id uuid references auth.users(id) on delete set null,
    status text not null check (status in ('active', 'completed', 'cancelled')) default 'active',
    risk_level text check (risk_level in ('low', 'moderate', 'high', 'emergency')) default 'low',
    summary jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.triage_messages (
    id bigserial primary key,
    session_id uuid not null references public.triage_sessions(id) on delete cascade,
    role text not null check (role in ('user', 'ai', 'doctor')),
    content text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_triage_sessions_patient on public.triage_sessions(patient_id);
create index if not exists idx_triage_sessions_doctor on public.triage_sessions(doctor_id);
create index if not exists idx_triage_sessions_status on public.triage_sessions(status);
create index if not exists idx_triage_sessions_risk_level on public.triage_sessions(risk_level);
create index if not exists idx_triage_sessions_created_at on public.triage_sessions(created_at);

create index if not exists idx_triage_messages_session on public.triage_messages(session_id);
create index if not exists idx_triage_messages_role on public.triage_messages(role);
create index if not exists idx_triage_messages_created_at on public.triage_messages(created_at);

-- Enable RLS
alter table public.triage_sessions enable row level security;
alter table public.triage_messages enable row level security;

-- Recreate policies
drop policy if exists patient_select_triage_sessions on public.triage_sessions;
create policy patient_select_triage_sessions on public.triage_sessions
    for select using (patient_id = auth.uid());

drop policy if exists patient_insert_triage_sessions on public.triage_sessions;
create policy patient_insert_triage_sessions on public.triage_sessions
    for insert with check (patient_id = auth.uid());

drop policy if exists patient_update_triage_sessions on public.triage_sessions;
create policy patient_update_triage_sessions on public.triage_sessions
    for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists doctor_select_triage_sessions on public.triage_sessions;
create policy doctor_select_triage_sessions on public.triage_sessions
    for select using (doctor_id = auth.uid());

drop policy if exists doctor_update_triage_sessions on public.triage_sessions;
create policy doctor_update_triage_sessions on public.triage_sessions
    for update using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

drop policy if exists patient_select_triage_messages on public.triage_messages;
create policy patient_select_triage_messages on public.triage_messages
    for select using (
        exists (
            select 1 from public.triage_sessions s
            where s.id = session_id and s.patient_id = auth.uid()
        )
    );

drop policy if exists patient_insert_triage_messages on public.triage_messages;
create policy patient_insert_triage_messages on public.triage_messages
    for insert with check (
        exists (
            select 1 from public.triage_sessions s
            where s.id = session_id and s.patient_id = auth.uid()
        )
    );

drop policy if exists doctor_select_triage_messages on public.triage_messages;
create policy doctor_select_triage_messages on public.triage_messages
    for select using (
        exists (
            select 1 from public.triage_sessions s
            where s.id = session_id and s.doctor_id = auth.uid()
        )
    );

drop policy if exists doctor_insert_triage_messages on public.triage_messages;
create policy doctor_insert_triage_messages on public.triage_messages
    for insert with check (
        exists (
            select 1 from public.triage_sessions s
            where s.id = session_id and s.doctor_id = auth.uid()
        )
    );

-- Grant permissions
grant usage on schema public to authenticated;
grant select, insert, update on public.triage_sessions to authenticated;
grant select, insert, update on public.triage_messages to authenticated;

-- Set default search path to public for authenticated users
alter role authenticated set search_path = public;

commit;
