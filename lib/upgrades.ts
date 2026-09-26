import {units,type UnitDef} from './game.ts';
export type UpgradeKind='tier'|'role'|'hero';
export type Upgrades=Record<UpgradeKind,Record<string,number>>;
export const MAX_UPGRADE_LEVEL=10;
export const emptyUpgrades=():Upgrades=>({tier:{},role:{},hero:{}});
export const upgradeOptions={
 tier:[1,2,3,4,5].map(t=>({key:String(t),label:`${t}단계`,baseCost:t*100})),
 role:[...new Set(units.map(u=>u.role))].map(role=>({key:role,label:role,baseCost:150})),
 hero:units.filter(u=>u.tier===5).map(u=>({key:u.name,label:u.name,baseCost:500})),
};
export function readUpgrades(raw:unknown):Upgrades{
 const result=emptyUpgrades();
 if(!raw||typeof raw!=='object')return result;
 for(const kind of ['tier','role','hero'] as const){
  const group=(raw as Record<string,unknown>)[kind];
  if(!group||typeof group!=='object')continue;
  for(const option of upgradeOptions[kind]){
   const value=(group as Record<string,unknown>)[option.key];
   if(typeof value==='number'&&Number.isInteger(value)&&value>0&&value<=MAX_UPGRADE_LEVEL)result[kind][option.key]=value;
  }
 }
 return result;
}
export function upgradeCost(kind:UpgradeKind,key:string,state:Upgrades){
 const option=upgradeOptions[kind].find(o=>o.key===key),level=state[kind][key]??0;
 return !option||level>=MAX_UPGRADE_LEVEL?null:option.baseCost*(level+1);
}
export function purchaseUpgrade(state:Upgrades,gold:number,kind:UpgradeKind,key:string){
 const cost=upgradeCost(kind,key,state);
 if(cost===null||gold<cost)return null;
 return {gold:gold-cost,upgrades:{...state,[kind]:{...state[kind],[key]:(state[kind][key]??0)+1}}};
}
export function upgradedAttack(unit:UnitDef,state?:Upgrades){
 const levels=(state?.tier[String(unit.tier)]??0)+(state?.role[unit.role]??0)+(unit.tier===5?(state?.hero[unit.name]??0):0);
 return unit.damage*(100+levels*10)/100;
}
