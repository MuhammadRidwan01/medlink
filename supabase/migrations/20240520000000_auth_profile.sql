create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    name text,
    dob date,
    sex text,
    blood_type text,
    created_at timestamptz default now()
);

create table if not exists public.allergies (
    id bigserial primary key,
    user_id uuid references public.profiles (id) on delete cascade,
    substance text not null,
    reaction text,
    severity text,
    created_at timestamptz default now()
);

create table if not exists public.meds (
    id bigserial primary key,
    user_id uuid references public.profiles (id) on delete cascade,
    name text not null,
    strength text,
    frequency text,
    status text not null default 'active',
    created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.allergies enable row level security;
alter table public.meds enable row level security;

create policy "Users can view own profile"
    on public.profiles
    for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "Users can view own allergies"
    on public.allergies
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own allergies"
    on public.allergies
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update own allergies"
    on public.allergies
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own allergies"
    on public.allergies
    for delete
    using (auth.uid() = user_id);

create policy "Users can view own medications"
    on public.meds
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own medications"
    on public.meds
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update own medications"
    on public.meds
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own medications"
    on public.meds
    for delete
    using (auth.uid() = user_id);

do $$
declare
    target_user auth.users%rowtype;
begin
    select *
      into target_user
      from auth.users
      order by created_at
      limit 1;

    if target_user.id is not null then
        insert into public.profiles (id, email, name, dob, sex, blood_type)
        values (
            target_user.id,
            target_user.email,
            coalesce(target_user.raw_user_meta_data->>'full_name', 'Demo User'),
            date '1990-01-01',
            'unspecified',
            'O+'
        )
        on conflict (id) do nothing;

        insert into public.allergies (user_id, substance, reaction, severity)
        values
            (target_user.id, 'Peanuts', 'Anaphylaxis', 'severe'),
            (target_user.id, 'Penicillin', 'Rash', 'moderate')
        on conflict do nothing;

        insert into public.meds (user_id, name, strength, frequency, status)
        values
            (target_user.id, 'Lisinopril', '10 mg', 'once daily', 'active'),
            (target_user.id, 'Metformin', '500 mg', 'twice daily', 'active')
        on conflict do nothing;
    end if;
end $$;
