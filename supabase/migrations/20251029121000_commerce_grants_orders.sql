begin;

grant usage on schema commerce to authenticated;
grant select, insert, update, delete on table commerce.orders to authenticated;
grant select, insert, update, delete on table commerce.order_items to authenticated;
grant select, insert, update, delete on table commerce.payments to authenticated;

commit;

