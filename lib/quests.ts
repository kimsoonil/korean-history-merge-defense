import {byName,type Soldier} from './game.ts';
import type {Bag} from './inventory.ts';
import {TIER_MAX_UPGRADE_LEVEL,type Upgrades} from './upgrades.ts';

export type QuestProgress={basicTypesPeak:number;supplyCartsDefeated:number;roleFormationAchieved:boolean;goldGambles:number;unitGambleWins:number;gambleFailures:number;earlyTier4:boolean;tier5Combined:boolean;earlyTier6:boolean;tier7Combined:boolean;claimed:string[]};
export type QuestReward={gold:number;troopCards:number;citizens:number};
export type BattleQuest={id:string;title:string;progress:number;target:number;complete:boolean;claimed:boolean;reward:QuestReward};
export const emptyQuestProgress=():QuestProgress=>({basicTypesPeak:0,supplyCartsDefeated:0,roleFormationAchieved:false,goldGambles:0,unitGambleWins:0,gambleFailures:0,earlyTier4:false,tier5Combined:false,earlyTier6:false,tier7Combined:false,claimed:[]});
export function readQuestProgress(value:unknown):QuestProgress{
 const fallback=emptyQuestProgress();if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
 const raw=value as Partial<QuestProgress>,valid=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=1000000;
 if(raw.basicTypesPeak!==undefined&&!valid(raw.basicTypesPeak)||raw.supplyCartsDefeated!==undefined&&!valid(raw.supplyCartsDefeated)||raw.roleFormationAchieved!==undefined&&typeof raw.roleFormationAchieved!=='boolean'||!valid(raw.goldGambles)||!valid(raw.unitGambleWins)||!valid(raw.gambleFailures)||typeof raw.earlyTier4!=='boolean'||raw.tier5Combined!==undefined&&typeof raw.tier5Combined!=='boolean'||typeof raw.earlyTier6!=='boolean'||typeof raw.tier7Combined!=='boolean'||!Array.isArray(raw.claimed)||!raw.claimed.every(id=>typeof id==='string'))return fallback;
 // The old basicUnitsPeak counted duplicates, so it cannot prove seven distinct types.
 return {basicTypesPeak:Math.min(7,raw.basicTypesPeak??0),supplyCartsDefeated:raw.supplyCartsDefeated??0,roleFormationAchieved:raw.roleFormationAchieved??false,goldGambles:raw.goldGambles!,unitGambleWins:raw.unitGambleWins!,gambleFailures:raw.gambleFailures!,earlyTier4:raw.earlyTier4,tier5Combined:raw.tier5Combined??false,earlyTier6:raw.earlyTier6,tier7Combined:raw.tier7Combined,claimed:[...new Set(raw.claimed)]};
}
const ownedBasicTypes=(roster:Soldier[],bag:Bag)=>new Set([...roster.map(unit=>unit.name),...Object.entries(bag).filter(([,count])=>count>0).map(([name])=>name)].filter(name=>byName[name]?.tier===1&&name!=='시민')).size;
const reward=(gold=0,troopCards=0,citizens=0):QuestReward=>({gold,troopCards,citizens});
export function battleQuests(progress:QuestProgress,roster:Soldier[],bag:Bag,upgrades:Upgrades):BattleQuest[]{
 const claimed=new Set(progress.claimed),basic=Math.max(progress.basicTypesPeak,ownedBasicTypes(roster,bag)),quests:Omit<BattleQuest,'claimed'>[]=[
  {id:'basic-7',title:'시민을 제외한 Lv 1 유닛 7종 보유',progress:Math.min(7,basic),target:7,complete:basic>=7,reward:reward(0,1,1)},
  {id:'supply-cart-2',title:'군량 보급 수레 2대 처치',progress:Math.min(2,progress.supplyCartsDefeated),target:2,complete:progress.supplyCartsDefeated>=2,reward:reward(0,1)},
  {id:'role-formation',title:'방깎·지원·주력 유닛 동시 배치',progress:Number(progress.roleFormationAchieved),target:1,complete:progress.roleFormationAchieved,reward:reward(0,0,1)},
  {id:'tier4-before-10',title:'Lv 4 유닛 조합',progress:Number(progress.earlyTier4),target:1,complete:progress.earlyTier4,reward:reward(0,2,1)},
  {id:'tier5-combine',title:'Lv 5 유닛 조합',progress:Number(progress.tier5Combined),target:1,complete:progress.tier5Combined,reward:reward(0,2,1)},
  {id:'tier6-before-30',title:'Lv 6 유닛 조합',progress:Number(progress.earlyTier6),target:1,complete:progress.earlyTier6,reward:reward(0,2,1)},
  ...Array.from({length:7},(_,index)=>{const tier=index+1,level=upgrades.tier[String(tier)]??0;return {id:`tier-upgrade-${tier}`,title:`Lv ${tier} 단계 강화 모두 완료`,progress:Math.min(TIER_MAX_UPGRADE_LEVEL,level),target:TIER_MAX_UPGRADE_LEVEL,complete:level>=TIER_MAX_UPGRADE_LEVEL,reward:reward(tier*1000,tier)};}),
  {id:'tier7-combine',title:'Lv 7 유닛 조합 성공',progress:Number(progress.tier7Combined),target:1,complete:progress.tier7Combined,reward:reward(0,2,1)},
  {id:'unit-gamble-10',title:'유닛 도박 성공 10회',progress:Math.min(10,progress.unitGambleWins),target:10,complete:progress.unitGambleWins>=10,reward:reward(0,1)},
  {id:'unit-gamble-20',title:'유닛 도박 20회 이용',progress:Math.min(20,progress.unitGambleWins),target:20,complete:progress.unitGambleWins>=20,reward:reward(1000)},
 ];
 return quests.map(quest=>({...quest,claimed:claimed.has(quest.id)}));
}
export function recordCombinedTier(progress:QuestProgress,tier:number,_round:number):QuestProgress{return {...progress,earlyTier4:progress.earlyTier4||tier===4,tier5Combined:progress.tier5Combined||tier===5,earlyTier6:progress.earlyTier6||tier===6,tier7Combined:progress.tier7Combined||tier===7};}
export function recordBasicTypesPeak(progress:QuestProgress,roster:Soldier[],bag:Bag):QuestProgress{const count=ownedBasicTypes(roster,bag);return count>progress.basicTypesPeak?{...progress,basicTypesPeak:count}:progress;}
export function recordRoleFormation(progress:QuestProgress,roster:Soldier[]):QuestProgress{
 if(progress.roleFormationAchieved)return progress;
 const roles=new Set(roster.map(soldier=>byName[soldier.name]?.role));
 return (roles.has('수군')||roles.has('책략'))&&roles.has('지원')&&['전열','궁사','화포','기동','군주','수성'].some(role=>roles.has(role))?{...progress,roleFormationAchieved:true}:progress;
}
export const recordSupplyCartDefeated=(progress:QuestProgress):QuestProgress=>({...progress,supplyCartsDefeated:progress.supplyCartsDefeated+1});
export function recordUnitQuest(progress:QuestProgress,success:boolean):QuestProgress{return {...progress,unitGambleWins:progress.unitGambleWins+Number(success),gambleFailures:progress.gambleFailures+Number(!success)};}
export function claimQuest(progress:QuestProgress,quest:BattleQuest){if(!quest.complete||quest.claimed)return null;return {...quest.reward,progress:{...progress,claimed:[...progress.claimed,quest.id]}};}
