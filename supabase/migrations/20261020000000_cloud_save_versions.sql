-- Deploy before the client. Old clients fail closed: direct mutations are revoked.
alter table public.game_saves add column revision bigint not null default 1;
alter table public.game_saves add column deleted boolean not null default false;
create table public.game_save_history (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 storage_key text not null,
 value text,
 revision bigint not null,
 source text not null check (source in ('server','conflict','accepted')),
 saved_at timestamptz not null default now()
);
alter table public.game_save_history enable row level security;
create policy "Read own save history" on public.game_save_history for select to authenticated using ((select auth.uid())=user_id);
create index on public.game_save_history(user_id,storage_key,saved_at desc);
revoke insert,update,delete on public.game_saves from anon,authenticated;
revoke all on public.game_save_history from anon,authenticated;
grant select on public.game_save_history to authenticated;

create or replace function public.save_game_version(p_user_id uuid,p_key text,p_value text,p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); current_save public.game_saves%rowtype; next_revision bigint;
begin
 if uid is null or uid <> p_user_id or p_user_id is null then raise exception 'Account changed or authentication required'; end if;
 if length(p_key) not between 1 and 160 or p_revision is null or p_revision < 0 then raise exception 'Invalid save'; end if;
 -- Serialize missing-row inserts as well as updates for this account/key.
 perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_key,0));
 select * into current_save from public.game_saves where user_id=uid and storage_key=p_key for update;
 if coalesce(current_save.revision,0) <> p_revision then
  insert into public.game_save_history(user_id,storage_key,value,revision,source)
   values(uid,p_key,p_value,p_revision,'conflict');
  return jsonb_build_object('conflict',true,'revision',coalesce(current_save.revision,0),'value',case when current_save.deleted then null else current_save.value end,'updated_at',current_save.updated_at);
 end if;
 if current_save.revision is not null then
  insert into public.game_save_history(user_id,storage_key,value,revision,source)
   values(uid,p_key,case when current_save.deleted then null else current_save.value end,current_save.revision,'server');
 end if;
 next_revision := p_revision+1;
 insert into public.game_saves(user_id,storage_key,value,revision,deleted,updated_at)
  values(uid,p_key,coalesce(p_value,''),next_revision,p_value is null,clock_timestamp())
 on conflict(user_id,storage_key) do update set value=excluded.value,revision=excluded.revision,deleted=excluded.deleted,updated_at=excluded.updated_at;
 insert into public.game_save_history(user_id,storage_key,value,revision,source) values(uid,p_key,p_value,next_revision,'accepted');
 return jsonb_build_object('conflict',false,'revision',next_revision,'value',p_value,'updated_at',clock_timestamp());
end $$;
revoke all on function public.save_game_version(uuid,text,text,bigint) from public;
grant execute on function public.save_game_version(uuid,text,text,bigint) to authenticated;
