import {byName,type Soldier,type Enemy} from './game.ts';
import {hitDamage,weakening} from './combat.ts';

export const HERO_SKILLS:Record<string,{title:string;description:string;multiplier:number}>={
 이순신:{title:'거북선 총공세',description:'전체 피해 200% · 보스에게 궁극기 피해 추가 50%',multiplier:2},
 세종대왕:{title:'훈민정음의 빛',description:'전체 피해 180% · 발동 시 20골드 획득',multiplier:1.8},
 광개토대왕:{title:'대왕의 진군',description:'전체 피해 240% · 일반 적에게 궁극기 피해 추가 30%',multiplier:2.4},
 을지문덕:{title:'살수의 격류',description:'전체 피해 200% · 궁극기는 적 방어도 무시',multiplier:2},
 김유신:{title:'화랑의 맹세',description:'전체 피해 220% · 발동 시 하트 1 회복 (최대 10)',multiplier:2.2},
 이성계:{title:'신궁의 일격',description:'전체 피해 200% · 체력 50% 이하 적에게 궁극기 피해 2배',multiplier:2},
 척준경:{title:'검성의 일섬',description:'전체 피해 200% · 보스에게 궁극기 피해 2배',multiplier:2},
 정조:{title:'화성의 포효',description:'전체 피해 200% · 배치 중 모든 아군 공격속도 +15% (중첩 불가)',multiplier:2},
};
export const HERO_SKILL_INTERVAL=10;
export function heroSkillDescription(name:string){const skill=HERO_SKILLS[name];return skill?`10초마다 ${skill.title}: ${skill.description}`:'';}
export function heroSkillDamage(name:string,enemy:Enemy,roster:Soldier[],stage:number){
 const skill=HERO_SKILLS[name];if(!skill)return 0;
 let damage=hitDamage(name,enemy,weakening(enemy,roster),stage)*skill.multiplier;
 if(name==='을지문덕')damage*=1+20*(1-weakening(enemy,roster))/100;
 if(name==='이순신'&&enemy.boss)damage*=1.5;
 if(name==='광개토대왕'&&!enemy.boss)damage*=1.3;
 if(name==='이성계'&&enemy.hp<=enemy.maxHp*.5)damage*=2;
 if(name==='척준경'&&enemy.boss)damage*=2;
 return damage;
}
// Cooldowns survive round changes; an empty battlefield holds a charged skill.
export function heroSkillStep(roster:Soldier[],enemies:Enemy[],dt:number,stage:number,timers:Map<number,number>){
 const heroes=roster.filter(s=>byName[s.name].tier===5),ids=new Set(heroes.map(s=>s.id));
 for(const id of timers.keys())if(!ids.has(id))timers.delete(id);
 const hits=new Map<number,number>(),casts:string[]=[];let gold=0,hearts=0;
 for(const hero of heroes){
  const remaining=Math.max(0,(timers.get(hero.id)??HERO_SKILL_INTERVAL)-dt);
  if(remaining>1e-8||!enemies.length){timers.set(hero.id,remaining);continue;}
  timers.set(hero.id,HERO_SKILL_INTERVAL);casts.push(hero.name);
  for(const enemy of enemies)hits.set(enemy.id,(hits.get(enemy.id)??0)+heroSkillDamage(hero.name,enemy,roster,stage));
  if(hero.name==='세종대왕')gold+=20;
  if(hero.name==='김유신')hearts++;
 }
 return {hits,casts,gold,hearts};
}
