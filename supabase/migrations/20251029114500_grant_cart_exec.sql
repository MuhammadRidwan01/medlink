begin;

grant usage on schema public to anon, authenticated;
grant execute on function public.ensure_cart to anon, authenticated;
grant execute on function public.cart_items_detailed to anon, authenticated;
grant execute on function public.add_to_cart(uuid, int) to authenticated;
grant execute on function public.update_cart_item(uuid, int) to authenticated;
grant execute on function public.remove_from_cart(uuid) to authenticated;

commit;

