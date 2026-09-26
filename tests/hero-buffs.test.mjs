import test from 'node:test';
import assert from 'node:assert/strict';
import {activeHeroBuffs,emptyHeroBuffs} from '../lib/hero-buffs.ts';
import {combatStep} from '../lib/combat.ts';
import {createRoundInvader} from '../lib/game.ts';
import {HERO_SKILLS} from '../lib/hero-skills.ts';
test('temporary hero buffs last five seconds, stack and disappear with the source',()=>{
 const roster=[{id:1,name:'세종대왕',slot:0},{id:2,name:'세종대왕',slot:1}];
 assert.equal(activeHeroBuffs(roster,new Map()).attack,0);
 assert.equal(activeHeroBuffs(roster,new Map([[1,10],[2,6]])).attack,.6);
 assert.equal(activeHeroBuffs(roster,new Map([[1,5],[2,0]])).attack,0);
 assert.equal(activeHeroBuffs([],new Map([[1,10]])).attack,0);
});
test('all five buffs affect actual combat damage or cooldown',()=>{
 const soldier={id:1,name:'활병',slot:0},enemy={...createRoundInvader(1,1,0,10),boss:true,armor:100,hp:40,maxHp:100};
 const run=buffs=>{const cd=new Map();return {result:combatStep([soldier],[enemy],.01,1,cd,undefined,()=>1,buffs),cd};};
 const base=run(emptyHeroBuffs());
 for(const name of ['이순신','세종대왕','을지문덕','이성계','정조']){
  const buffs=activeHeroBuffs([{id:2,name,slot:1}],new Map([[2,10]])),actual=run(buffs);
  if(name==='정조')assert.ok(actual.cd.get(1)<base.cd.get(1));
  else assert.ok(actual.result.hits.get(10)>base.result.hits.get(10));
 }
 for(const name of ['광개토대왕','척준경','김유신'])assert.ok(HERO_SKILLS[name].multiplier>=4);
});
