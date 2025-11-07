begin;

drop function if exists public.process_payment_webhook(uuid, text);

create or replace function public.process_payment_webhook(
    in_order_id uuid,
    in_outcome text
)
returns jsonb
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
    payment_id uuid;
    normalized_outcome text := lower(in_outcome);
begin
    if in_order_id is null or normalized_outcome is null then
        raise exception using
            errcode = '22023',
            message = 'invalid_input',
            detail = 'order_id and outcome are required';
    end if;

    if normalized_outcome not in ('success', 'failed') then
        raise exception using
            errcode = '22023',
            message = 'invalid_outcome',
            detail = 'outcome must be success or failed';
    end if;

    select id
      into payment_id
      from payments
     where order_id = in_order_id
     order by created_at desc
     limit 1;

    if not found then
        raise exception using
            errcode = 'P0002',
            message = 'payment_not_found',
            detail = 'No payment found for order';
    end if;

    update payments
       set status = normalized_outcome
     where id = payment_id;

    if normalized_outcome = 'success' then
        update orders
           set status = 'paid'
         where id = in_order_id;
    end if;

    return jsonb_build_object(
        'payment_id', payment_id,
        'order_id', in_order_id,
        'status', normalized_outcome
    );
end;
$$;

grant execute on function public.process_payment_webhook(uuid, text) to service_role;

commit;
