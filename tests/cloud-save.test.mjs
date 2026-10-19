import assert from 'node:assert/strict';
import test from 'node:test';
import {hydrateCloudSave,createCloudSaveQueue,localSaveBackups,currentLocalSaves,restoreCloudBackup} from '../lib/cloud-save.ts';
import {accountStorageKey} from '../lib/account-storage.ts';
function memoryStorage(){const values=new Map();return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
function cloud(rows=[]){
 const table=new Map(rows.map(row=>[`${row.user_id}:${row.storage_key}`,{revision:1,deleted:false,updated_at:new Date().toISOString(),...row}]));
 const history=[];let user='alice',fail=false,beforeSave=null;
 const client={table,history,set user(v){user=v;},set fail(v){fail=v;},set beforeSave(v){beforeSave=v;},
 from(){return {select(){const filters=[];const query={eq(k,v){filters.push([k,v]);return query;},then(resolve){return Promise.resolve({data:[...table.values()].filter(r=>filters.every(([k,v])=>r[k]===v)),error:fail?new Error('offline'):null}).then(resolve);},async maybeSingle(){const result=await query;return {...result,data:result.data[0]??null};}};return query;}};},
 async rpc(_name,args){if(args.p_user_id!==user)return {error:new Error('account changed')};if(fail)return {error:new Error('offline')};if(beforeSave){const fn=beforeSave;beforeSave=null;await fn();}const key=`${user}:${args.p_key}`,row=table.get(key),revision=row?.revision??0;
 if(revision!==args.p_revision){history.push({value:args.p_value,source:'conflict'});return {data:{conflict:true,revision,value:row?.deleted?null:row?.value??null,updated_at:row?.updated_at}};}
 history.push({value:row?.value,source:'server'});const next={user_id:user,storage_key:args.p_key,value:args.p_value??'',deleted:args.p_value===null,revision:revision+1,updated_at:new Date().toISOString()};table.set(key,next);return {data:{conflict:false,revision:next.revision,value:args.p_value}};}
 };return client;
}
const stored=(s,id='alice')=>s.getItem(accountStorageKey(`user:${id}`,'game'));
const put=(s,value,id='alice')=>value===null?s.removeItem(accountStorageKey(`user:${id}`,'game')):s.setItem(accountStorageKey(`user:${id}`,'game'),value);
const queue=(c,s,error=()=>assert.fail('unexpected error'))=>createCloudSaveQueue(c,'alice',error,s);

test('legacy import excludes guest, other users and legacy backups',async()=>{
 const s=memoryStorage(),c=cloud();put(s,'alice');put(s,'bob','bob');s.setItem(accountStorageKey('guest','game'),'guest');s.setItem(accountStorageKey('user:alice','game')+':local-backup:1','old');
 await hydrateCloudSave(c,'alice',s);const q=queue(c,s);await q.flush();q.close();assert.equal(c.table.size,1);assert.equal(c.table.get('alice:game').value,'alice');
});
test('existing cloud schema values hydrate unchanged; divergent legacy local data preserved',async()=>{
 const s=memoryStorage(),c=cloud([{user_id:'alice',storage_key:'game',value:'cloud'}]);put(s,'local');await hydrateCloudSave(c,'alice',s);
 assert.equal(stored(s),'local');assert.deepEqual(new Set(localSaveBackups(s,'alice').map(r=>r.value)),new Set(['local','cloud']));const q=queue(c,s);await q.flush();q.close();assert.equal(c.table.get('alice:game').value,'cloud');
});
test('simultaneous devices: only one wins, both copies preserved and blocked key stays blocked',async()=>{
 const a=memoryStorage(),b=memoryStorage(),c=cloud();await Promise.all([hydrateCloudSave(c,'alice',a),hydrateCloudSave(c,'alice',b)]);const qa=queue(c,a),qb=queue(c,b);
 put(a,'A');qa.write('game','A');put(b,'B');qb.write('game','B');await Promise.all([qa.flush(),qb.flush()]);assert.equal(c.table.get('alice:game').value,'A');assert.equal(stored(b),'B');assert.ok(localSaveBackups(b,'alice').some(r=>r.value==='A'));qb.write('game','B2');await qb.flush();assert.equal(c.table.get('alice:game').value,'A');qa.close();qb.close();
});
test('offline restart keeps pending progress and conflicts on reconnect',async()=>{
 const s=memoryStorage(),c=cloud();await hydrateCloudSave(c,'alice',s);let errors=0;let q=queue(c,s,()=>errors++);c.fail=true;put(s,'offline');q.write('game','offline');await q.flush();q.close();assert.equal(errors,1);
 c.fail=false;c.table.set('alice:game',{user_id:'alice',storage_key:'game',value:'other device',revision:1});await hydrateCloudSave(c,'alice',s);q=queue(c,s);await q.flush();q.close();assert.equal(stored(s),'offline');assert.equal(c.table.get('alice:game').value,'other device');
});
test('offline deletion uses tombstone and stale writer cannot resurrect data',async()=>{
 const c=cloud([{user_id:'alice',storage_key:'game',value:'old'}]),a=memoryStorage(),b=memoryStorage();await hydrateCloudSave(c,'alice',a);await hydrateCloudSave(c,'alice',b);const qa=queue(c,a),qb=queue(c,b);put(a,null);qa.remove('game');await qa.flush();put(b,'stale');qb.write('game','stale');await qb.flush();assert.equal(c.table.get('alice:game').deleted,true);qa.close();qb.close();
});
test('server errors retain pending changes for retry',async()=>{
 const s=memoryStorage(),c=cloud();let errors=0;const q=queue(c,s,()=>errors++);put(s,'retry');q.write('game','retry');c.fail=true;await q.flush();c.fail=false;await q.flush();q.close();assert.equal(errors,1);assert.equal(c.table.get('alice:game').value,'retry');
});
test('account switch closes queue synchronously without sending pending user data',async()=>{
 const s=memoryStorage(),c=cloud(),q=queue(c,s);put(s,'alice');q.write('game','alice');q.close();c.user='bob';await q.flush();q.write('game','late');assert.equal(c.table.size,0);await hydrateCloudSave(c,'bob',s);const b=createCloudSaveQueue(c,'bob',()=>assert.fail(),s);put(s,'bob','bob');b.write('game','bob');await b.flush();b.close();assert.equal(c.table.get('bob:game').value,'bob');assert.equal(stored(s),'alice');
});
test('restore archives current local copy and uses fresh CAS; a racing device prevents restore',async()=>{
 const s=memoryStorage(),c=cloud([{user_id:'alice',storage_key:'game',value:'server'}]);await hydrateCloudSave(c,'alice',s);put(s,'unsent');const chosen={id:'backup',key:'game',value:'chosen',revision:0,savedAt:'',source:'local'};
 c.beforeSave=()=>{c.table.get('alice:game').revision++;c.table.get('alice:game').value='racing';};await assert.rejects(restoreCloudBackup(c,'alice',s,chosen));assert.equal(stored(s),'unsent');assert.equal(c.table.get('alice:game').value,'racing');await restoreCloudBackup(c,'alice',s,chosen);assert.equal(stored(s),'chosen');assert.equal(c.table.get('alice:game').value,'chosen');assert.ok(localSaveBackups(s,'alice').some(r=>r.value==='unsent'));assert.equal(currentLocalSaves(s,'bob').length,0);
});
test('write during in-flight request remains pending at the acknowledged revision',async()=>{
 const s=memoryStorage(),c=cloud(),q=queue(c,s);put(s,'first');q.write('game','first');c.beforeSave=()=>{put(s,'second');q.write('game','second');};await q.flush();await q.flush();q.close();assert.equal(c.table.get('alice:game').value,'second');assert.equal(c.table.get('alice:game').revision,2);
});

test('auth identity changing before RPC cannot write an old account payload to new account',async()=>{
 const s=memoryStorage(),c=cloud();let errors=0;const q=queue(c,s,()=>errors++);put(s,'private alice');q.write('game','private alice');c.user='bob';await q.flush();q.close();assert.equal(errors,1);assert.equal(c.table.size,0);
});
test('legacy local-backup keys remain recoverable but never upload as active saves',()=>{
 const s=memoryStorage();s.setItem(accountStorageKey('user:alice','game')+':local-backup:123','legacy backup');const rows=currentLocalSaves(s,'alice');assert.equal(rows.length,1);assert.equal(rows[0].key,'game');assert.equal(rows[0].value,'legacy backup');
});
test('backup storage failure leaves local and server copies intact',async()=>{
 const s=memoryStorage(),c=cloud([{user_id:'alice',storage_key:'game',value:'remote'}]);put(s,'local');const original=s.setItem;s.setItem=(k,v)=>{if(k.startsWith('khmd-cloud-backups'))throw new Error('quota');original(k,v);};await assert.rejects(hydrateCloudSave(c,'alice',s));assert.equal(stored(s),'local');assert.equal(c.table.get('alice:game').value,'remote');
});
test('closing an in-flight queue cannot acknowledge into storage after account switch',async()=>{
 const s=memoryStorage(),c=cloud(),q=queue(c,s);put(s,'A');q.write('game','A');c.beforeSave=()=>q.close();await q.flush();assert.equal(c.table.get('alice:game').value,'A');const meta=JSON.parse(s.getItem('khmd-cloud-v2:alice'));assert.equal(meta.game.pending,'A');assert.equal(meta.game.revision,0);
});
test('lost acknowledgement is retried conservatively without destroying accepted progress',async()=>{
 const s=memoryStorage(),c=cloud();let errors=0;const original=c.rpc.bind(c);let lost=true;c.rpc=async(...args)=>{const result=await original(...args);if(lost){lost=false;return {error:new Error('lost response')};}return result;};const q=queue(c,s,()=>errors++);put(s,'accepted');q.write('game','accepted');await q.flush();await q.flush();q.close();assert.equal(errors,1);assert.equal(c.table.get('alice:game').value,'accepted');assert.ok(localSaveBackups(s,'alice').some(r=>r.value==='accepted'));
});
test('cancelled hydration cannot apply an old response after recovery screen or account switch',async()=>{
 const s=memoryStorage(),c=cloud([{user_id:'alice',storage_key:'game',value:'old response'}]);put(s,'restored');await hydrateCloudSave(c,'alice',s,()=>false);assert.equal(stored(s),'restored');assert.equal(localSaveBackups(s,'alice').length,0);
});
