BEGIN;

create table if not exists commerce.marketplace_products (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    short_description text,
    long_description text,
    price numeric(12,2) not null default 0,
    image_url text,
    categories text[] not null default '{}'::text[],
    tags text[] not null default '{}'::text[],
    rating numeric(3,2) not null default 0,
    rating_count int not null default 0,
    inventory_status text not null default 'in-stock' check (inventory_status in ('in-stock','low-stock','out-of-stock')),
    badges text[] not null default '{}'::text[],
    contraindications jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_products_created_at on commerce.marketplace_products (created_at desc);
create index if not exists idx_marketplace_products_categories on commerce.marketplace_products using gin (categories);
create index if not exists idx_marketplace_products_tags on commerce.marketplace_products using gin (tags);

alter table commerce.marketplace_products enable row level security;

drop policy if exists "Public read marketplace products" on commerce.marketplace_products;
create policy "Public read marketplace products" on commerce.marketplace_products
    for select
    using (true);

drop policy if exists "Service manages marketplace products" on commerce.marketplace_products;
create policy "Service manages marketplace products" on commerce.marketplace_products
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

COMMIT;
