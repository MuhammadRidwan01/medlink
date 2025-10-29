begin;

-- Allow authenticated role to access commerce schema objects used by cart RPCs
grant usage on schema commerce to authenticated;
grant select, insert, update, delete on table commerce.carts to authenticated;
grant select, insert, update, delete on table commerce.cart_items to authenticated;
grant select, insert, update, delete on table commerce.orders to authenticated;
grant select, insert, update, delete on table commerce.order_items to authenticated;
grant select, insert, update, delete on table commerce.payments to authenticated;
grant select on table commerce.marketplace_products to authenticated;

-- Ensure ON CONFLICT target exists for (cart_id, product_id)
create unique index if not exists uq_cart_items_cart_product on commerce.cart_items(cart_id, product_id);

commit;
