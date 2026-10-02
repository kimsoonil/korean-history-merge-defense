import assert from 'node:assert/strict';
import test from 'node:test';
import {hydrateCloudSave,createCloudSaveQueue} from '../lib/cloud-save.ts';
import {accountStorageKey} from '../lib/account-storage.ts';

function memoryStorage(){
 const values=new Map();
 return {get length(){return values.size;},key:i=>[...values.keys()][i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
}
function cloud(rows=[]){
 const table=new Map(rows.map(row=>[`${row.user_id}:${row.storage_key}`,row]));
 return {table,from(){return {
  select(){return {eq:async(_column,userId)=>({data:[...table.values()].filter(row=>row.user_id===userId),error:null})};},
  upsert(value){const list=Array.isArray(value)?value:[value];for(const row of list)table.set(`${row.user_id}:${row.storage_key}`,row);return Promise.resolve({error:null});},
  delete(){return {eq(){return {eq:async(_column,key)=>{for(const [id,row] of table)if(row.storage_key===key)table.delete(id);return {error:null};}}}};},
 };}};
}

test('first login imports only the matching account, never guest progress',async()=>{
 const storage=memoryStorage(),client=cloud();
 storage.setItem(accountStorageKey('guest','game'),'guest');
 storage.setItem(accountStorageKey('user:alice','game'),'alice');
 await hydrateCloudSave(client,'alice',storage);
 assert.equal(client.table.get('alice:game')?.value,'alice');
 assert.equal(client.table.size,1);
});

test('cloud progress wins while a conflicting local copy is preserved',async()=>{
 const storage=memoryStorage(),client=cloud([{user_id:'alice',storage_key:'game',value:'cloud'}]);
 storage.setItem(accountStorageKey('user:alice','game'),'local');
 await hydrateCloudSave(client,'alice',storage);
 assert.equal(storage.getItem(accountStorageKey('user:alice','game')),'cloud');
 assert.ok([...Array(storage.length).keys()].map(i=>storage.key(i)).some(key=>key.includes(':local-backup:')));
});

test('queued writes and removals remain within the authenticated user',async()=>{
 const client=cloud(),queue=createCloudSaveQueue(client,'alice',()=>assert.fail('unexpected sync error'));
 queue.write('game','saved');await queue.flush();
 assert.equal(client.table.get('alice:game')?.value,'saved');
 queue.remove('game');await queue.flush();
 assert.equal(client.table.has('alice:game'),false);
 queue.close();
});
