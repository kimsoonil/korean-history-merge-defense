import type {Difficulty} from './enemy-stats.ts';

export const stageRoundCount=(stage:number,difficulty:Difficulty='hard')=>difficulty==='normal'?15+(stage-1)*3:20+(stage-1)*5;

export function bossRounds(stage:number,difficulty:Difficulty='hard'){
 const total=stageRoundCount(stage,difficulty);
 if(difficulty==='hard')return Array.from({length:total},(_,index)=>index+1).filter(round=>round===total||round>=10&&round<=60&&round%5===0);
 // Normal stages retain their stage-scaled, roughly three-to-four-round boss cadence.
 return Array.from({length:stage+1},(_,index)=>Math.round(10+index*(total-10)/stage));
}
