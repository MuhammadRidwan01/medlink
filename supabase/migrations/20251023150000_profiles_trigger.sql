-- 1) function: buat row profiles setiap ada user baru
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, created_at)
  values (new.id, new.email, split_part(coalesce(new.raw_user_meta_data->>'name', new.email), '@', 1), now())
  on conflict (id) do update
    set email = excluded.email
  ;
  return new;
end;
$$;

-- 2) trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3) (opsional) backfill untuk user lama yang belum punya profile
insert into public.profiles (id, email, name, created_at)
select u.id, u.email, split_part(coalesce(u.raw_user_meta_data->>'name', u.email), '@', 1), now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Catatan RLS:
-- function SECURITY DEFINER bypass RLS untuk insert, jadi tidak perlu policy insert khusus.
