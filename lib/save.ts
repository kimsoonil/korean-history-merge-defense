import {byName,enemyPortraits,type Enemy,type Soldier} from './game.ts';
import {FINAL_WAVE} from './campaign.ts';
import {stageRoundCount,roundBossName,roundEnemyCount,roundKey,isCampaignComplete,isStageComplete} from './rounds.ts';

export const SAVE_KEY='salsu-progress-v1';
export type GamePhase='ready'|'battle'|'cleared'|'lost'|'won';
export type GameProgress={
  roster:Soldier[]; enemies:Enemy[]; gold:number; wall:number; stage:number; round:number;
  phase:GamePhase; spawned:number; speed:number; remainingMs:number; heroCooldowns?:[number,number][];
};
export type GameSave=GameProgress&{version:4;savedAt:number};

const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const number=(value:unknown,min:number,max:number):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const integer=(value:unknown,min:number,max:number):value is number=>number(value,min,max)&&Number.isSafeInteger(value);

// Save remaining time, not an absolute deadline: time away from the game is paused.
export function remainingStageMs(deadline:number|null,phase:GamePhase,now:number,pausedAt:number|null=null){
  if(phase==='ready')return 30000;
  if(phase!=='battle'||deadline===null)return 0;
  return Math.max(0,Math.min(30000,deadline-(pausedAt??now)));
}
export function makeGameSave(progress:GameProgress,now=Date.now()):GameSave{
  return {...progress,roster:progress.roster.map(unit=>({...unit})),enemies:progress.enemies.map(enemy=>({...enemy})),version:4,savedAt:now};
}
export function canContinue(save:GameSave|null):save is GameSave&{phase:'ready'|'battle'|'cleared'}{
  return !!save&&save.phase!=='lost'&&save.phase!=='won'&&!(save.phase==='cleared'&&isStageComplete(save.stage,save.round));
}
export function restoredCounters(save:GameSave,now=Date.now()){
  return {
    nextId:Math.max(0,...save.roster.map(unit=>unit.id),...save.enemies.map(enemy=>enemy.id))+1,
    completedStage:save.phase==='cleared'||save.phase==='won'?roundKey(save.stage,save.round):0,
    deadline:save.phase==='battle'?now+save.remainingMs:null,
  };
}
function readLegacySave(raw:string|null):(Omit<GameSave,'round'|'version'>&{version:2})|null{
  if(!raw)return null;
  try{
    const value:unknown=JSON.parse(raw);
    if(!record(value)||(value.version!==1&&value.version!==2)||!integer(value.savedAt,0,Number.MAX_SAFE_INTEGER))return null;
    const legacy=value.version===1,lastWave=legacy?10:FINAL_WAVE;
    if(!integer(value.stage,1,lastWave)||!integer(value.gold,0,Number.MAX_SAFE_INTEGER)||!integer(value.wall,0,10))return null;
    if(!['ready','battle','cleared','lost','won'].includes(String(value.phase))||![1,2,3].includes(Number(value.speed))||typeof value.speed!=='number')return null;
    const limit=value.stage===lastWave?23:5+value.stage*2;
    if(!integer(value.spawned,0,limit)||!number(value.remainingMs,0,30000))return null;
    if(!Array.isArray(value.roster)||value.roster.length>40||!Array.isArray(value.enemies)||value.enemies.length>value.spawned)return null;
    const ids=new Set<number>(),slots=new Set<number>();
    for(const unit of value.roster){
      if(!record(unit)||!integer(unit.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(unit.id)||!integer(unit.slot,0,39)||slots.has(unit.slot)||typeof unit.name!=='string'||!Object.hasOwn(byName,unit.name))return null;
      ids.add(unit.id);slots.add(unit.slot);
    }
    let bosses=0;
    for(const enemy of value.enemies){
      if(!record(enemy)||!integer(enemy.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(enemy.id)||typeof enemy.name!=='string'||!Object.hasOwn(enemyPortraits,enemy.name))return null;
      if(!number(enemy.maxHp,1,1000000)||!number(enemy.hp,Number.MIN_VALUE,enemy.maxHp)||!number(enemy.progress,0,1-Number.EPSILON)||!number(enemy.speed,0.001,1)||!integer(enemy.reward,0,10000)||enemy.originStage!==value.stage||typeof enemy.boss!=='boolean')return null;
      if(enemy.boss!==(enemy.name==='수양제')||enemy.boss&&value.stage!==lastWave)return null;
      if(enemy.boss)bosses++;
      ids.add(enemy.id);
    }
    if(bosses>1)return null;
    if(value.phase==='ready'&&((legacy&&value.stage!==1)||value.spawned!==0||value.enemies.length||value.remainingMs!==30000))return null;
    if((value.phase==='cleared'||value.phase==='won')&&(value.spawned!==limit||value.enemies.length||value.remainingMs!==0))return null;
    if(value.phase==='won'&&value.stage!==lastWave||value.phase==='cleared'&&value.stage===lastWave)return null;
    if(value.phase==='lost'?value.wall!==0:value.wall===0)return null;
    if(legacy){
      // Keep legacy units/resources. Old 1-8/1-9 advance to the new final preparation;
      // old 1-10 retains the live boss, its HP and position under the new 1-8 label.
      const mapped={...value,version:2};
      if(value.stage>=FINAL_WAVE){
        const oldFinal=value.stage===10;
        Object.assign(mapped,{stage:FINAL_WAVE,enemies:oldFinal?value.enemies.map(enemy=>({...enemy,originStage:FINAL_WAVE})):[],spawned:oldFinal?value.spawned:0});
        if(!oldFinal)Object.assign(mapped,{phase:value.phase==='lost'?'lost':'ready',remainingMs:value.phase==='lost'?0:30000});
      }
      return readLegacySave(JSON.stringify(mapped));
    }
    return value as unknown as Omit<GameSave,'round'|'version'>&{version:2};
  }catch{return null;}
}

export function readGameSave(raw:string|null):GameSave|null{
  if(!raw)return null;
  try{
    const value:unknown=JSON.parse(raw);
    if(record(value)&&(value.version===1||value.version===2)){
      const legacy=readLegacySave(raw);if(!legacy)return null;
      const round=legacy.phase==='cleared'||legacy.phase==='won'||legacy.enemies.some(enemy=>enemy.boss)?stageRoundCount(legacy.stage):1;
      return readGameSave(JSON.stringify({...legacy,version:4,round,enemies:legacy.enemies.slice(0,10),spawned:legacy.phase==='cleared'||legacy.phase==='won'?10:Math.min(legacy.spawned,10)}));
    }
    if(!record(value)||(value.version!==3&&value.version!==4)||!integer(value.savedAt,0,Number.MAX_SAFE_INTEGER))return null;
    const lastWave=FINAL_WAVE;
    if(!integer(value.stage,1,lastWave)||!integer(value.gold,0,Number.MAX_SAFE_INTEGER)||!integer(value.wall,0,10))return null;
    if(!['ready','battle','cleared','lost','won'].includes(String(value.phase))||![1,2,3].includes(Number(value.speed))||typeof value.speed!=='number')return null;
    if(!integer(value.round,1,stageRoundCount(value.stage)))return null;
    const limit=value.version===3?Math.min(40,5+value.stage*2+Math.floor((value.round-1)/5)*2):roundEnemyCount(value.stage,value.round);
    if(!integer(value.spawned,0,limit)||!number(value.remainingMs,0,30000))return null;
    if(!Array.isArray(value.roster)||value.roster.length>40||!Array.isArray(value.enemies)||value.enemies.length>value.spawned)return null;
    const ids=new Set<number>(),slots=new Set<number>();
    for(const unit of value.roster){
      if(!record(unit)||!integer(unit.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(unit.id)||!integer(unit.slot,0,39)||slots.has(unit.slot)||typeof unit.name!=='string'||!Object.hasOwn(byName,unit.name))return null;
      ids.add(unit.id);slots.add(unit.slot);
    }
    let bosses=0;
    for(const enemy of value.enemies){
      if(!record(enemy)||!integer(enemy.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(enemy.id)||typeof enemy.name!=='string'||!Object.hasOwn(enemyPortraits,enemy.name))return null;
      if(!number(enemy.maxHp,1,1000000)||!number(enemy.hp,Number.MIN_VALUE,enemy.maxHp)||!number(enemy.progress,0,1-Number.EPSILON)||!number(enemy.speed,0.001,1)||!integer(enemy.reward,0,10000)||enemy.originStage!==value.stage||typeof enemy.boss!=='boolean')return null;
      if(enemy.boss!==(enemy.name==='수양제'||enemy.name==='수나라 장군')||enemy.boss&&enemy.name!==roundBossName(value.stage,value.round))return null;
      if(enemy.boss)bosses++;
      ids.add(enemy.id);
    }
    if(bosses>1)return null;
    if(value.phase==='ready'&&(value.spawned!==0||value.enemies.length||value.remainingMs!==30000))return null;
    if((value.phase==='cleared'||value.phase==='won')&&(value.spawned!==limit||value.enemies.length||value.remainingMs!==0))return null;
    if(value.phase==='won'&&!isCampaignComplete(value.stage,value.round)||value.phase==='cleared'&&isCampaignComplete(value.stage,value.round))return null;
    if(value.phase==='lost'?value.wall!==0:value.wall===0)return null;
    if(value.heroCooldowns!==undefined){
      if(!Array.isArray(value.heroCooldowns)||value.heroCooldowns.length>40)return null;
      const seen=new Set<number>();
      for(const entry of value.heroCooldowns){
        if(!Array.isArray(entry)||entry.length!==2||!integer(entry[0],1,Number.MAX_SAFE_INTEGER-1)||!number(entry[1],0,10)||seen.has(entry[0])||!value.roster.some(unit=>unit.id===entry[0]&&byName[unit.name].tier===5))return null;
        seen.add(entry[0]);
      }
    }
    if(value.version===3){
      // Preserve progression/resources and bosses while adopting the ten-enemy cap.
      const enemies=[...value.enemies].sort((a,b)=>Number(b.boss)-Number(a.boss)).slice(0,10);
      const spawned=value.phase==='cleared'||value.phase==='won'?10:Math.min(value.spawned,10);
      return {...value,version:4,enemies,spawned} as GameSave;
    }
    return value as GameSave;
  }catch{return null;}
}
