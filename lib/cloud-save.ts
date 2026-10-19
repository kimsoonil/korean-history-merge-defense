import type {SupabaseClient} from '@supabase/supabase-js';
import {accountStorageKey,accountStoragePrefix} from './account-storage.ts';

type StorageLike=Pick<Storage,'length'|'key'|'getItem'|'setItem'|'removeItem'>;
type State={revision:number;value:string|null;pending?:string|null;blocked?:boolean};
export type SaveBackup={id:string;key:string;value:string|null;revision:number;savedAt:string;source:string};
const metaKey=(id:string)=>`khmd-cloud-v2:${id}`;
const backupKey=(id:string)=>`khmd-cloud-backups-v2:${id}`;
const readStates=(s:StorageLike,id:string):Record<string,State>=>JSON.parse(s.getItem(metaKey(id))??'{}');
const writeStates=(s:StorageLike,id:string,states:Record<string,State>)=>s.setItem(metaKey(id),JSON.stringify(states));
export function localSaveBackups(s:StorageLike,id:string):SaveBackup[]{return JSON.parse(s.getItem(backupKey(id))??'[]');}
function backup(s:StorageLike,id:string,key:string,value:string|null,revision:number,source:string,savedAt=new Date().toISOString()){
 const rows=localSaveBackups(s,id);
 if(rows.some(row=>row.key===key&&row.value===value&&row.revision===revision&&row.source===source))return;
 rows.push({id:crypto.randomUUID(),key,value,revision,source,savedAt});
 s.setItem(backupKey(id),JSON.stringify(rows)); // Never overwrite a copy if storage is full: propagate the error.
}
function apply(s:StorageLike,id:string,key:string,value:string|null){
 const target=accountStorageKey(`user:${id}`,key);
 if(value===null)s.removeItem(target);else s.setItem(target,value);
}
function notify(){if(typeof window!=='undefined')window.dispatchEvent(new Event('cloud-save-change'));}
export async function hydrateCloudSave(client:SupabaseClient,userId:string,storage:StorageLike,isActive:()=>boolean=()=>true):Promise<void>{
 const {data,error}=await client.from('game_saves').select('storage_key,value,revision,deleted,updated_at').eq('user_id',userId);
 if(error)throw error;
 if(!isActive())return;
 const states=readStates(storage,userId);
 const rows=new Map<string,{value:string|null;revision:number;updated_at:string}>((data??[]).map(row=>[row.storage_key,{...row,value:row.deleted?null:row.value}]));
 const prefix=accountStoragePrefix(`user:${userId}`);
 const keys=new Set([...rows.keys(),...Object.keys(states)]);
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix)&&!key.includes(':local-backup:'))keys.add(key.slice(prefix.length));}
 for(const key of keys){
  const remote=rows.get(key),state=states[key];
  const local=storage.getItem(accountStorageKey(`user:${userId}`,key));
  const dirty=state?Object.hasOwn(state,'pending')||local!==state.value:local!==null;
  const version=remote?.revision??0, value=remote?.value??null;
  if(dirty&&local!==value){
   backup(storage,userId,key,local,state?.revision??0,'local');
   backup(storage,userId,key,value,version,'server',remote?.updated_at);
   states[key]={revision:state?.revision??0,value:state?.value??null,pending:local,blocked:!!remote||!!state?.blocked};
  }else{
   if(!state?.blocked){apply(storage,userId,key,value);states[key]={revision:version,value};}
  }
 }
 writeStates(storage,userId,states);notify();
}

