import test from 'node:test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
test('PostgreSQL migration enforces CAS, RLS, tombstones and account deletion cascade', {skip:!process.env.PGLITE_MODULE}, async()=>{
const {PGlite}=await import(process.env.PGLITE_MODULE);
const db=new PGlite();
const root=new URL('../',import.meta.url);
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to authenticated;grant execute on function auth.uid() to authenticated;`);
await db.exec(await readFile(new URL('supabase/migrations/20261002000000_game_saves.sql',root),'utf8'));
await db.exec(`grant select,insert,update,delete on public.game_saves to authenticated;insert into auth.users values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');insert into public.game_saves(user_id,storage_key,value) values('00000000-0000-0000-0000-000000000001','game','legacy');`);
await db.exec(await readFile(new URL('supabase/migrations/20261020000000_cloud_save_versions.sql',root),'utf8'));
await db.exec(`set role authenticated;set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';`);
const uid='00000000-0000-0000-0000-000000000001';
async function save(key,value,rev,id=uid){return (await db.query('select public.save_game_version($1,$2,$3,$4) as result',[id,key,value,rev])).rows[0].result;}
assert.equal((await save('new-key','first',0)).revision,1);
assert.equal((await save('new-key','stale-first',0)).conflict,true);
assert.equal((await save('game','A',1)).revision,2);
assert.equal((await save('game','B',1)).conflict,true);
assert.equal((await db.query('select value from public.game_saves')).rows[0].value,'A');
assert.equal((await db.query("select count(*)::int as n from public.game_save_history where storage_key='game'")).rows[0].n,3);
assert.equal((await save('game',null,2)).revision,3);
assert.equal((await save('game','resurrect',2)).conflict,true);
await assert.rejects(db.query("update public.game_saves set value='bypass'"),/permission denied/);
await assert.rejects(db.query('delete from public.game_saves'),/permission denied/);
await assert.rejects(save('game','bad account',3,'00000000-0000-0000-0000-000000000002'),/Account changed/);
await db.exec(`set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';`);
assert.equal((await db.query('select * from public.game_save_history')).rows.length,0);
assert.equal((await db.query('select * from public.game_saves')).rows.length,0);
await db.exec(`reset role;delete from auth.users where id='${uid}';`);
assert.equal((await db.query('select * from public.game_save_history')).rows.length,0);
assert.equal((await db.query('select * from public.game_saves')).rows.length,0);
console.log('PASS: PostgreSQL migration, legacy revision, CAS conflict, tombstone, direct-write denial, account guard, RLS isolation, deletion cascade');
await db.close();

});
