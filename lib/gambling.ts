import type {Difficulty} from './enemy-stats.ts';

export type GoldGambleCategory='대실패'|'소실패'|'본전'|'성공'|'대성공'|'대박';
export type GoldGambleOutcome={category:GoldGambleCategory;multiplier:number;chance:number};
export type GoldGamble={id:'small'|'medium'|'large';cost:number;maxReward:number;unlockRound:number};
export type UnitGamble={tier:1|2|3;cost:number;failureChance:number;refund:number;unlockRound:number};
export type UnitGambleUsage={block:number;successes:Record<1|2|3,number>};
export type GambleState={round:number;difficulty:Difficulty;attempts:number;cooldownUntil:number;goldFailures:Record<GoldGamble['id'],number>;unitFailures:Record<1|2|3,number>};

export const GAMBLE_COOLDOWN_MS=3000;
export const GAMBLE_ROUND_LIMIT:Record<Difficulty,number>={normal:3,hard:2};
export const GAMBLE_PITY_STEP:Record<Difficulty,number>={normal:.03,hard:.04};
export const GAMBLE_GUARANTEE_AFTER:Record<Difficulty,number>={normal:6,hard:7};
export const goldGambles:GoldGamble[]=[
 {id:'small',cost:100,maxReward:700,unlockRound:1},
 {id:'medium',cost:500,maxReward:3500,unlockRound:10},
 {id:'large',cost:1000,maxReward:7000,unlockRound:20},
];
export const unitGambles:UnitGamble[]=[
 {tier:1,cost:500,failureChance:.1,refund:100,unlockRound:1},
 {tier:2,cost:1000,failureChance:.3,refund:200,unlockRound:10},
 {tier:3,cost:3000,failureChance:.5,refund:500,unlockRound:20},
];
const GOLD_OUTCOMES:Record<Difficulty,GoldGambleOutcome[]>={
 normal:[{category:'대실패',multiplier:0,chance:.1},{category:'소실패',multiplier:.5,chance:.2},{category:'본전',multiplier:1,chance:.2},{category:'성공',multiplier:1.3,chance:.4},{category:'대성공',multiplier:1.5,chance:.09},{category:'대박',multiplier:6,chance:.01}],
 hard:[{category:'대실패',multiplier:0,chance:.2},{category:'소실패',multiplier:.5,chance:.3},{category:'본전',multiplier:1,chance:.2},{category:'성공',multiplier:1.7,chance:.23},{category:'대성공',multiplier:2.5,chance:.06},{category:'대박',multiplier:7,chance:.01}],
};

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

