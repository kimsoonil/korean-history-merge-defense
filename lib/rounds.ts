import {nadangBossName} from './nadang.ts';
import {hwangsanBossName} from './hwangsan.ts';
import {ansiBossName,type ChapterId} from './ansi.ts';
export const stageRoundCount=(stage:number)=>20+(stage-1)*5;
// Encounter progression is local to each stage; every new stage starts at one.
export const globalRound=(_stage:number,round:number)=>round;
export const bossNames:Record<number,string>={10:'수나라 선봉장',20:'수나라 공성대장',30:'우문술',40:'내호아',50:'우중문',60:'우중문 & 우문술',65:'수양제'};
export const roundBossName=(stage:number,round:number,chapter:ChapterId=1)=>{if(chapter===4)return nadangBossName(stage,round);if(chapter===3)return hwangsanBossName(stage,round);if(chapter===2)return ansiBossName(stage,round);const n=globalRound(stage,round);if(n===65)return stage===10?'수양제':null;return bossNames[n]??((n===10||n>=20&&n%5===0)?'수나라 장군':null);};
// Bosses count toward the total: normal 14 + boss, hard 19 + boss.
export const roundEnemyCount=(_stage:number,_round:number,difficulty:'normal'|'hard'='normal')=>difficulty==='hard'?20:15;
export const roundKey=(stage:number,round:number)=>stage*100+round;
export const ROUND_CLEAR_GOLD=50;
export const isStageComplete=(stage:number,round:number)=>round===stageRoundCount(stage);
export const isCampaignComplete=(stage:number,round:number)=>stage===10&&isStageComplete(stage,round);
export function nextRound(stage:number,round:number){
 if(isStageComplete(stage,round))return null;
 return {stage,round:round+1};
}
