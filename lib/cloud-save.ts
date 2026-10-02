import type {SupabaseClient} from '@supabase/supabase-js';
import {accountStorageKey,accountStoragePrefix} from './account-storage.ts';

type StorageLike=Pick<Storage,'length'|'key'|'getItem'|'setItem'|'removeItem'>;
const TABLE='game_saves';

export async function hydrateCloudSave(client:SupabaseClient,userId:string,storage:StorageLike):Promise<void>{
 const scope:`user:${string}`=`user:${userId}`;
 const {data,error}=await client.from(TABLE).select('storage_key,value').eq('user_id',userId);
 if(error)throw error;
 const rows=(data??[]) as {storage_key:string;value:string}[];
 if(rows.length){
  for(const {storage_key,value} of rows){
   const target=accountStorageKey(scope,storage_key);
   const previous=storage.getItem(target);
   if(previous!==null&&previous!==value){
    storage.setItem(`${target}:local-backup:${Date.now()}`,previous);
   }
   storage.setItem(target,value);
  }
  return;
 }
 const prefix=accountStoragePrefix(scope),legacy:{user_id:string;storage_key:string;value:string}[]=[];
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);
  if(!key?.startsWith(prefix)||key.includes(':local-backup:'))continue;
  const value=storage.getItem(key);
  if(value!==null)legacy.push({user_id:userId,storage_key:key.slice(prefix.length),value});
 }
 if(legacy.length){
  const {error:importError}=await client.from(TABLE).upsert(legacy,{onConflict:'user_id,storage_key'});
  if(importError)throw importError;
 }
}

export function createCloudSaveQueue(client:SupabaseClient,userId:string,onError:()=>void){
 const pending=new Map<string,string|null>();
 let timer:ReturnType<typeof setTimeout>|null=null,flushing=false,closed=false;
 const schedule=()=>{if(!closed&&timer===null)timer=setTimeout(()=>{timer=null;void flush();},3000);};
 async function flush(){
  if(closed||flushing||!pending.size)return;
  flushing=true;
  const batch=[...pending];
  try{
   for(const [key,value] of batch){
    const query=value===null
     ?client.from(TABLE).delete().eq('user_id',userId).eq('storage_key',key)
     :client.from(TABLE).upsert({user_id:userId,storage_key:key,value},{onConflict:'user_id,storage_key'});
    const {error}=await query;
    if(error)throw error;
    if(pending.get(key)===value)pending.delete(key);
   }
  }catch{onError();}
  finally{flushing=false;if(pending.size&&!closed)schedule();}
 }
 return {
  write(key:string,value:string){pending.set(key,value);schedule();},
  remove(key:string){pending.set(key,null);schedule();},
  flush,
  close(){if(timer)clearTimeout(timer);timer=null;void flush().finally(()=>{closed=true;});},
 };
}
