-- The client (src/services/storage.ts saveOutfit / getOutfits) has been sending and reading a
-- `worn_date` field on outfits since ScoreScreen added a "¿Cuándo lo llevaste?" date picker, but
-- this column was never added to the schema. Every outfit insert has been failing with
-- "Could not find the 'worn_date' column of 'outfits' in the schema cache" ever since — outfits
-- only ever existed in local AsyncStorage, never synced to Supabase.
alter table public.outfits
  add column worn_date date;
