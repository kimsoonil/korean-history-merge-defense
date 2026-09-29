export type GoldGamble={id:string;cost:number;maxReward:number;unlockRound:number};
export type UnitGamble={tier:1|2|3;cost:number;failureChance:number;refund:number;unlockRound:number};

export const goldGambles:GoldGamble[]=[
 {id:'small',cost:100,maxReward:500,unlockRound:1},
 {id:'medium',cost:500,maxReward:2000,unlockRound:10},
 {id:'large',cost:1000,maxReward:5000,unlockRound:20},
];
export const unitGambles:UnitGamble[]=[
 {tier:1,cost:500,failureChance:.1,refund:100,unlockRound:1},
 {tier:2,cost:1000,failureChance:.3,refund:200,unlockRound:10},
 {tier:3,cost:3000,failureChance:.5,refund:500,unlockRound:20},
];

export const gambleUnlocked=(round:number,unlockRound:number)=>round>=unlockRound;
const sample=(rng:()=>number)=>Math.min(.999999999,Math.max(0,rng()));
export function playGoldGamble(option:GoldGamble,gold:number,rng=Math.random){
 if(gold<option.cost)return null;
 const reward=Math.floor(sample(rng)*(option.maxReward+1));
 return {gold:gold-option.cost+reward,reward};
}
export function playUnitGamble(option:UnitGamble,gold:number,names:string[],rng=Math.random){
 if(gold<option.cost||names.length===0)return null;
 if(sample(rng)<option.failureChance)return {gold:gold-option.cost+option.refund,success:false as const,refund:option.refund,name:null};
 const name=names[Math.floor(sample(rng)*names.length)];
 return {gold:gold-option.cost,success:true as const,refund:0,name};
}
