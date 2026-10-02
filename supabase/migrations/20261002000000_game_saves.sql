create table if not exists public.game_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key),
  constraint game_saves_key_length check (length(storage_key) between 1 and 160)
);

alter table public.game_saves enable row level security;

create policy "Read own game saves" on public.game_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own game saves" on public.game_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own game saves" on public.game_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own game saves" on public.game_saves for delete to authenticated using ((select auth.uid()) = user_id);
