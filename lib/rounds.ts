export const stageRoundCount=(stage:number)=>20+(stage-1)*5;
export const roundBossName=(stage:number,round:number)=>stage===8&&round===stageRoundCount(stage)?'수양제':(round<=20?round%10===0:round%5===0)?'수나라 장군':null;
// Boss rounds contain one boss and nine regular enemies.
export const roundEnemyCount=(_stage:number,_round:number)=>10;
export const roundKey=(stage:number,round:number)=>stage*100+round;
export const isStageComplete=(stage:number,round:number)=>round===stageRoundCount(stage);
export const isCampaignComplete=(stage:number,round:number)=>stage===8&&isStageComplete(stage,round);
export function nextRound(stage:number,round:number){
 if(isStageComplete(stage,round))return null;
 return {stage,round:round+1};
}
