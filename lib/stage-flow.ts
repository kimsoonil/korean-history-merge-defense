import {FINAL_WAVE} from './campaign.ts';
import {isStageComplete} from './rounds.ts';
import type {Difficulty} from './enemy-stats.ts';
type StageProgress={phase:string;timeLeft:number;spawned:number;maxSpawn:number;enemyCount:number;paused:boolean};
export function canCompleteStage(progress:StageProgress,stage:number,round:number,difficulty:Difficulty='hard'){
 return isStageComplete(stage,round,difficulty)&&progress.phase==='battle'&&!progress.paused&&progress.maxSpawn>0&&progress.spawned>=progress.maxSpawn&&progress.enemyCount===0;
}

/** A quiet gap between spawns is not a cleared wave. Never skip living enemies. */
export function canSkipStage({phase,timeLeft,spawned,maxSpawn,enemyCount,paused}:StageProgress){
  return phase==='battle'&&!paused&&timeLeft>0&&maxSpawn>0&&spawned>=maxSpawn&&enemyCount===0;
}

export function stageClearGold(stage:number){
  return stage<FINAL_WAVE?70+stage*15:0;
}

export const ENEMY_LIMIT=100;
export const HARD_ENEMY_LIMIT=70;
export const enemyLimit=(difficulty:Difficulty='normal')=>difficulty==='hard'?HARD_ENEMY_LIMIT:ENEMY_LIMIT;
export const isOverrun=(enemyCount:number,difficulty:Difficulty='normal')=>enemyCount>=enemyLimit(difficulty);
export function canAutoAdvanceRound({phase,timeLeft,spawned,maxSpawn,paused}:StageProgress){
  return phase==='battle'&&!paused&&timeLeft<=0&&maxSpawn>0&&spawned>=maxSpawn;
}
