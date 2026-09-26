import {byName,type Soldier,type Enemy} from './game.ts';
import {hitDamage,armorReduction,supportAttackBonus} from './combat.ts';

import {activeHeroBuffs,buffDamageMultiplier,emptyHeroBuffs,type HeroBuffs} from './hero-buffs.ts';
import type {Upgrades} from './upgrades.ts';
export const HERO_SKILLS:Record<string,{title:string;description:string;multiplier:number}>={
 이순신:{title:'거북선 총공세',description:'전체 피해 200% · 보스에게 궁극기 피해 추가 50% · 5초간 모든 아군 보스 피해 +40%',multiplier:2},
 세종대왕:{title:'훈민정음의 빛',description:'전체 피해 180% · 발동 시 20골드 획득 · 5초간 모든 아군 공격력 +30%',multiplier:1.8},
 광개토대왕:{title:'대왕의 진군',description:'전체 피해 500% · 일반 적에게 궁극기 피해 추가 30%',multiplier:5},
 을지문덕:{title:'살수의 격류',description:'전체 피해 200% · 궁극기는 적 방어도 무시 · 5초간 모든 아군 방어도 관통 +60',multiplier:2},
 김유신:{title:'화랑의 맹세',description:'전체 피해 500%',multiplier:5},
 이성계:{title:'신궁의 일격',description:'전체 피해 200% · 체력 50% 이하 적에게 궁극기 피해 2배 · 5초간 모든 아군의 체력 50% 이하 적 대상 피해 +50%',multiplier:2},
 척준경:{title:'검성의 일섬',description:'전체 피해 400% · 보스에게 궁극기 피해 2배',multiplier:4},
 정조:{title:'화성의 포효',description:'전체 피해 200% · 배치 중 모든 아군 공격속도 +15% · 5초간 모든 아군 공격속도 추가 +40% (중첩 적용)',multiplier:2},
};
export const HERO_SKILL_INTERVAL=10;
export function heroSkillDescription(name:string){const skill=HERO_SKILLS[name];return skill?`10초마다 ${skill.title}: ${skill.description}`:'';}
export function heroSkillDamage(name:string,enemy:Enemy,roster:Soldier[],stage:number,upgrades?:Upgrades,source?:Soldier,buffs:HeroBuffs=emptyHeroBuffs()){
 const skill=HERO_SKILLS[name];if(!skill)return 0;
 const caster=source??roster.find(s=>s.name===name);
 let damage=hitDamage(name,enemy,armorReduction(enemy,roster)+buffs.armor,stage,upgrades,caster?supportAttackBonus(caster,roster):0)*skill.multiplier;
 if(name==='을지문덕')damage*=1+Math.max(0,(enemy.armor??20)-armorReduction(enemy,roster)-buffs.armor)/100;
 if(name==='이순신'&&enemy.boss)damage*=1.5;
 if(name==='광개토대왕'&&!enemy.boss)damage*=1.3;
 if(name==='이성계'&&enemy.hp<=enemy.maxHp*.5)damage*=2;
 if(name==='척준경'&&enemy.boss)damage*=2;
 return damage*buffDamageMultiplier(buffs,enemy);
}
// Cooldowns survive round changes; an empty battlefield holds a charged skill.
export function heroSkillStep(roster:Soldier[],enemies:Enemy[],dt:number,stage:number,timers:Map<number,number>,upgrades?:Upgrades){
 const heroes=roster.filter(s=>byName[s.name].tier===5),ids=new Set(heroes.map(s=>s.id));
 for(const id of timers.keys())if(!ids.has(id))timers.delete(id);
 const hits=new Map<number,number>(),casts:string[]=[],casters:Soldier[]=[];let gold=0,hearts=0;
 for(const hero of heroes){
  const remaining=Math.max(0,(timers.get(hero.id)??HERO_SKILL_INTERVAL)-dt);
  if(remaining>1e-8||!enemies.length){timers.set(hero.id,remaining);continue;}
  timers.set(hero.id,HERO_SKILL_INTERVAL);casts.push(hero.name);
  casters.push(hero);
  if(hero.name==='세종대왕')gold+=20;
  if(hero.name==='김유신')hearts++;
 }
 const buffs=activeHeroBuffs(roster,timers);
 for(const hero of casters)for(const enemy of enemies)hits.set(enemy.id,(hits.get(enemy.id)??0)+heroSkillDamage(hero.name,enemy,roster,stage,upgrades,hero,buffs));
 return {hits,casts,gold,hearts};
}
