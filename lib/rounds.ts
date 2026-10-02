import type {ChapterId} from './ansi.ts';
import type {Difficulty} from './enemy-stats.ts';
import {storyBossName} from './story-battle.ts';
import {stageRoundCount,bossRounds} from './round-config.ts';
export {stageRoundCount,bossRounds} from './round-config.ts';
// Encounter progression is local to each stage; every new stage starts at one.
export const globalRound=(_stage:number,round:number)=>round;
export const bossNames:Record<number,string>={10:'수나라 선봉장',20:'수나라 공성대장',30:'우문술',40:'내호아',50:'우중문',60:'우중문 & 우문술',65:'수양제'};
export const roundBossName=(stage:number,round:number,chapter:ChapterId=1,difficulty:Difficulty='hard')=>storyBossName(chapter,stage,round,difficulty);
// Bosses count toward the total: normal 14 + boss, hard 19 + boss.
export const roundEnemyCount=(_stage:number,_round:number,difficulty:'normal'|'hard'='normal')=>difficulty==='hard'?20:15;
// Each boss is preceded by a supply cart in the previous round, including the final boss.
export const isSupplyRound=(stage:number,round:number,difficulty:Difficulty='hard')=>bossRounds(stage,difficulty).includes(round+1);
export const supplyCartReward=(stage:number,round:number,difficulty:Difficulty='hard')=>{
 const index=bossRounds(stage,difficulty).indexOf(round+1);
 return index<0?0:100*2**index;
};
export const roundKey=(stage:number,round:number)=>stage*100+round;
export const ROUND_CLEAR_GOLD=50;
export const isStageComplete=(stage:number,round:number,difficulty:Difficulty='hard')=>round===stageRoundCount(stage,difficulty);
export const isCampaignComplete=(stage:number,round:number,difficulty:Difficulty='hard')=>stage===10&&isStageComplete(stage,round,difficulty);
export function nextRound(stage:number,round:number,difficulty:Difficulty='hard'){
 if(isStageComplete(stage,round,difficulty))return null;
 return {stage,round:round+1};
}
