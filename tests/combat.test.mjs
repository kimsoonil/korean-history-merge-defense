import test from 'node:test';
import assert from 'node:assert/strict';
import {attackRate,movementSpeed,isWeakened,hitDamage,combatStep} from '../lib/combat.ts';
import {byName,createRoundInvader} from '../lib/game.ts';
const soldier=(name,slot=0,id=1)=>({name,slot,id});
const enemy=(id=10,progress=0,boss=false)=>({...createRoundInvader(1,1,0,id),progress,boss});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('support affects nearby allies, not self; duplicate supports do not stack',()=>{
 const ally=soldier('창병'),support=soldier('허준',1,2);
 close(attackRate(ally,[ally,support]),byName['창병'].rate*1.15);
 close(attackRate(support,[support]),byName['허준'].rate);
 close(attackRate(ally,[ally,support,soldier('의병',2,3)]),byName['창병'].rate*1.15);
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
test('naval splash hits adjacent enemies, including around corners, but not distant enemies',()=>{
 const foes=[enemy(10,0),enemy(11,.01),enemy(12,.5)],result=combatStep([soldier('수병')],foes,.1,1,new Map());
 assert.ok(result.hits.has(10));assert.ok(result.hits.has(11));assert.equal(result.hits.has(12),false);
 close(result.hits.get(10),result.hits.get(11));
 const single=combatStep([soldier('창병')],foes,.1,1,new Map());assert.equal(single.hits.size,1);
});
test('support shortens actual attack cooldown; sold supports are removed immediately',()=>{
 const unit=soldier('창병'),support=soldier('허준',1,2),timers=new Map();
 combatStep([unit,support],[enemy(10,.01)],.1,1,timers);close(timers.get(1),1/1.15-.1);
 combatStep([unit],[],.1,1,timers);assert.equal(timers.has(2),false);close(attackRate(unit,[unit]),1);
});
