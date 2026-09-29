export type GoldGambleOutcome={category:'대실패'|'소실패'|'본전'|'중박'|'대박';net:number;chance:number};
export type GoldGamble={id:string;cost:number;maxReward:number;unlockRound:number;outcomes:GoldGambleOutcome[]};
export type UnitGamble={tier:1|2|3;cost:number;failureChance:number;refund:number;unlockRound:number};
export type UnitGambleUsage={block:number;successes:Record<1|2|3,number>};

export const goldGambles:GoldGamble[]=[
 {id:'small',cost:100,maxReward:600,unlockRound:1,outcomes:[{category:'대실패',net:-100,chance:.2},{category:'소실패',net:-50,chance:.2},{category:'본전',net:0,chance:.35},{category:'중박',net:200,chance:.2},{category:'대박',net:500,chance:.05}]},
 {id:'medium',cost:500,maxReward:1500,unlockRound:10,outcomes:[{category:'대실패',net:-500,chance:.2},{category:'소실패',net:-250,chance:.2},{category:'본전',net:0,chance:.35},{category:'중박',net:400,chance:.2},{category:'대박',net:1000,chance:.05}]},
 {id:'large',cost:1000,maxReward:4000,unlockRound:20,outcomes:[{category:'대실패',net:-1000,chance:.2},{category:'소실패',net:-500,chance:.2},{category:'본전',net:0,chance:.35},{category:'중박',net:1200,chance:.2},{category:'대박',net:3000,chance:.05}]},
];
export const unitGambles:UnitGamble[]=[
 {tier:1,cost:500,failureChance:.1,refund:100,unlockRound:1},
 {tier:2,cost:1000,failureChance:.3,refund:200,unlockRound:10},
 {tier:3,cost:3000,failureChance:.5,refund:500,unlockRound:20},
];

export const gambleUnlocked=(round:number,unlockRound:number)=>round>=unlockRound;
export const UNIT_GAMBLE_LIMITS:Record<1|2|3,number>={1:10,2:5,3:2};
export const unitGambleBlock=(round:number)=>Math.floor((Math.max(1,round)-1)/10);
export const emptyUnitGambleUsage=(round=1):UnitGambleUsage=>({block:unitGambleBlock(round),successes:{1:0,2:0,3:0}});
export function readUnitGambleUsage(value:unknown,round:number):UnitGambleUsage{
 const fallback=emptyUnitGambleUsage(round);
 if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
 const raw=value as {block?:unknown;successes?:unknown};
 if(typeof raw.block!=='number'||!Number.isSafeInteger(raw.block)||raw.block<0||raw.block!==unitGambleBlock(round)||!raw.successes||typeof raw.successes!=='object'||Array.isArray(raw.successes))return fallback;
 const successes=raw.successes as Record<string,unknown>;
 for(const tier of [1,2,3] as const)if(typeof successes[tier]!=='number'||!Number.isSafeInteger(successes[tier])||successes[tier]<0||successes[tier]>UNIT_GAMBLE_LIMITS[tier])return fallback;
 return {block:raw.block,successes:{1:successes[1] as number,2:successes[2] as number,3:successes[3] as number}};
}
export const unitGamblesRemaining=(tier:1|2|3,round:number,usage:UnitGambleUsage)=>UNIT_GAMBLE_LIMITS[tier]-(usage.block===unitGambleBlock(round)?usage.successes[tier]:0);
export function recordUnitGambleSuccess(tier:1|2|3,round:number,usage:UnitGambleUsage):UnitGambleUsage{
 const current=usage.block===unitGambleBlock(round)?usage:emptyUnitGambleUsage(round);
 return {...current,successes:{...current.successes,[tier]:Math.min(UNIT_GAMBLE_LIMITS[tier],current.successes[tier]+1)}};
}
const sample=(rng:()=>number)=>Math.min(.999999999,Math.max(0,rng()));
export function playGoldGamble(option:GoldGamble,gold:number,rng=Math.random){
 if(gold<option.cost)return null;
 const roll=sample(rng);let cumulative=0,outcome=option.outcomes.at(-1)!;
 for(const candidate of option.outcomes){cumulative+=candidate.chance;if(roll<cumulative){outcome=candidate;break;}}
 const reward=option.cost+outcome.net;
 return {gold:gold+outcome.net,reward,category:outcome.category};
}
export function goldGambleResult(option:GoldGamble,reward:number){
 const net=reward-option.cost;
 return {net,outcome:net>0?'success' as const:net<0?'failure' as const:'draw' as const,category:option.outcomes.find(result=>result.net===net)?.category??'본전'};
}
export function playUnitGamble(option:UnitGamble,gold:number,names:string[],rng=Math.random){
 if(gold<option.cost||names.length===0)return null;
 if(sample(rng)<option.failureChance)return {gold:gold-option.cost+option.refund,success:false as const,refund:option.refund,name:null};
 const name=names[Math.floor(sample(rng)*names.length)];
 return {gold:gold-option.cost,success:true as const,refund:0,name};
}
