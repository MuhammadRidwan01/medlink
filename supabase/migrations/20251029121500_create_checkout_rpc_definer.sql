begin;

drop function if exists public.create_order_from_items(jsonb);

create or replace function public.create_order_from_items(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_payment_id uuid;
  v_channel text := coalesce(p_payload->>'channel', null);
  v_snap_token text := coalesce(p_payload->>'snap_token', null);
  v_items jsonb := coalesce(p_payload->'items', '[]'::jsonb);
  v_total numeric := 0;
begin
  if v_user is null then
    raise exception 'Unauthorized';
  end if;

  if jsonb_typeof(v_items) <> 'array' then
    raise exception 'Invalid items payload';
  end if;

  insert into commerce.orders(user_id, total, status)
  values (v_user, 0, 'pending')
  returning id into v_order_id;

  insert into commerce.order_items(order_id, product_id, qty, price)
  select v_order_id as order_id,
         p.id as product_id,
         (elem->>'quantity')::int as qty,
         p.price as price
  from jsonb_array_elements(v_items) elem
  join commerce.marketplace_products p on p.slug = elem->>'slug';

  select coalesce(sum(oi.qty * coalesce(oi.price,0)),0)
    into v_total
  from commerce.order_items oi
  where oi.order_id = v_order_id;

  update commerce.orders set total = v_total where id = v_order_id;

  insert into commerce.payments(user_id, order_id, status, channel, snap_token)
  values (v_user, v_order_id, 'pending', v_channel, v_snap_token)
  returning id into v_payment_id;

  return jsonb_build_object('order_id', v_order_id, 'payment_id', v_payment_id);
exception when others then
  if v_order_id is not null then
    delete from commerce.order_items where order_id = v_order_id;
    delete from commerce.orders where id = v_order_id;
  end if;
  raise;
end
$$;

grant execute on function public.create_order_from_items(jsonb) to authenticated;

commit;

