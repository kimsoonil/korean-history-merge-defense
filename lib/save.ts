import {nadangEnemyNames} from './nadang.ts';
import {byName,enemyPortraits,type Enemy,type Soldier} from './game.ts';
import {FINAL_WAVE} from './campaign.ts';
import {stageRoundCount,roundBossName,roundEnemyCount,roundKey,isCampaignComplete,isStageComplete} from './rounds.ts';

import {readUpgrades,type Upgrades} from './upgrades.ts';
import {validBag,type Bag} from './inventory.ts';
import {hwangsanEnemyNames} from './hwangsan.ts';
import {ansiEnemyNames,type ChapterId} from './ansi.ts';
import {validBannedHeroes} from './hard-mode.ts';
import type {Difficulty} from './enemy-stats.ts';
export const SAVE_KEY='salsu-progress-v1';
export type GamePhase='ready'|'battle'|'cleared'|'lost'|'won';
export type GameProgress={
  chapter?:ChapterId; difficulty?:Difficulty; bannedHeroes?:string[];
  roster:Soldier[]; bag?:Bag; enemies:Enemy[]; gold:number; wall:number; stage:number; round:number;
  phase:GamePhase; spawned:number; speed:number; remainingMs:number; heroCooldowns?:[number,number][]; upgrades?:Upgrades;
};
export type GameSave=GameProgress&{version:5;roundRules?:2;savedAt:number};

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
  return {...progress,...(progress.upgrades?{upgrades:readUpgrades(progress.upgrades)}:{}),roster:progress.roster.map(unit=>({...unit})),enemies:progress.enemies.map(enemy=>({...enemy})),version:5,roundRules:2,savedAt:now};
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
    const legacy=value.version===1,lastWave=legacy?10:8;
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
      if(value.stage>=8){
        const oldFinal=value.stage===10;
        Object.assign(mapped,{stage:8,enemies:oldFinal?value.enemies.map(enemy=>({...enemy,originStage:8})):[],spawned:oldFinal?value.spawned:0});
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
    if(record(value)){
      if(value.chapter!==undefined&&value.chapter!==1&&value.chapter!==2&&value.chapter!==3&&value.chapter!==4)return null;
      if(value.difficulty!==undefined&&!['normal','hard'].includes(String(value.difficulty)))return null;
      if(value.difficulty==='hard'&&!validBannedHeroes(value.bannedHeroes,value.chapter===4?4:value.chapter===3?3:value.chapter===2?2:1))return null;
      if(value.difficulty!=='hard'&&value.bannedHeroes!==undefined&&(!Array.isArray(value.bannedHeroes)||value.bannedHeroes.length))return null;
    }
    if(record(value)&&(value.version===1||value.version===2)){
      const legacy=readLegacySave(raw);if(!legacy)return null;
      const round=legacy.phase==='cleared'||legacy.phase==='won'||legacy.enemies.some(enemy=>enemy.boss)?20+(legacy.stage-1)*5:1;
      return readGameSave(JSON.stringify({...legacy,version:4,round,enemies:legacy.enemies.slice(0,10),spawned:legacy.phase==='cleared'||legacy.phase==='won'?10:Math.min(legacy.spawned,10)}));
    }
    if(!record(value)||![3,4,5].includes(Number(value.version))||!integer(value.savedAt,0,Number.MAX_SAFE_INTEGER))return null;
    if(value.version===3||value.version===4){
      if(!integer(value.stage,1,8)||!integer(value.round,1,20+(value.stage-1)*5)||!Array.isArray(value.enemies)||!integer(value.spawned,0,value.version===3?40:10))return null;
      const oldRound=value.round,oldStage=value.stage;
      const emperor=value.enemies.some(e=>record(e)&&e.name==='수양제')||value.phase==='won';
      const stage=emperor?10:oldStage;
      const round=emperor?65:oldRound;
      const expectedBoss=roundBossName(stage,round);
      const enemies=value.enemies.map(e=>record(e)?{...e,originStage:stage,...(e.boss&&expectedBoss?{name:expectedBoss}:{})}:e).sort((a,b)=>Number(b?.boss)-Number(a?.boss)).slice(0,10);
      // A boss from the old repeated schedule resumes at this stage's boss round.
      const migratedRound=enemies.some(e=>e?.boss)&&!expectedBoss?stageRoundCount(stage):round;
      return readGameSave(JSON.stringify({...value,version:5,roundRules:2,stage,round:migratedRound,enemies:enemies.map(e=>e?.boss?{...e,name:roundBossName(stage,migratedRound)}:e),spawned:Math.min(value.spawned,10)}));
    }
    // Preserve old 5-round-stage saves and any surviving bosses. New games use
    // local rounds from one; old completed stages remain completed.
    if(value.version===5&&value.roundRules===undefined&&integer(value.stage,2,10)&&integer(value.round,1,5)){
      const round=value.phase==='ready'?1:20+(value.stage-2)*5+value.round;
      return readGameSave(JSON.stringify({...value,roundRules:2,round}));
    }
    const lastWave=FINAL_WAVE;
    if(!integer(value.stage,1,lastWave)||!integer(value.gold,0,Number.MAX_SAFE_INTEGER)||!integer(value.wall,0,10))return null;
    if(!['ready','battle','cleared','lost','won'].includes(String(value.phase))||![1,2,3].includes(Number(value.speed))||typeof value.speed!=='number')return null;
    if(!integer(value.round,1,stageRoundCount(value.stage)))return null;
    const limit=value.version===3?Math.min(40,5+value.stage*2+Math.floor((value.round-1)/5)*2):roundEnemyCount(value.stage,value.round);
    // Existing twenty-enemy rounds remain resumable without dropping enemies.
    if(!integer(value.spawned,0,Math.max(20,limit))||!number(value.remainingMs,0,30000))return null;
    if(!Array.isArray(value.roster)||value.roster.length>40||!Array.isArray(value.enemies)||value.enemies.length>100)return null;
    const ids=new Set<number>(),slots=new Set<number>();
    for(const unit of value.roster){
      if(!record(unit)||!integer(unit.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(unit.id)||!integer(unit.slot,0,39)||slots.has(unit.slot)||typeof unit.name!=='string'||!Object.hasOwn(byName,unit.name))return null;
      ids.add(unit.id);slots.add(unit.slot);
    }
    let bosses=0;
    for(const enemy of value.enemies){
      if(!record(enemy)||!integer(enemy.id,1,Number.MAX_SAFE_INTEGER-1)||ids.has(enemy.id)||typeof enemy.name!=='string'||!Object.hasOwn(enemyPortraits,enemy.name))return null;
      if(!number(enemy.maxHp,1,1000000)||!number(enemy.hp,Number.MIN_VALUE,enemy.maxHp)||!number(enemy.progress,0,1-Number.EPSILON)||!number(enemy.speed,0.001,1)||!integer(enemy.reward,0,10000)||enemy.originStage!==value.stage||typeof enemy.boss!=='boolean')return null;
      if(enemy.boss!==(!['수나라 보병','수나라 창병','수나라 궁병','수나라 기병','수나라 공성병','수나라 정예군',...ansiEnemyNames,...hwangsanEnemyNames,...nadangEnemyNames].includes(enemy.name))||enemy.boss&&!Array.from({length:value.round},(_,i)=>roundBossName(Number(value.stage),i+1,value.chapter===4?4:value.chapter===3?3:value.chapter===2?2:1)).includes(enemy.name))return null;
      if(enemy.boss)bosses++;
      ids.add(enemy.id);
    }
    if(bosses>Math.floor(value.round/5)+1)return null;
    if(value.phase==='ready'&&(value.spawned!==0||value.enemies.length||value.remainingMs!==30000))return null;
    if((value.phase==='cleared'||value.phase==='won')&&((value.spawned!==limit&&value.spawned!==10&&value.spawned!==20)||value.enemies.length||value.remainingMs!==0))return null;
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
    if(value.bag!==undefined&&!validBag(value.bag))return null;
    if(value.enemies.some(enemy=>enemy.armor!==undefined&&!number(enemy.armor,0,1000000)))return null;
    if(value.enemies.some(enemy=>enemy.stunSeconds!==undefined&&!number(enemy.stunSeconds,0,.5)))return null;
    if(value.enemies.some(enemy=>enemy.bossSeconds!==undefined&&(!enemy.boss||!number(enemy.bossSeconds,0,90))))return null;
    if(value.upgrades!==undefined)value.upgrades=readUpgrades(value.upgrades);
    return value as GameSave;
  }catch{return null;}
}
