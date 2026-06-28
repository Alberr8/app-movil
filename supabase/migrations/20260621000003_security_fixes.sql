-- ─── RLS on reference tables (read-only for everyone) ────────────────────────
-- Without this, anyone with the anon key can INSERT/UPDATE/DELETE sports & brands.
alter table public.sports enable row level security;
create policy "Public read sports"
  on public.sports for select using (true);

alter table public.brands enable row level security;
create policy "Public read brands"
  on public.brands for select using (true);

-- ─── AI call log (rate limiting for Edge Functions) ───────────────────────────
create table public.ai_call_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  function_name text not null,
  called_at timestamptz not null default now()
);

alter table public.ai_call_log enable row level security;
-- No user-facing policies: only the service role key (Edge Functions) can write here.

create index ai_call_log_rate_limit_idx
  on public.ai_call_log (user_id, function_name, called_at);
