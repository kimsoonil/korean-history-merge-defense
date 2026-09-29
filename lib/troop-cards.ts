export const START_TROOP_CARDS=4;
export const ROUND_TROOP_CARDS=3;
export const BOSS_TROOP_CARDS=3;
export const RECRUIT_TROOP_COST=1;

export function bossUnitRewardTier(round:number):2|3|4|null{
 if(round===10||round===20)return 2;
 if(round===30||round===40)return 3;
 if(round===50||round===60)return 4;
 return null;
}

export function randomName(names:string[],rng=Math.random){
 if(!names.length)return null;
 const roll=Math.min(.999999999,Math.max(0,rng()));
 return names[Math.floor(roll*names.length)];
}
