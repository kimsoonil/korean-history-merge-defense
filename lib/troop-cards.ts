export const START_TROOP_CARDS=4;
export const ROUND_TROOP_CARDS=3;
export const BOSS_TROOP_CARDS=4;
export const RECRUIT_TROOP_COST=1;

export function bossUnitRewardTier(round:number):2|3|4|5|6|null{
 if(round>=10&&round<15)return 2;
 if(round>=15&&round<25)return 3;
 if(round>=25&&round<40)return 4;
 if(round>=40&&round<55)return 5;
 if(round>=55&&round<=60)return 6;
 return null;
}

export function bossCitizenRewardCount(round:number){
 if(round>=50&&round<=60)return 4;
 if(round>=30&&round<50)return 3;
 if(round>=10&&round<30)return 2;
 return 0;
}

export function randomName(names:string[],rng=Math.random){
 if(!names.length)return null;
 const roll=Math.min(.999999999,Math.max(0,rng()));
 return names[Math.floor(roll*names.length)];
}
