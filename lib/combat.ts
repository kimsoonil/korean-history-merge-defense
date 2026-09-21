import {byName,pathAt,type Soldier,type Enemy,type UnitDef} from './game.ts';
export function roleStats(tier:number){const t=Math.max(1,Math.min(5,tier));return {support:(5+5*t)/100,mobility:(10+10*t)/100,tactics:(15+5*t)/100,damage:5*t/100,boss:(5+5*t)/100,splash:10+2*t};}
export function roleDescription(u:UnitDef){const s=roleStats(u.tier),pct=(n:number)=>Math.round(n*100);return ({지원:`주변 공격속도 +${pct(s.support)}% · 최고 효과만 적용`,책략:`사거리 내 적 이동속도·방어도 -${pct(s.tactics)}% · 최고 효과만 적용`,전열:`공격 피해 +${pct(s.damage)}%`,화포:`공격 피해 +${pct(s.damage)}%`,기동:`자신 공격속도 +${pct(s.mobility)}%`,수군:`범위 공격 · 반경 ${s.splash} (1단계 대비 ${Math.round(s.splash/12*100)}%)`,군주:`보스 공격 피해 +${pct(s.boss)}%`} as Record<string,string>)[u.role]??'';}
export const unitPosition=(slot:number)=>({x:17+(slot%8+.5)*66/8,y:18+(Math.floor(slot/8)+.5)*64/5});
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function attackRate(soldier:Soldier,roster:Soldier[]){
 const unit=byName[soldier.name],support=Math.max(0,...roster.filter(ally=>ally.id!==soldier.id&&byName[ally.name].role==='지원'&&distance(unitPosition(soldier.slot),unitPosition(ally.slot))<=22).map(ally=>roleStats(byName[ally.name].tier).support));
 return unit.rate*(1+(unit.role==='기동'?roleStats(unit.tier).mobility:0)+support+(roster.some(s=>s.name==='정조')?.15:0));
}
export function weakening(enemy:Enemy,roster:Soldier[]){return Math.max(0,...roster.filter(s=>byName[s.name].role==='책략'&&distance(unitPosition(s.slot),pathAt(enemy.progress))<=byName[s.name].range*8.8).map(s=>roleStats(byName[s.name].tier).tactics));}
export function isWeakened(enemy:Enemy,roster:Soldier[]){return weakening(enemy,roster)>0;}
export function movementSpeed(enemy:Enemy,roster:Soldier[]){return enemy.speed*(1-weakening(enemy,roster));}
// A uniform 20-point base armor makes armor reduction distinct from a direct damage bonus.
export function hitDamage(name:string,enemy:Enemy,weakened:number|boolean,stage:number){
 const u=byName[name],stats=roleStats(u.tier),armor=20*(1-(typeof weakened==='boolean'?(weakened?.2:0):weakened));
 return u.damage*(u.role==='전열'||u.role==='화포'?1+stats.damage:1)*(u.role==='군주'&&enemy.boss?1+stats.boss:1)
  *(enemy.boss&&['이순신','을지문덕','척준경'].includes(name)?1.6:1)*(stage===8&&name==='을지문덕'?1.5:1)*100/(100+armor);
}
export function combatStep(roster:Soldier[],enemies:Enemy[],dt:number,stage:number,cooldowns:Map<number,number>){
 const hits=new Map<number,number>(),shots:{from:{x:number;y:number};to:{x:number;y:number};color:string}[]=[];
 const aliveIds=new Set(roster.map(s=>s.id));for(const id of cooldowns.keys())if(!aliveIds.has(id))cooldowns.delete(id);
 for(const soldier of roster){
  const u=byName[soldier.name],from=unitPosition(soldier.slot),targets=enemies.filter(e=>distance(from,pathAt(e.progress))<u.range*8.8).sort((a,b)=>b.progress-a.progress);
  let cooldown=(cooldowns.get(soldier.id)??0)-dt;
  if(!targets.length){cooldowns.set(soldier.id,Math.max(0,cooldown));continue;}
  const target=targets[0];
  while(cooldown<=0){
   const victims=u.role==='수군'?enemies.filter(e=>distance(pathAt(target.progress),pathAt(e.progress))<=roleStats(u.tier).splash):[target];
   for(const victim of victims)hits.set(victim.id,(hits.get(victim.id)??0)+hitDamage(u.name,victim,weakening(victim,roster),stage));
   // Preserve the existing high-tier secondary strike without doubling naval splash.
   if(u.role!=='수군'&&u.tier>=4&&targets[1]){const e=targets[1];hits.set(e.id,(hits.get(e.id)??0)+hitDamage(u.name,e,weakening(e,roster),stage)*.32);}
   if(shots.length<14)shots.push({from,to:pathAt(target.progress),color:u.role==='수군'?'#aee9ed':u.role==='화포'?'#ffbb79':'#fff0b4'});
   cooldown+=1/attackRate(soldier,roster);
  }
  cooldowns.set(soldier.id,cooldown);
 }
 return {hits,shots};
}
