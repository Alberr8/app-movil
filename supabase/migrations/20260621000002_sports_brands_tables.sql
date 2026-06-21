-- ─── Remove JSON columns from profiles (replaced by proper tables) ────────────
alter table public.profiles
  drop column if exists fav_sports,
  drop column if exists fav_brands;

-- ─── Sports reference table ───────────────────────────────────────────────────
create table public.sports (
  id serial primary key,
  key text not null unique,
  label_es text not null,
  label_en text not null,
  icon text not null,
  category text not null
);

insert into public.sports (key, label_es, label_en, icon, category) values
  ('running',      'Running',         'Running',       'run',               'endurance'),
  ('cycling',      'Ciclismo',        'Cycling',       'bike',              'endurance'),
  ('swimming',     'Natación',        'Swimming',      'swim',              'endurance'),
  ('triathlon',    'Triatlón',        'Triathlon',     'triforce',          'endurance'),
  ('gym',          'Gimnasio',        'Gym',           'weight-lifter',     'strength'),
  ('crossfit',     'CrossFit',        'CrossFit',      'dumbbell',          'strength'),
  ('boxing',       'Boxeo',           'Boxing',        'boxing-glove',      'strength'),
  ('martial_arts', 'Artes Marciales', 'Martial Arts',  'karate',            'strength'),
  ('padel',        'Pádel',           'Padel',         'tennis',            'court'),
  ('tennis',       'Tenis',           'Tennis',        'tennis-ball',       'court'),
  ('golf',         'Golf',            'Golf',          'golf',              'court'),
  ('football',     'Fútbol',          'Football',      'soccer',            'team'),
  ('basketball',   'Baloncesto',      'Basketball',    'basketball',        'team'),
  ('rugby',        'Rugby',           'Rugby',         'rugby',             'team'),
  ('volleyball',   'Voleibol',        'Volleyball',    'volleyball',        'team'),
  ('baseball',     'Béisbol',         'Baseball',      'baseball',          'team'),
  ('hiking',       'Senderismo',      'Hiking',        'hiking',            'outdoor'),
  ('skiing',       'Esquí',           'Skiing',        'ski',               'outdoor'),
  ('surf',         'Surf',            'Surf',          'surfing',           'outdoor'),
  ('climbing',     'Escalada',        'Climbing',      'image-filter-hdr',  'outdoor'),
  ('horse_riding', 'Equitación',      'Horse Riding',  'horse',             'outdoor'),
  ('skateboard',   'Skateboard',      'Skateboard',    'skateboard',        'outdoor'),
  ('yoga',         'Yoga',            'Yoga',          'yoga',              'mind_body'),
  ('pilates',      'Pilates',         'Pilates',       'human-handsup',     'mind_body'),
  ('dance',        'Danza',           'Dance',         'dance-ballroom',    'mind_body');

-- ─── Brands reference table ───────────────────────────────────────────────────
create table public.brands (
  id serial primary key,
  key text not null unique,
  label text not null,
  emoji text not null,
  sport_categories text[] not null default '{}'
);

insert into public.brands (key, label, emoji, sport_categories) values
  ('nike',        'Nike',          '👟', '{endurance,strength,court,team}'),
  ('adidas',      'Adidas',        '🔱', '{endurance,strength,court,team}'),
  ('lululemon',   'Lululemon',     '🧘', '{endurance,strength,mind_body}'),
  ('gymshark',    'Gymshark',      '🦈', '{strength}'),
  ('underarmour', 'Under Armour',  '🛡️', '{strength,team,endurance}'),
  ('newbalance',  'New Balance',   '🏃', '{endurance,team}'),
  ('asics',       'ASICS',         '⚡', '{endurance,court}'),
  ('onrunning',   'On Running',    '☁️', '{endurance}'),
  ('salomon',     'Salomon',       '🏔️', '{outdoor,endurance}'),
  ('patagonia',   'Patagonia',     '🌿', '{outdoor}'),
  ('arcteryx',    'Arc''teryx',    '🦅', '{outdoor}'),
  ('puma',        'Puma',          '🐆', '{endurance,strength,team}'),
  ('reebok',      'Reebok',        '💪', '{strength,endurance}'),
  ('northface',   'The North Face','⛰️', '{outdoor}'),
  ('decathlon',   'Decathlon',     '🏅', '{endurance,strength,outdoor,team,court}'),
  ('babolat',     'Babolat',       '🎾', '{court}'),
  ('bullpadel',   'Bullpadel',     '🏓', '{court}'),
  ('aloyoga',     'Alo Yoga',      '🌸', '{mind_body}');

-- ─── User favourite sports (junction) ────────────────────────────────────────
create table public.user_sports (
  user_id uuid references auth.users on delete cascade not null,
  sport_id integer references public.sports on delete cascade not null,
  primary key (user_id, sport_id)
);

alter table public.user_sports enable row level security;

create policy "Users manage their own sport favourites"
  on public.user_sports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── User favourite brands (junction) ────────────────────────────────────────
create table public.user_brands (
  user_id uuid references auth.users on delete cascade not null,
  brand_id integer references public.brands on delete cascade not null,
  primary key (user_id, brand_id)
);

alter table public.user_brands enable row level security;

create policy "Users manage their own brand favourites"
  on public.user_brands for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
