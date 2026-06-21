-- ─── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  language text not null default 'es',
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Outfits ─────────────────────────────────────────────────────────────────
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  image_uri text not null,
  exercise_type text not null,
  score jsonb not null,
  week_key text not null,
  created_at timestamptz not null default now()
);

alter table public.outfits enable row level security;

create policy "Users manage their own outfits"
  on public.outfits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index outfits_user_id_idx on public.outfits (user_id);
create index outfits_week_key_idx on public.outfits (user_id, week_key);
