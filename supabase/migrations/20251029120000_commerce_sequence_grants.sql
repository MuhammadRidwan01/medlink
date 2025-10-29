begin;

-- Grant access to sequences used by commerce tables (e.g., cart_items.id bigserial)
grant usage, select on all sequences in schema commerce to authenticated;

commit;

