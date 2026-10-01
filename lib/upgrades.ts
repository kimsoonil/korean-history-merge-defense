import {units,type UnitDef} from './game.ts';
import type {Difficulty} from './enemy-stats.ts';
import {UNIT_TIERS} from './unit-tiers.ts';
export type UpgradeKind='tier'|'role'|'hero';
export type Upgrades=Record<UpgradeKind,Record<string,number>>;
export const MAX_UPGRADE_LEVEL=10;
export const TIER_MAX_UPGRADE_LEVEL=20;
export const upgradePercentPerLevel:Record<UpgradeKind,number>={tier:1,role:3,hero:5};
export const tierUpgradeTotalCosts:Record<number,number>={1:1000,2:3000,3:10000,4:15000,5:20000,6:30000,7:50000};
export const maxUpgradeLevel=(kind:UpgradeKind)=>kind==='tier'?TIER_MAX_UPGRADE_LEVEL:MAX_UPGRADE_LEVEL;
export const emptyUpgrades=():Upgrades=>({tier:{},role:{},hero:{}});
export const upgradeOptions={
 tier:UNIT_TIERS.map(t=>({key:String(t),label:`${t}단계`,baseCost:tierUpgradeTotalCosts[t]/TIER_MAX_UPGRADE_LEVEL})),
 role:[...new Set(units.filter(u=>u.name!=='시민').map(u=>u.role))].map(role=>({key:role,label:role,baseCost:100})),
 hero:units.filter(u=>u.tier===5).map(u=>({key:u.name,label:u.name,baseCost:300})),
};
export function readUpgrades(raw:unknown):Upgrades{
 const result=emptyUpgrades();
 if(!raw||typeof raw!=='object')return result;
 for(const kind of ['tier','role','hero'] as const){
  const group=(raw as Record<string,unknown>)[kind];
  if(!group||typeof group!=='object')continue;
  for(const option of upgradeOptions[kind]){
   const value=(group as Record<string,unknown>)[option.key];
   if(typeof value==='number'&&Number.isInteger(value)&&value>0&&value<=maxUpgradeLevel(kind))result[kind][option.key]=value;
  }
 }
 return result;
}
export function upgradeCost(kind:UpgradeKind,key:string,state:Upgrades,difficulty:Difficulty='normal'){
 const option=upgradeOptions[kind].find(o=>o.key===key),level=state[kind][key]??0;
 if(!option||level>=maxUpgradeLevel(kind))return null;
 const baseCost=difficulty==='hard'?(kind==='hero'?500:option.baseCost*2):option.baseCost;
 return kind==='tier'?baseCost:baseCost*(level+1);
}
export function purchaseUpgrade(state:Upgrades,gold:number,kind:UpgradeKind,key:string,difficulty:Difficulty='normal'){
 const cost=upgradeCost(kind,key,state,difficulty);
 if(cost===null||gold<cost)return null;
 return {gold:gold-cost,upgrades:{...state,[kind]:{...state[kind],[key]:(state[kind][key]??0)+1}}};
}
export function upgradedAttack(unit:UnitDef,state?:Upgrades){
 const percent=(state?.tier[String(unit.tier)]??0)*upgradePercentPerLevel.tier+(state?.role[unit.role]??0)*upgradePercentPerLevel.role+(unit.tier===5?(state?.hero[unit.name]??0)*upgradePercentPerLevel.hero:0);
 return unit.damage*(100+percent)/100;
}
