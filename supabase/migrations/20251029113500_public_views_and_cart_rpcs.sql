begin;

-- Expose marketplace products via public view (read-only)
create or replace view public.marketplace_products as
  select id, slug, name, short_description, long_description, price, image_url, categories, tags, rating, rating_count, inventory_status, badges, contraindications, created_at, updated_at
  from commerce.marketplace_products;

grant select on public.marketplace_products to anon, authenticated;

-- Ensure cart for current user; returns cart id
create or replace function public.ensure_cart()
returns uuid
language plpgsql security invoker as $$
declare
  cid uuid;
begin
  select id into cid from commerce.carts where user_id = auth.uid() order by created_at desc limit 1;
  if cid is null then
    insert into commerce.carts(user_id) values (auth.uid()) returning id into cid;
  end if;
  return cid;
end
$$;

-- Detailed cart items for current user
create or replace function public.cart_items_detailed()
returns table(product jsonb, quantity int)
language sql security invoker as $$
  with cid as (
    select public.ensure_cart() as id
  )
  select row_to_json(mp.*)::jsonb as product,
         greatest(1, least(coalesce(ci.qty,1), 10)) as quantity
  from commerce.cart_items ci
  join cid on cid.id = ci.cart_id
  join commerce.marketplace_products mp on mp.id = ci.product_id
$$;

-- Add or increment cart item
create or replace function public.add_to_cart(p_product_id uuid, p_qty int default 1)
returns void
language plpgsql security invoker as $$
declare
  cid uuid;
  existing_qty int;
  new_qty int;
begin
  cid := public.ensure_cart();
  select qty into existing_qty from commerce.cart_items where cart_id = cid and product_id = p_product_id;
  if existing_qty is null then
    insert into commerce.cart_items(cart_id, product_id, qty) values (cid, p_product_id, greatest(1, least(coalesce(p_qty,1),10)));
  else
    new_qty := greatest(1, least(existing_qty + greatest(1, coalesce(p_qty,1)), 10));
    update commerce.cart_items set qty = new_qty where cart_id = cid and product_id = p_product_id;
  end if;
end
$$;

-- Update/set cart item quantity (<=0 deletes)
create or replace function public.update_cart_item(p_product_id uuid, p_qty int)
returns void
language plpgsql security invoker as $$
declare
  cid uuid;
begin
  cid := public.ensure_cart();
  if coalesce(p_qty,0) <= 0 then
    delete from commerce.cart_items where cart_id = cid and product_id = p_product_id;
  else
    insert into commerce.cart_items(cart_id, product_id, qty)
      values (cid, p_product_id, greatest(1, least(p_qty,10)))
    on conflict (cart_id, product_id) do update
      set qty = excluded.qty;
  end if;
end
$$;

-- Remove item from cart
create or replace function public.remove_from_cart(p_product_id uuid)
returns void
language plpgsql security invoker as $$
declare
  cid uuid;
begin
  cid := public.ensure_cart();
  delete from commerce.cart_items where cart_id = cid and product_id = p_product_id;
end
$$;

commit;

