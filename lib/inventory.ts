import {byName,type Soldier,type UnitDef} from './game.ts';
import {salePrice} from './selling.ts';
import {isFinalUnitTier,isStorableUnitTier,isUnitTier} from './unit-tiers.ts';
export const DEPLOY_LIMIT=25;
export type Bag=Record<string,number>;
export function inventoryRecipeStatus(recipe:string[],roster:Soldier[],bag:Bag){
 const counts={...bag};for(const u of roster)counts[u.name]=(counts[u.name]??0)+1;
 return recipe.map(name=>{
  if(counts[name]>0){counts[name]--;return true;}
  if(byName[name]?.tier===1&&counts.시민>0){counts.시민--;return true;}
  return false;
 });
}
export function combineInventory(unit:UnitDef,roster:Soldier[],bag:Bag,id:number,deployLimit=DEPLOY_LIMIT){
 if(!unit.recipe?.length)return {ok:false as const,reason:'materials' as const};
 const field=[...roster],next={...bag};let preferredSlot:number|undefined;
 // Consume deployed ingredients first so their position can hold the new hero.
 for(const name of unit.recipe){
  let index=field.findIndex(u=>u.name===name);
  if(index>=0){const [used]=field.splice(index,1);preferredSlot??=used.slot;}
  else if(next[name]>0)next[name]--;
  else if(byName[name]?.tier===1&&(index=field.findIndex(u=>u.name==='시민'))>=0){const [used]=field.splice(index,1);preferredSlot??=used.slot;}
  else if(byName[name]?.tier===1&&next.시민>0)next.시민--;
  else return {ok:false as const,reason:'materials' as const};
 }
 if(field.length>=deployLimit){
  if(isFinalUnitTier(unit.tier))return {ok:false as const,reason:'capacity' as const};
  next[unit.name]=(next[unit.name]??0)+1;
  return {ok:true as const,roster:field,bag:next,stored:true};
 }
 const slot=preferredSlot??Array.from({length:40},(_,i)=>i).find(i=>!field.some(u=>u.slot===i));
 if(slot===undefined)return {ok:false as const,reason:'capacity' as const};
 field.push({id,name:unit.name,slot});
 return {ok:true as const,roster:field,bag:next,stored:false};
}
export function validBag(value:unknown):value is Bag{
 // Final-tier entries are accepted only for compatibility with saves made before heroes
 // moved from tier five to tier seven. New tier-seven units can never be put into the bag.
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([name,count])=>Object.hasOwn(byName,name)&&isUnitTier(byName[name].tier)&&Number.isSafeInteger(count)&&Number(count)>=0&&Number(count)<=1000000);
}
export function storeUnits(roster:Soldier[],bag:Bag,tier:number,name?:string){
 const moved=roster.filter(u=>byName[u.name].tier===tier&&isStorableUnitTier(tier)&&(!name||u.name===name));
 const next={...bag};for(const u of moved)next[u.name]=(next[u.name]??0)+1;
 return {roster:roster.filter(u=>!moved.includes(u)),bag:next,count:moved.length};
}
export function deployUnits(roster:Soldier[],bag:Bag,tier:number,nextId:number,name?:string,one=false,deployLimit=DEPLOY_LIMIT){
 const field=[...roster],next={...bag};let count=0;
 for(const unitName of Object.keys(next)){
  if(!Object.hasOwn(byName,unitName)||byName[unitName].tier!==tier||name&&unitName!==name)continue;
  while(next[unitName]>0&&field.length<deployLimit){
   const slot=Array.from({length:40},(_,i)=>i).find(i=>!field.some(u=>u.slot===i));if(slot===undefined)break;
   field.push({id:nextId++,name:unitName,slot});next[unitName]--;count++;
   if(one)return {roster:field,bag:next,nextId,count};
  }
 }
 return {roster:field,bag:next,nextId,count};
}
export function sellStored(bag:Bag,name:string,all:boolean){
 const price=salePrice(byName[name]),count=all?(bag[name]??0):Math.min(1,bag[name]??0);
 if(price===null||!count)return {bag,gold:0,count:0};
 return {bag:{...bag,[name]:bag[name]-count},gold:price*count,count};
}
export function migrateDeployment(roster:Soldier[],bag:Bag,deployLimit=DEPLOY_LIMIT){
 // Never discard old units or put final-tier heroes in the bag.
 const kept=roster.filter(u=>isFinalUnitTier(byName[u.name].tier)),next={...bag};
 for(const unit of roster.filter(u=>isStorableUnitTier(byName[u.name].tier))){
  if(kept.length<deployLimit)kept.push(unit);else next[unit.name]=(next[unit.name]??0)+1;
 }
 return {roster:kept,bag:next};
}
