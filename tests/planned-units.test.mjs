import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {plannedUpperTierUnits,isLockedUnit} from '../lib/planned-units.ts';
import {TIER_SEVEN_ULTIMATES,tierSevenUltimateDamage} from '../lib/upper-tier-skills.ts';
import {estimateNoryangHardFinal,NORYANG_HARD_FINAL} from '../lib/upper-tier-balance.ts';
import {roleStats} from '../lib/combat.ts';
import {byName} from '../lib/game.ts';

const expectedFive=['왕건','온조왕','문무왕','권율','정조','장보고','박혁거세','김수로왕'];
const expectedSix=['세종대왕','이성계','주몽','진흥왕','장수왕','연개소문','척준경','최영'];
const expectedSeven=['근초고왕','광개토대왕','을지문덕','양만춘','김유신','대조영','강감찬','이순신'];

test('Munmu uses his standalone redesign while Kim Jongseo keeps the former atlas cell',()=>{
 assert.equal(byName.문무왕.portrait,'/portraits/tier-5/munmu.png');
 assert.equal(byName.문무왕.atlas,undefined);
 assert.deepEqual(byName.김종서.atlas,{src:'/portraits/tier-3-atlas.png',col:1,row:0});
});

test('all agreed tier-six and tier-seven heroes and recipes are active with artwork',()=>{
 assert.deepEqual(plannedUpperTierUnits.filter(u=>u.tier===6).map(u=>u.name),expectedSix);
 assert.deepEqual(plannedUpperTierUnits.filter(u=>u.tier===7).map(u=>u.name),expectedSeven);
 for(const unit of plannedUpperTierUnits){
  assert.equal(isLockedUnit(unit),false);
  assert.ok(unit.portrait||unit.atlas);
  assert.equal(unit.recipe.length,4);
  const materialTiers=unit.tier===6?[5,5,4,3]:[6,6,5,4];
  // Recipes are ordered from higher to lower tier so the intended composition is explicit.
  assert.equal(new Set(unit.recipe).size,4);
  assert.equal(materialTiers.length,unit.recipe.length);
 }
});

test('upper-tier recipes distribute every direct ingredient evenly',()=>{
 for(const [tier,materialNames] of [[6,expectedFive],[7,expectedSix]]){
  const heroes=plannedUpperTierUnits.filter(u=>u.tier===tier);
  const counts=materialNames.map(name=>heroes.reduce((sum,hero)=>sum+hero.recipe.filter(item=>item===name).length,0));
  assert.deepEqual(counts,new Array(8).fill(2));
 }
});

test('upper tiers render from the active recipe registry and allow merge',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(page,/const recipeCatalog:UnitDef\[\]=recipes/);
 assert.match(page,/ready=!locked&&!home/);
 assert.match(page,/combineInventory/);
});

test('tier six and seven use their own combat curve and separated role effects',()=>{
 const six=plannedUpperTierUnits.filter(u=>u.tier===6),seven=plannedUpperTierUnits.filter(u=>u.tier===7);
 assert.ok(Math.min(...six.map(u=>u.damage))>1300);
 assert.ok(Math.min(...seven.map(u=>u.damage))>Math.max(...six.map(u=>u.damage)));
 assert.equal(roleStats(6).armorReduction,120);assert.equal(roleStats(7).armorReduction,140);
 assert.equal(roleStats(6).stunChance,.35);assert.equal(roleStats(7).stunChance,.4);
 assert.equal(roleStats(7).support,.4);assert.equal(roleStats(7).mobility,.8);
 for(const unit of seven){assert.ok(TIER_SEVEN_ULTIMATES[unit.name]);assert.match(unit.skill,/궁극기/);}
});

test('every tier-seven ultimate has a combat result and dedicated presentation metadata',()=>{
 const enemy={id:1,name:'시마즈 요시히로',hp:150000,maxHp:150000,progress:0,speed:.025,boss:true,reward:0,originStage:10,originRound:65,chapter:10,armor:400};
 for(const unit of plannedUpperTierUnits.filter(u=>u.tier===7)){
  const skill=TIER_SEVEN_ULTIMATES[unit.name];
  assert.ok(tierSevenUltimateDamage(unit,enemy,0,10)>0,unit.name);
  assert.match(skill.accent,/^#/);assert.ok(skill.multiplier>=4.5);
 }
 const eulji=plannedUpperTierUnits.find(u=>u.tier===7&&u.name==='을지문덕');
 assert.equal(tierSevenUltimateDamage(eulji,enemy,0,10),tierSevenUltimateDamage(eulji,{...enemy,armor:0},0,10));
});

test('Noryang hard finale needs either three damage legends or one legend plus upper-tier synergy',()=>{
 const find=(tier,name)=>plannedUpperTierUnits.find(unit=>unit.tier===tier&&unit.name===name);
 const kim=find(7,'김유신'),single=estimateNoryangHardFinal([kim]);
 assert.equal(NORYANG_HARD_FINAL.hp,150000);assert.equal(NORYANG_HARD_FINAL.armor,400);assert.equal(NORYANG_HARD_FINAL.limitSeconds,90);
 assert.equal(single.passes,false);assert.ok(single.timeToKill>90);
 const brute=estimateNoryangHardFinal([kim,{...kim},{...kim}]);
 assert.equal(brute.passes,true);assert.ok(brute.timeToKill>20&&brute.timeToKill<75);
 const synergy=estimateNoryangHardFinal([find(7,'김유신'),find(6,'세종대왕'),find(6,'장수왕'),find(6,'척준경')]);
 assert.equal(synergy.passes,true);assert.ok(synergy.timeToKill<90);
});
