BEGIN;

create schema if not exists commerce;

create extension if not exists "pgcrypto";

create table commerce.products (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text,
    description text,
    price numeric(12,2),
    stock int,
    contraindications text[] default '{}'::text[],
    created_at timestamptz not null default now()
);

create table commerce.carts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    created_at timestamptz not null default now()
);

create table commerce.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    total numeric(12,2),
    status text not null check (status in ('pending','paid','shipped','delivered','canceled')),
    created_at timestamptz not null default now()
);

create table commerce.payments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    order_id uuid references commerce.orders (id),
    status text not null check (status in ('pending','success','failed')),
    channel text,
    snap_token text,
    created_at timestamptz not null default now()
);

create table commerce.cart_items (
    id bigserial primary key,
    cart_id uuid not null references commerce.carts (id) on delete cascade,
    product_id uuid not null references commerce.products (id),
    qty int
);

create table commerce.order_items (
    id bigserial primary key,
    order_id uuid not null references commerce.orders (id) on delete cascade,
    product_id uuid not null references commerce.products (id),
    qty int,
    price numeric(12,2)
);

create index if not exists idx_carts_user_id on commerce.carts (user_id);
create index if not exists idx_carts_created_at on commerce.carts (created_at);
create index if not exists idx_payments_user_id on commerce.payments (user_id);
create index if not exists idx_payments_status on commerce.payments (status);
create index if not exists idx_payments_created_at on commerce.payments (created_at);
create index if not exists idx_orders_user_id on commerce.orders (user_id);
create index if not exists idx_orders_status on commerce.orders (status);
create index if not exists idx_orders_created_at on commerce.orders (created_at);

alter table commerce.products enable row level security;
alter table commerce.carts enable row level security;
alter table commerce.cart_items enable row level security;
alter table commerce.payments enable row level security;
alter table commerce.orders enable row level security;
alter table commerce.order_items enable row level security;

create policy "Public read access" on commerce.products
    for select
    using (true);

create policy "Service role manages products" on commerce.products
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Users manage own carts" on commerce.carts
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Service role manages carts" on commerce.carts
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Users manage own cart items" on commerce.cart_items
    for all
    using (
        exists (
            select 1
            from commerce.carts c
            where c.id = cart_items.cart_id
              and c.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from commerce.carts c
            where c.id = cart_items.cart_id
              and c.user_id = auth.uid()
        )
    );

create policy "Service role manages cart items" on commerce.cart_items
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Users manage own orders" on commerce.orders
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Service role manages orders" on commerce.orders
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Users manage own order items" on commerce.order_items
    for all
    using (
        exists (
            select 1
            from commerce.orders o
            where o.id = order_items.order_id
              and o.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1
            from commerce.orders o
            where o.id = order_items.order_id
              and o.user_id = auth.uid()
        )
    );

create policy "Service role manages order items" on commerce.order_items
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Users manage own payments" on commerce.payments
    for all
    using (user_id = auth.uid())
    with check (
        user_id = auth.uid()
        and (
            order_id is null
            or exists (
                select 1
                from commerce.orders o
                where o.id = payments.order_id
                  and o.user_id = auth.uid()
            )
        )
    );

create policy "Service role manages payments" on commerce.payments
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

COMMIT;