export const emptyGambleState=(round=1,difficulty:Difficulty='normal'):GambleState=>({round,difficulty,attempts:0,cooldownUntil:0,goldFailures:{small:0,medium:0,large:0},unitFailures:{1:0,2:0,3:0}});
const validFailures=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=100;
export function readGambleState(value:unknown,round:number,difficulty:Difficulty):GambleState{
 const fallback=emptyGambleState(round,difficulty);
 if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
 const raw=value as Partial<GambleState>;
 if(!Number.isSafeInteger(raw.round)||typeof raw.round!=='number'||raw.round<1||raw.difficulty!==difficulty||!Number.isSafeInteger(raw.attempts)||typeof raw.attempts!=='number'||raw.attempts<0||raw.attempts>GAMBLE_ROUND_LIMIT[difficulty]||typeof raw.cooldownUntil!=='number'||!Number.isFinite(raw.cooldownUntil)||raw.cooldownUntil<0||!raw.goldFailures||!raw.unitFailures)return fallback;
 const gold=raw.goldFailures as Record<string,unknown>,unit=raw.unitFailures as Record<string,unknown>;
 if(!['small','medium','large'].every(id=>validFailures(gold[id]))||![1,2,3].every(tier=>validFailures(unit[tier])))return fallback;
 return {round,difficulty,attempts:raw.round===round?raw.attempts:0,cooldownUntil:raw.cooldownUntil,goldFailures:{small:gold.small as number,medium:gold.medium as number,large:gold.large as number},unitFailures:{1:unit[1] as number,2:unit[2] as number,3:unit[3] as number}};
}
export const syncGambleState=(state:GambleState,round:number,difficulty:Difficulty)=>state.round===round&&state.difficulty===difficulty?state:{...state,round,difficulty,attempts:0,cooldownUntil:0};
export const gambleAttemptsRemaining=(state:GambleState,round:number,difficulty:Difficulty)=>Math.max(0,GAMBLE_ROUND_LIMIT[difficulty]-syncGambleState(state,round,difficulty).attempts);
export const gambleCooldownRemaining=(state:GambleState,now=Date.now())=>Math.max(0,state.cooldownUntil-now);
export const canGamble=(state:GambleState,round:number,difficulty:Difficulty,now=Date.now())=>gambleAttemptsRemaining(state,round,difficulty)>0&&gambleCooldownRemaining(syncGambleState(state,round,difficulty),now)===0;
export const gamblePityBonus=(failures:number,difficulty:Difficulty)=>failures>=GAMBLE_GUARANTEE_AFTER[difficulty]?1:failures*GAMBLE_PITY_STEP[difficulty];
export function goldGambleOutcomes(difficulty:Difficulty,failures=0,pityStepBonus=0):GoldGambleOutcome[]{
 const base=GOLD_OUTCOMES[difficulty];
 if(failures>=GAMBLE_GUARANTEE_AFTER[difficulty])return base.map(item=>({...item,chance:item.category==='성공'?1:0}));
 const failureTotal=base.filter(item=>item.multiplier<1).reduce((sum,item)=>sum+item.chance,0),bonus=Math.min(failureTotal,failures*(GAMBLE_PITY_STEP[difficulty]+pityStepBonus));
 return base.map(item=>item.multiplier<1?{...item,chance:item.chance*(failureTotal-bonus)/failureTotal}:item.category==='성공'?{...item,chance:item.chance+bonus}:{...item});
}
export const goldSuccessChance=(difficulty:Difficulty,failures=0)=>goldGambleOutcomes(difficulty,failures).filter(item=>item.multiplier>1).reduce((sum,item)=>sum+item.chance,0);
export const unitSuccessChance=(option:UnitGamble,difficulty:Difficulty,failures=0,pityStepBonus=0)=>failures>=GAMBLE_GUARANTEE_AFTER[difficulty]?1:Math.min(1,1-option.failureChance+failures*(GAMBLE_PITY_STEP[difficulty]+pityStepBonus));
const sample=(rng:()=>number)=>Math.min(.999999999,Math.max(0,rng()));
export function playGoldGamble(option:GoldGamble,gold:number,difficultyOrRng:Difficulty|(()=>number)='normal',failures=0,rng=Math.random,pityStepBonus=0){
 if(gold<option.cost)return null;
 const difficulty=typeof difficultyOrRng==='function'?'normal':difficultyOrRng;
 if(typeof difficultyOrRng==='function')rng=difficultyOrRng;
 const outcomes=goldGambleOutcomes(difficulty,failures,pityStepBonus),roll=sample(rng);let cumulative=0,outcome=outcomes.at(-1)!;
 for(const candidate of outcomes){cumulative+=candidate.chance;if(roll<cumulative){outcome=candidate;break;}}
 const reward=Math.round(option.cost*outcome.multiplier),net=reward-option.cost;
 return {gold:gold+net,reward,category:outcome.category,outcome:net>0?'success' as const:net<0?'failure' as const:'draw' as const};
}
export function goldGambleResult(option:GoldGamble,reward:number,category:GoldGambleCategory='본전'){
 const net=reward-option.cost;return {net,outcome:net>0?'success' as const:net<0?'failure' as const:'draw' as const,category};
}
export function playUnitGamble(option:UnitGamble,gold:number,names:string[],difficultyOrRng:Difficulty|(()=>number)='normal',failures=0,rng=Math.random,pityStepBonus=0){
 if(gold<option.cost||names.length===0)return null;
 const difficulty=typeof difficultyOrRng==='function'?'normal':difficultyOrRng;
 if(typeof difficultyOrRng==='function')rng=difficultyOrRng;
 if(sample(rng)>=unitSuccessChance(option,difficulty,failures,pityStepBonus))return {gold:gold-option.cost+option.refund,success:false as const,refund:option.refund,name:null};
 const name=names[Math.floor(sample(rng)*names.length)];return {gold:gold-option.cost,success:true as const,refund:0,name};
}
export function recordGoldGamble(state:GambleState,round:number,difficulty:Difficulty,id:GoldGamble['id'],outcome:'success'|'failure'|'draw',now=Date.now()):GambleState{
 const current=syncGambleState(state,round,difficulty),failures=outcome==='failure'?current.goldFailures[id]+1:outcome==='success'?0:current.goldFailures[id];
 return {...current,attempts:current.attempts+1,cooldownUntil:now+GAMBLE_COOLDOWN_MS,goldFailures:{...current.goldFailures,[id]:failures}};
}
export function recordUnitGamble(state:GambleState,round:number,difficulty:Difficulty,tier:1|2|3,success:boolean,now=Date.now()):GambleState{
 const current=syncGambleState(state,round,difficulty),failures=success?0:current.unitFailures[tier]+1;
 return {...current,attempts:current.attempts+1,cooldownUntil:now+GAMBLE_COOLDOWN_MS,unitFailures:{...current.unitFailures,[tier]:failures}};
}
