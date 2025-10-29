-- Align cart/order item product FKs to marketplace_products
begin;

alter table if exists commerce.cart_items
  drop constraint if exists cart_items_product_id_fkey;

alter table if exists commerce.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table if exists commerce.cart_items
  add constraint cart_items_product_id_fkey
  foreign key (product_id) references commerce.marketplace_products(id) on update cascade on delete restrict;

alter table if exists commerce.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references commerce.marketplace_products(id) on update cascade on delete restrict;

commit;

