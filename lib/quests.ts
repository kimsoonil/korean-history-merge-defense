import {byName,type Soldier} from './game.ts';
import type {Bag} from './inventory.ts';
import {TIER_MAX_UPGRADE_LEVEL,type Upgrades} from './upgrades.ts';

export type QuestProgress={basicUnitsPeak:number;goldGambles:number;unitGambleWins:number;gambleFailures:number;earlyTier4:boolean;earlyTier6:boolean;tier7Combined:boolean;claimed:string[]};
export type QuestReward={gold:number;troopCards:number;citizens:number};
export type BattleQuest={id:string;title:string;progress:number;target:number;complete:boolean;claimed:boolean;reward:QuestReward};
export const emptyQuestProgress=():QuestProgress=>({basicUnitsPeak:0,goldGambles:0,unitGambleWins:0,gambleFailures:0,earlyTier4:false,earlyTier6:false,tier7Combined:false,claimed:[]});
export function readQuestProgress(value:unknown):QuestProgress{
 const fallback=emptyQuestProgress();if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
 const raw=value as Partial<QuestProgress>,valid=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=1000000;
 if(!valid(raw.basicUnitsPeak)||!valid(raw.goldGambles)||!valid(raw.unitGambleWins)||!valid(raw.gambleFailures)||typeof raw.earlyTier4!=='boolean'||typeof raw.earlyTier6!=='boolean'||typeof raw.tier7Combined!=='boolean'||!Array.isArray(raw.claimed)||!raw.claimed.every(id=>typeof id==='string'))return fallback;
 return {...raw,claimed:[...new Set(raw.claimed)]} as QuestProgress;
}
const ownedBasics=(roster:Soldier[],bag:Bag)=>roster.filter(unit=>byName[unit.name]?.tier===1&&unit.name!=='시민').length+Object.entries(bag).reduce((sum,[name,count])=>sum+(byName[name]?.tier===1&&name!=='시민'?count:0),0);
const reward=(gold=0,troopCards=0,citizens=0):QuestReward=>({gold,troopCards,citizens});
export function battleQuests(progress:QuestProgress,roster:Soldier[],bag:Bag,upgrades:Upgrades):BattleQuest[]{
 const claimed=new Set(progress.claimed),basic=Math.max(progress.basicUnitsPeak,ownedBasics(roster,bag)),quests:Omit<BattleQuest,'claimed'>[]=[
  {id:'basic-7',title:'Lv 1 유닛 7명 보유',progress:Math.min(7,basic),target:7,complete:basic>=7,reward:reward(0,1,1)},
  {id:'tier4-before-10',title:'10라운드 이전 Lv 4 유닛 조합',progress:Number(progress.earlyTier4),target:1,complete:progress.earlyTier4,reward:reward(0,1,1)},
  {id:'tier6-before-30',title:'30라운드 이전 Lv 6 유닛 조합',progress:Number(progress.earlyTier6),target:1,complete:progress.earlyTier6,reward:reward(0,0,3)},
  {id:'gold-gamble-10',title:'골드 도박 10회 사용',progress:Math.min(10,progress.goldGambles),target:10,complete:progress.goldGambles>=10,reward:reward(2000,1)},
  ...Array.from({length:7},(_,index)=>{const tier=index+1,level=upgrades.tier[String(tier)]??0;return {id:`tier-upgrade-${tier}`,title:`Lv ${tier} 단계 강화 모두 완료`,progress:Math.min(TIER_MAX_UPGRADE_LEVEL,level),target:TIER_MAX_UPGRADE_LEVEL,complete:level>=TIER_MAX_UPGRADE_LEVEL,reward:reward(tier*1000,tier)};}),
  {id:'tier7-combine',title:'Lv 7 유닛 조합 성공',progress:Number(progress.tier7Combined),target:1,complete:progress.tier7Combined,reward:reward(0,1,1)},
  {id:'unit-gamble-10',title:'유닛 도박 성공 10회',progress:Math.min(10,progress.unitGambleWins),target:10,complete:progress.unitGambleWins>=10,reward:reward(0,1)},
  {id:'gamble-fail-10',title:'유닛·골드 도박 실패 10회',progress:Math.min(10,progress.gambleFailures),target:10,complete:progress.gambleFailures>=10,reward:reward(1000)},
 ];
 return quests.map(quest=>({...quest,claimed:claimed.has(quest.id)}));
}
export function recordCombinedTier(progress:QuestProgress,tier:number,round:number):QuestProgress{return {...progress,earlyTier4:progress.earlyTier4||(tier===4&&round<10),earlyTier6:progress.earlyTier6||(tier===6&&round<30),tier7Combined:progress.tier7Combined||tier===7};}
export function recordBasicUnitsPeak(progress:QuestProgress,roster:Soldier[],bag:Bag):QuestProgress{const count=ownedBasics(roster,bag);return count>progress.basicUnitsPeak?{...progress,basicUnitsPeak:count}:progress;}
export function recordGoldQuest(progress:QuestProgress,failed:boolean):QuestProgress{return {...progress,goldGambles:progress.goldGambles+1,gambleFailures:progress.gambleFailures+Number(failed)};}
export function recordUnitQuest(progress:QuestProgress,success:boolean):QuestProgress{return {...progress,unitGambleWins:progress.unitGambleWins+Number(success),gambleFailures:progress.gambleFailures+Number(!success)};}
export function claimQuest(progress:QuestProgress,quest:BattleQuest){if(!quest.complete||quest.claimed)return null;return {...quest.reward,progress:{...progress,claimed:[...progress.claimed,quest.id]}};}
