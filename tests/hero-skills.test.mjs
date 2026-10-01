import test from 'node:test';
import assert from 'node:assert/strict';
import {byName,createRoundInvader} from '../lib/game.ts';
import {roleStats,attackRate,weakening,hitDamage} from '../lib/combat.ts';
import {HERO_SKILLS,heroSkillStep,heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
const unit=(name,id=1,slot=0)=>({name,id,slot});
const foe=(id=100,progress=0)=>({...createRoundInvader(1,1,0,id),progress,hp:100000,maxHp:100000});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('all role values increase through tier seven; mobility is twice support',()=>{
 for(let tier=1;tier<=7;tier++){
  const stats=roleStats(tier);close(stats.mobility,stats.support*2);
  if(tier>1)for(const key of Object.keys(stats))assert.ok(stats[key]>roleStats(tier-1)[key]);
 }
});
test('highest tactics aura wins, without additive stacking',()=>{
 const e=foe(),roster=[unit('서희'),unit('을지문덕',2,1)];
 close(weakening(e,roster),.5);close(weakening(e,[...roster,unit('을지문덕',3,2)]),.5);
});
test('no early cast, all path positions hit at 10 seconds, repeats after another 10',()=>{
 const roster=[unit('세종대왕')],enemies=[foe(),foe(101,.5),foe(102,.99)],timers=new Map();
 for(let i=0;i<99;i++)assert.equal(heroSkillStep(roster,enemies,.1,1,timers).casts.length,0);
 const result=heroSkillStep(roster,enemies,.1,1,timers);
 assert.deepEqual(result.casts,['세종대왕']);assert.equal(result.hits.size,3);assert.equal(result.gold,20);
 assert.equal(heroSkillStep(roster,enemies,9.9,1,timers).casts.length,0);
 assert.equal(heroSkillStep(roster,enemies,.1,1,timers).casts.length,1);
});
test('empty field holds skill, sold hero removed, new hero charges fresh',()=>{
 const hero=unit('김유신'),timers=new Map();
 assert.equal(heroSkillStep([hero],[],10,1,timers).hearts,0);
 assert.equal(timers.get(1),0);
 assert.equal(heroSkillStep([hero],[foe()],.1,1,timers).hearts,1);
 heroSkillStep([],[],.1,1,timers);assert.equal(timers.size,0);
 assert.equal(heroSkillStep([unit('김유신',2)],[foe()],.1,1,timers).casts.length,0);
});
test('simultaneous heroes hit each enemy once each, including duplicate heroes',()=>{
 const heroes=[unit('이순신'),unit('세종대왕',2),unit('이순신',3)],enemy=foe();
 const result=heroSkillStep(heroes,[enemy],10,1,new Map());assert.equal(result.casts.length,3);
 assert.ok(result.hits.get(enemy.id)>heroes.reduce((sum,h)=>sum+heroSkillDamage(h.name,enemy,heroes,1),0));
});
test('every unique hero trait has a combat effect',()=>{
 const normal=foe(),boss={...normal,boss:true},base=(name,e)=>hitDamage(name,e,0,1)*HERO_SKILLS[name].multiplier;
 assert.ok(heroSkillDamage('이순신',boss,[],1)>heroSkillDamage('이순신',normal,[],1));
 assert.ok(heroSkillDamage('광개토대왕',normal,[],1)>0);
 assert.ok(heroSkillDamage('을지문덕',normal,[],1)>0);
 close(heroSkillDamage('이성계',{...normal,hp:50000},[],1),base('이성계',normal)*2);
 const ally=unit('창병');close(attackRate(ally,[ally,unit('정조',2,39),unit('정조',3,38)]),byName['창병'].rate*1.30);
 const resources=heroSkillStep([unit('세종대왕'),unit('김유신',2)],[normal],10,1,new Map());
 assert.equal(resources.gold,20);assert.equal(resources.hearts,1);
});
test('cooldowns survive save/resume and round transitions; legacy saves still read',()=>{
 const roster=[unit('세종대왕')],timers=new Map();heroSkillStep(roster,[foe()],6,1,timers);
 const save=makeGameSave({roster,enemies:[],gold:400,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000,heroCooldowns:[...timers]});
 const restored=readGameSave(JSON.stringify(save));assert.ok(restored);
 assert.equal(heroSkillStep(roster,[foe()],4,2,new Map(restored.heroCooldowns)).casts.length,1);
 delete save.heroCooldowns;assert.ok(readGameSave(JSON.stringify(save)));
 for(const invalid of [[[1,-1]],[[1,11]],[[999,2]],[[1,2],[1,3]]])assert.equal(readGameSave(JSON.stringify({...save,heroCooldowns:invalid})),null);
});
