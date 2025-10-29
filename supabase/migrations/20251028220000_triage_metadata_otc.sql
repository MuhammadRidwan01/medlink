-- Migration: Add indexes and documentation for OTC metadata in triage_messages
-- Date: 2025-10-28
-- Purpose: Support storing OTC recommendations and appointment data in message metadata

begin;

-- Add index for querying messages by metadata type (OTC, appointment, etc.)
create index if not exists triage_messages_metadata_type_idx 
  on public.triage_messages using gin ((metadata -> 'type'));

-- Add index for querying OTC suggestions
create index if not exists triage_messages_metadata_suggestions_idx 
  on public.triage_messages using gin ((metadata -> 'suggestions'));

-- Add comment to document metadata structure
comment on column public.triage_messages.metadata is 
'JSONB metadata for messages. Supported structures:
- Regular AI message: { "risk_level": "low|moderate|high|emergency", "red_flags": ["flag1"] }
- OTC recommendation: { "type": "otc", "suggestions": [{ "name": "...", "strength": "...", "dose": "...", "frequency": "...", "duration": "...", "notes": "...", "rationale": "..." }] }
- Appointment: { "type": "appointment" }
- User message: { "client_id": "msg-user-123" }';

-- Ensure RLS policies allow inserting messages with metadata
-- (Already covered by existing policies, but adding comment for clarity)
comment on policy patient_insert_triage_messages on public.triage_messages is
'Allows patients to insert messages (including OTC/appointment metadata) into their own triage sessions';

commit;
