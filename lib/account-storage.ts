export type AuthStorageStatus='loading'|'signedOut'|'guest'|'authenticated';
export type AccountScope=`guest`|`user:${string}`;
type StorageLike={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void;removeItem:(key:string)=>void};

const PREFIX='khmd-account-v1';
export const accountStoragePrefix=(scope:AccountScope)=>`${PREFIX}:${scope}:`;

export function accountScopeFor(status:AuthStorageStatus,userId?:string|null):AccountScope|null{
 if(status==='guest')return 'guest';
 if(status==='authenticated'&&userId)return `user:${userId}`;
 return null;
}

export const accountStorageKey=(scope:AccountScope,key:string)=>`${PREFIX}:${scope}:${key}`;

export function readAccountItem(storage:StorageLike,scope:AccountScope,key:string){
 const scoped=storage.getItem(accountStorageKey(scope,key));
 if(scoped!==null)return scoped;
 if(scope!=='guest')return null;
 const legacy=storage.getItem(key);
 if(legacy!==null)storage.setItem(accountStorageKey(scope,key),legacy);
 return legacy;
}

export function writeAccountItem(storage:StorageLike,scope:AccountScope,key:string,value:string){
 storage.setItem(accountStorageKey(scope,key),value);
}

export function removeAccountItem(storage:StorageLike,scope:AccountScope,key:string){
 storage.removeItem(accountStorageKey(scope,key));
}
