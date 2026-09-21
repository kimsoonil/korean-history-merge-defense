import {FINAL_WAVE} from './campaign.ts';
import {isStageComplete} from './rounds.ts';
type StageProgress={phase:string;timeLeft:number;spawned:number;maxSpawn:number;enemyCount:number;paused:boolean};
export function canCompleteStage(progress:StageProgress,stage:number,round:number){
 return isStageComplete(stage,round)&&progress.phase==='battle'&&!progress.paused&&progress.maxSpawn>0&&progress.spawned>=progress.maxSpawn&&progress.enemyCount===0;
}

/** A quiet gap between spawns is not a cleared wave. Never skip living enemies. */
export function canSkipStage({phase,timeLeft,spawned,maxSpawn,enemyCount,paused}:StageProgress){
  return phase==='battle'&&!paused&&timeLeft>0&&maxSpawn>0&&spawned>=maxSpawn&&enemyCount===0;
}

export function stageClearGold(stage:number){
  return stage<FINAL_WAVE?70+stage*15:0;
}

export function canAutoAdvanceRound({phase,timeLeft,spawned,maxSpawn,enemyCount,paused}:StageProgress){
  return phase==='battle'&&!paused&&timeLeft<=0&&maxSpawn>0&&spawned>=maxSpawn&&enemyCount===0;
}