export function createCloudSaveQueue(client:SupabaseClient,userId:string,onError:()=>void,storage:StorageLike=localStorage){
 let timer:ReturnType<typeof setTimeout>|null=null,flushing=false,closed=false;
 const schedule=()=>{if(!closed&&timer===null)timer=setTimeout(()=>{timer=null;void flush();},3000);};
 async function flush(){
  if(closed||flushing)return;
  flushing=true;
  try{
   const batch=Object.entries(readStates(storage,userId)).filter(([,s])=>Object.hasOwn(s,'pending')&&!s.blocked);
   for(const [key,state] of batch){
    if(closed)break;
    const value=state.pending!;
    const {data,error}=await client.rpc('save_game_version',{p_user_id:userId,p_key:key,p_value:value,p_revision:state.revision});
    if(error)throw error;
    if(closed)break;
    if(!data||!Number.isSafeInteger(data.revision))throw new Error('Invalid save response');
    const states=readStates(storage,userId),latest=states[key];
    if(data.conflict){
     backup(storage,userId,key,value,state.revision,'local');
     if(latest?.pending!==value)backup(storage,userId,key,latest?.pending??null,state.revision,'local');
     backup(storage,userId,key,data.value,data.revision,'server',data.updated_at);
     states[key]={...latest,blocked:true};
    }else{
     states[key]={revision:data.revision,value,...(latest&&Object.hasOwn(latest,'pending')&&latest.pending!==value?{pending:latest.pending}:{})};
    }
    writeStates(storage,userId,states);notify();
   }
  }catch{if(!closed)onError();}
  finally{flushing=false;if(!closed&&Object.values(readStates(storage,userId)).some(s=>Object.hasOwn(s,'pending')&&!s.blocked))schedule();}
 }
 function enqueue(key:string,value:string|null){
  if(closed)return;
  const states=readStates(storage,userId);
  states[key]={...(states[key]??{revision:0,value:null}),pending:value};
  writeStates(storage,userId,states);schedule();
 }
 schedule();
 return {write:enqueue,remove:(key:string)=>enqueue(key,null),flush,
  close(){closed=true;if(timer)clearTimeout(timer);timer=null;},
 };
}

export function currentLocalSaves(storage:StorageLike,userId:string):SaveBackup[]{
 const prefix=accountStoragePrefix(`user:${userId}`),states=readStates(storage,userId),rows:SaveBackup[]=[];
 const keys=new Set(Object.keys(states));
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix)&&!key.includes(':local-backup:'))keys.add(key.slice(prefix.length));}
 for(let i=0;i<storage.length;i++){
  const target=storage.key(i);if(!target?.startsWith(prefix)||!target.includes(':local-backup:'))continue;
  const [key,time]=target.slice(prefix.length).split(':local-backup:');
  rows.push({id:target,key,value:storage.getItem(target),revision:0,savedAt:new Date(Number(time)||0).toISOString(),source:'이전 버전 기기 백업'});
 }
 for(const key of keys)rows.push({id:`local-current-${key}`,key,value:storage.getItem(accountStorageKey(`user:${userId}`,key)),revision:states[key]?.revision??0,savedAt:new Date().toISOString(),source:'현재 기기 (확인 시각)'});
 return rows;
}
export async function saveHistory(client:SupabaseClient,userId:string):Promise<SaveBackup[]>{
 const {data,error}=await client.from('game_save_history').select('*').eq('user_id',userId).order('saved_at',{ascending:false}).limit(200);
 if(error)throw error;
 const {data:current,error:currentError}=await client.from('game_saves').select('*').eq('user_id',userId);
 if(currentError)throw currentError;
 return [...(current??[]).map(row=>({id:`current-${row.storage_key}`,key:row.storage_key,value:row.deleted?null:row.value,revision:row.revision,savedAt:row.updated_at,source:'현재 서버'})),...(data??[]).map(row=>({id:`server-${row.id}`,key:row.storage_key,value:row.value,revision:row.revision,savedAt:row.saved_at,source:row.source}))];
}
export async function restoreCloudBackup(client:SupabaseClient,userId:string,storage:StorageLike,chosen:SaveBackup){
 // Explicit choice still uses CAS: another device saving during this request causes a new conflict.
 const {data,error}=await client.from('game_saves').select('revision,value,deleted,updated_at').eq('user_id',userId).eq('storage_key',chosen.key).maybeSingle();
 if(error)throw error;
 const local=storage.getItem(accountStorageKey(`user:${userId}`,chosen.key));
 backup(storage,userId,chosen.key,local,0,'before-restore');
 const {data:result,error:saveError}=await client.rpc('save_game_version',{p_user_id:userId,p_key:chosen.key,p_value:chosen.value,p_revision:data?.revision??0});
 if(saveError)throw saveError;
 if(!result||!Number.isSafeInteger(result.revision))throw new Error('Invalid restore response');
 if(result.conflict){backup(storage,userId,chosen.key,result.value,result.revision,'server',result.updated_at);throw new Error('다른 기기에서 저장했습니다. 목록을 새로고침한 뒤 다시 선택하세요.');}
 const states=readStates(storage,userId);
 states[chosen.key]={revision:result.revision,value:chosen.value};
 // Persist metadata first; a failed local write is detected as a divergence on next hydration.
 writeStates(storage,userId,states);apply(storage,userId,chosen.key,chosen.value);notify();
}
