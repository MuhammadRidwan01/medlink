-- Ensure schema exists (no-op if already there)
create schema if not exists commerce;

-- Enable RLS on commerce tables (safe if already enabled)
alter table if exists commerce.products enable row level security;
alter table if exists commerce.carts enable row level security;
alter table if exists commerce.cart_items enable row level security;
alter table if exists commerce.orders enable row level security;
alter table if exists commerce.order_items enable row level security;
alter table if exists commerce.payments enable row level security;

-- Products catalog: public readable
drop policy if exists products_ro on commerce.products;
create policy products_ro on commerce.products for select using (true);

-- Carts: owner-scoped full access
drop policy if exists carts_owner_rw on commerce.carts;
create policy carts_owner_rw on commerce.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cart items: via cart ownership
drop policy if exists cart_items_via_cart on commerce.cart_items;
create policy cart_items_via_cart on commerce.cart_items for all using (
  exists (
    select 1
    from commerce.carts c
    where c.id = cart_id
      and c.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from commerce.carts c
    where c.id = cart_id
      and c.user_id = auth.uid()
  )
);

-- Orders: owner-scoped
drop policy if exists orders_owner_rw on commerce.orders;
create policy orders_owner_rw on commerce.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Order items: via order ownership
drop policy if exists order_items_via_order on commerce.order_items;
create policy order_items_via_order on commerce.order_items for all using (
  exists (
    select 1
    from commerce.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from commerce.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

-- Payments: owner-scoped
drop policy if exists payments_owner_rw on commerce.payments;
create policy payments_owner_rw on commerce.payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
