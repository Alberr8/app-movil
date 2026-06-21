alter table public.profiles
  add column if not exists fav_sports jsonb not null default '[]'::jsonb,
  add column if not exists fav_brands jsonb not null default '[]'::jsonb;
