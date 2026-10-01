import test from 'node:test';
import assert from 'node:assert/strict';
import {attackRate,movementSpeed,isWeakened,hitDamage,combatStep,armorReduction,supportAttackBonus,advanceEnemy,roleStats} from '../lib/combat.ts';
import {byName,createRoundInvader} from '../lib/game.ts';
const soldier=(name,slot=0,id=1)=>({name,slot,id});
const enemy=(id=10,progress=0,boss=false)=>({...createRoundInvader(1,1,0,id),progress,boss,armor:20});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('mobility auras stack with support, exclude self, and stop out of range',()=>{
 const ally=soldier('창병'),rider=soldier('기병',1,2),rider2=soldier('신숭겸',2,3),support=soldier('의병',8,4);
 close(attackRate(ally,[ally,rider,rider2,support]),byName['창병'].rate*(1+.06+.09+.1));
 close(attackRate(rider,[rider]),byName['기병'].rate*1.2);
 close(attackRate(ally,[ally,soldier('기병',39,2)]),byName['창병'].rate);
 for(let tier=1;tier<=5;tier++)close(roleStats(tier).mobilityAura,roleStats(tier).mobility*.3);
});
test('frontline and fortress attacks stun only on successful tier-based rolls',()=>{
 for(const name of ['창병','온달','최영','계백','김수로왕','김시민','권율','양만춘','김유신']){
  const u=byName[name],chance=roleStats(u.tier).stunChance,e=enemy();
  const hit=combatStep([soldier(name)],[e],.01,1,new Map(),undefined,()=>chance-.001);
  const miss=combatStep([soldier(name)],[e],.01,1,new Map(),undefined,()=>chance);
  close(hit.stuns.get(e.id),u.tier/10);assert.equal(miss.stuns.size,0);
  assert.ok(miss.hits.get(e.id)>0);
 }
 assert.equal(armorReduction(enemy(),[soldier('김시민'),soldier('권율',1,2)]),160);
});
test('support affects nearby allies, not self; supports stack',()=>{
 const ally=soldier('창병'),support=soldier('허준',1,2);
 close(attackRate(ally,[ally,support]),byName['창병'].rate*1.15);
 close(attackRate(support,[support]),byName['허준'].rate);
 close(attackRate(ally,[ally,support,soldier('의병',2,3)]),byName['창병'].rate*1.25);
 close(supportAttackBonus(ally,[ally,support,soldier('허준',2,3)]),.3);
 close(attackRate(ally,[ally,soldier('허준',39,2)]),byName['창병'].rate);
});
test('mobility gains twice support bonus and can receive nearby support',()=>{
 const rider=soldier('기병');close(attackRate(rider,[rider]),byName['기병'].rate*1.2);
 close(attackRate(rider,[rider,soldier('허준',1,2)]),byName['기병'].rate*1.35);
});
test('tactics slow and weaken only enemies in range and stop after leaving',()=>{
 const roster=[soldier('서희')],near=enemy(),far=enemy(11,.5);
 assert.equal(isWeakened(near,roster),true);assert.equal(isWeakened(far,roster),false);
 close(movementSpeed(near,roster),near.speed*.75);close(movementSpeed(far,roster),far.speed);
 close(movementSpeed(near,[...roster,soldier('황희',1,2)]),near.speed*.75);
 assert.ok(hitDamage('활병',near,true,1)>hitDamage('활병',near,false,1));
});
test('frontline/artillery gain 5 percent and tier-4 ruler gets 25 percent only against bosses',()=>{
 for(const name of ['창병','포수'])close(hitDamage(name,enemy(),false,1),byName[name].damage*1.05/1.2);
 close(hitDamage('왕건',enemy(),false,1),byName['왕건'].damage/1.2);
 close(hitDamage('왕건',enemy(10,0,true),false,1),byName['왕건'].damage*1.25/1.2);
});
test('naval attacks only one enemy without splash',()=>{
 const foes=[enemy(10,0),enemy(11,.01),enemy(12,.5)],result=combatStep([soldier('수병')],foes,.1,1,new Map());
 assert.equal(result.hits.size,1);assert.ok(result.hits.has(11));assert.equal(result.hits.has(12),false);
 const single=combatStep([soldier('창병')],foes,.1,1,new Map());assert.equal(single.hits.size,1);
});
test('armor auras stack across units and duplicates, but armor never goes negative',()=>{
 const e={...enemy(),armor:400},roster=[soldier('수병'),soldier('서희',1,2),soldier('서희',2,3)];
 assert.equal(armorReduction(e,roster),100);
 assert.equal(armorReduction(e,[soldier('세종대왕')]),0);
 assert.equal(armorReduction(e,[soldier('광개토대왕')]),140);
 assert.equal(armorReduction(e,[soldier('왕건')]),0);
 close(hitDamage('활병',e,1000,1),byName['활병'].damage);
});
test('frontline stun expires and support increases damage without self-buff',()=>{
 const ally=soldier('창병'),support=soldier('허준',1,2),e=enemy();
 close(supportAttackBonus(ally,[ally,support]),.15);
 close(supportAttackBonus(support,[support]),0);
 const result=combatStep([ally],[e],.1,1,new Map(),undefined,()=>0);
 close(result.stuns.get(e.id),.1);
 const stopped=advanceEnemy(e,[],.05,.1);
 close(stopped.progress,e.progress);close(stopped.stunSeconds,.05);
 assert.ok(advanceEnemy(stopped,[],.1).progress>e.progress);
 for(const naval of Object.values(byName).filter(u=>u.role==='수군'))
  for(const tactician of Object.values(byName).filter(u=>u.role==='책략'&&u.tier===naval.tier))assert.ok(naval.damage>tactician.damage);
});
test('support shortens actual attack cooldown; sold supports are removed immediately',()=>{
 const unit=soldier('창병'),support=soldier('허준',1,2),timers=new Map();
 combatStep([unit,support],[enemy(10,.01)],.1,1,timers);close(timers.get(1),1/1.15-.1);
 combatStep([unit],[],.1,1,timers);assert.equal(timers.has(2),false);close(attackRate(unit,[unit]),1);
});
