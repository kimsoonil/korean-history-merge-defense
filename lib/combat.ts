import {byName,pathAt,type Soldier,type Enemy,type UnitDef} from './game.ts';
import {emptyHeroBuffs,buffDamageMultiplier,type HeroBuffs} from './hero-buffs.ts';
import {upgradedAttack,type Upgrades} from './upgrades.ts';
import {fieldPosition,LANE_RANGE_ALLOWANCE} from './battlefield.ts';
export function roleStats(tier:number){const t=Math.max(1,Math.min(5,tier));return {support:(5+5*t)/100,mobility:(10+10*t)/100,tactics:(15+5*t)/100,damage:5*t/100,boss:(5+5*t)/100,armorReduction:20*t,stun:t/10,stunChance:(5+5*t)/100,mobilityAura:(10+10*t)/100*.3};}
export function roleDescription(u:UnitDef){const s=roleStats(u.tier),pct=(n:number)=>Math.round(n*100),armor=`사거리 내 적 방어도 -${s.armorReduction} · 중첩 적용`;return (({만능:'공격하지 않음 · 모든 1단계 조합 재료 대체',지원:`주변 공격속도·공격력 +${pct(s.support)}% · 중첩 적용`,책략:`적 이동속도 -${pct(s.tactics)}% · ${armor}`,전열:`공격 피해 +${pct(s.damage)}% · 공격 시 ${pct(s.stunChance)}% 확률로 ${s.stun}초 스턴`,화포:`공격 피해 +${pct(s.damage)}%`,기동:`자신 공격속도 +${pct(s.mobility)}% · 주변 공격속도 +${pct(s.mobilityAura)}% · 중첩 적용`,수성:`${armor} · 공격 시 ${pct(s.stunChance)}% 확률로 ${s.stun}초 스턴`,수군:`단일 공격 · ${armor}`,군주:`보스 공격 피해 +${pct(s.boss)}%`} as Record<string,string>)[u.role]??'')+(u.tier===5&&['군주','기동'].includes(u.role)?` · ${armor}`:'');}
export const unitPosition=fieldPosition;
export const attackRadius=(unit:UnitDef)=>unit.range*8.8+LANE_RANGE_ALLOWANCE;
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function attackRate(soldier:Soldier,roster:Soldier[]){
 const unit=byName[soldier.name],support=roster.filter(ally=>ally.id!==soldier.id&&distance(unitPosition(soldier.slot),unitPosition(ally.slot))<=22).reduce((sum,ally)=>{const u=byName[ally.name],stats=roleStats(u.tier);return sum+(u.role==='지원'?stats.support:u.role==='기동'?stats.mobilityAura:0);},0);
 return unit.rate*(1+(unit.role==='기동'?roleStats(unit.tier).mobility:0)+support+roster.filter(s=>s.name==='정조').length*.15);
}
export function weakening(enemy:Enemy,roster:Soldier[]){return Math.max(0,...roster.filter(s=>byName[s.name].role==='책략'&&distance(unitPosition(s.slot),pathAt(enemy.progress))<=attackRadius(byName[s.name])).map(s=>roleStats(byName[s.name].tier).tactics));}
export function isWeakened(enemy:Enemy,roster:Soldier[]){return weakening(enemy,roster)>0;}
export function armorReduction(enemy:Enemy,roster:Soldier[]){return roster.filter(s=>{const u=byName[s.name];return (['책략','수군','수성'].includes(u.role)||u.tier===5&&['군주','기동'].includes(u.role))&&distance(unitPosition(s.slot),pathAt(enemy.progress))<=attackRadius(u);}).map(s=>roleStats(byName[s.name].tier).armorReduction).reduce((sum,value)=>sum+value,0);}
export function supportAttackBonus(soldier:Soldier,roster:Soldier[]){return roster.filter(s=>s.id!==soldier.id&&byName[s.name].role==='지원'&&distance(unitPosition(s.slot),unitPosition(soldier.slot))<=22).map(s=>roleStats(byName[s.name].tier).support).reduce((sum,value)=>sum+value,0);}
export function movementSpeed(enemy:Enemy,roster:Soldier[]){return enemy.speed*(1-weakening(enemy,roster));}
// Legacy saved enemies without armor retain their original 20-point defense.
export function hitDamage(name:string,enemy:Enemy,reduction:number|boolean,stage:number,upgrades?:Upgrades,support=0){
 const u=byName[name],stats=roleStats(u.tier),armor=Math.max(0,(enemy.armor??20)-(typeof reduction==='boolean'?(reduction?20:0):reduction));
 return upgradedAttack(u,upgrades)*(1+support)*(u.role==='전열'||u.role==='화포'?1+stats.damage:1)*(u.role==='군주'&&enemy.boss?1+stats.boss:1)
  *(enemy.boss&&['이순신','을지문덕','척준경'].includes(name)?1.6:1)*((enemy.chapter??1)===1&&stage===8&&name==='을지문덕'?1.5:1)*100/(100+armor);
}
export function combatStep(roster:Soldier[],enemies:Enemy[],dt:number,stage:number,cooldowns:Map<number,number>,upgrades?:Upgrades,random:()=>number=Math.random,buffs:HeroBuffs=emptyHeroBuffs()){
 const hits=new Map<number,number>(),stuns=new Map<number,number>(),shots:{from:{x:number;y:number};to:{x:number;y:number};color:string}[]=[];
 const aliveIds=new Set(roster.map(s=>s.id));for(const id of cooldowns.keys())if(!aliveIds.has(id))cooldowns.delete(id);
 for(const soldier of roster){
  const u=byName[soldier.name];
  if(u.damage<=0){cooldowns.set(soldier.id,0);continue;}
  const from=unitPosition(soldier.slot),targets=enemies.filter(e=>distance(from,pathAt(e.progress))<attackRadius(u)).sort((a,b)=>b.progress-a.progress);
  let cooldown=(cooldowns.get(soldier.id)??0)-dt;
  if(!targets.length){cooldowns.set(soldier.id,Math.max(0,cooldown));continue;}
  const target=targets[0];
  while(cooldown<=0){
   const stunTriggered=['전열','수성'].includes(u.role)&&random()<roleStats(u.tier).stunChance;
   const victims=[target];
   for(const victim of victims){hits.set(victim.id,(hits.get(victim.id)??0)+hitDamage(u.name,victim,armorReduction(victim,roster)+buffs.armor,stage,upgrades,supportAttackBonus(soldier,roster))*buffDamageMultiplier(buffs,victim));if(stunTriggered)stuns.set(victim.id,Math.max(stuns.get(victim.id)??0,roleStats(u.tier).stun));}
   // Preserve the existing high-tier secondary strike without doubling naval splash.
   if(u.role!=='수군'&&u.tier>=4&&targets[1]){const e=targets[1];hits.set(e.id,(hits.get(e.id)??0)+hitDamage(u.name,e,armorReduction(e,roster)+buffs.armor,stage,upgrades,supportAttackBonus(soldier,roster))*buffDamageMultiplier(buffs,e)*.32);if(stunTriggered)stuns.set(e.id,Math.max(stuns.get(e.id)??0,roleStats(u.tier).stun));}
   if(shots.length<14)shots.push({from,to:pathAt(target.progress),color:u.role==='수군'?'#aee9ed':u.role==='화포'?'#ffbb79':'#fff0b4'});
   cooldown+=1/(attackRate(soldier,roster)+u.rate*buffs.speed);
  }
  cooldowns.set(soldier.id,cooldown);
 }
 return {hits,shots,stuns};
}
export function advanceEnemy(enemy:Enemy,roster:Soldier[],dt:number,stun=0){
 const remaining=Math.max(enemy.stunSeconds??0,stun),movingTime=Math.max(0,dt-remaining);
 return {...enemy,stunSeconds:Math.max(0,remaining-dt),progress:(enemy.progress+movementSpeed(enemy,roster)*movingTime)%1};
}
