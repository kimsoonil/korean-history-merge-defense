export type ImageStatus='loading'|'ready'|'error';
export type ImageLoader=(src:string)=>Promise<void>;
export function createImageCache(loader:ImageLoader){
 const entries=new Map<string,{status:ImageStatus;listeners:Set<()=>void>}>();
 const status=(src:string):ImageStatus=>entries.get(src)?.status??'loading';
 const subscribe=(src:string,listener:()=>void)=>{
  let entry=entries.get(src);
  if(!entry){
   entry={status:'loading',listeners:new Set()};entries.set(src,entry);
   const current=entry;
   Promise.resolve().then(()=>loader(src)).then(()=>{current.status='ready';},()=>{current.status='error';}).then(()=>{for(const notify of current.listeners)notify();});
  }
  entry.listeners.add(listener);
  return()=>{entry.listeners.delete(listener);};
 };
 return {status,subscribe};
}
