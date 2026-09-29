import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyUpgrades,purchaseUpgrade,upgradeCost,upgradedAttack,readUpgrades,tierUpgradeTotalCosts,TIER_MAX_UPGRADE_LEVEL} from '../lib/upgrades.ts';
import {byName,createInvader} from '../lib/game.ts';
import {hitDamage} from '../lib/combat.ts';
import {heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
test('purchases deduct gold once, escalate price and reject insufficient or capped upgrades',()=>{
 const initial=emptyUpgrades(),first=purchaseUpgrade(initial,400,'tier','1');
 assert.equal(first.gold,350);assert.equal(first.upgrades.tier['1'],1);
 assert.deepEqual(initial,emptyUpgrades());assert.equal(upgradeCost('tier','1',first.upgrades),50);
 assert.equal(purchaseUpgrade(first.upgrades,49,'tier','1'),null);
 assert.equal(purchaseUpgrade({tier:{1:20},role:{},hero:{}},99999,'tier','1'),null);
 assert.equal(purchaseUpgrade(initial,400,'hero','창병'),null);
});
test('tier, role and named hero bonuses add; other units keep their own bonuses',()=>{
 const state={tier:{5:2},role:{수군:3},hero:{이순신:4}};
 assert.equal(upgradedAttack(byName.이순신,state),1886.4);
 assert.equal(upgradedAttack(byName.장보고,state),470.88);
 assert.equal(upgradedAttack(byName.세종대왕,state),958.8);
 const enemy=createInvader(1,0,100);
 assert.ok(Math.abs(hitDamage('이순신',enemy,0,1,state)/hitDamage('이순신',enemy,0,1)-1.31)<1e-10);
 assert.ok(Math.abs(heroSkillDamage('이순신',enemy,[],1,state)/heroSkillDamage('이순신',enemy,[],1)-1.31)<1e-10);
});
test('save/resume preserves upgrades; old saves start without upgrades and invalid levels are ignored',()=>{
 const upgrades={tier:{1:2},role:{지원:1},hero:{정조:1}};
 const progress={roster:[],enemies:[],gold:100,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000,upgrades};
 const save=makeGameSave(progress);
 upgrades.tier[1]=9;
 assert.equal(readGameSave(JSON.stringify(save)).upgrades.tier[1],2);
 assert.deepEqual(readUpgrades(undefined),emptyUpgrades());
 assert.deepEqual(readUpgrades({tier:{1:21,2:-1,3:1.5},hero:{창병:3}}),emptyUpgrades());
});
test('tier upgrades cap at twenty percent and match each requested total cost',()=>{
 for(let tier=1;tier<=5;tier++){
  let total=0,state=emptyUpgrades();
  for(let level=0;level<TIER_MAX_UPGRADE_LEVEL;level++){
   const cost=upgradeCost('tier',String(tier),state);total+=cost;
   state={...state,tier:{...state.tier,[tier]:level+1}};
  }
  assert.equal(total,tierUpgradeTotalCosts[tier]);
  assert.equal(upgradeCost('tier',String(tier),state),null);
 }
 assert.equal(upgradeCost('hero','이순신',emptyUpgrades()),300);
 assert.equal(upgradeCost('hero','이순신',{tier:{},role:{},hero:{이순신:9}}),3000);
 assert.equal(upgradeCost('role','수군',emptyUpgrades()),100);
 const base=byName.이순신.damage;
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{5:20},role:{},hero:{}})/base-1.2)<1e-10);
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{},role:{},hero:{이순신:1}})/base-1.05)<1e-10);
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{},role:{},hero:{이순신:10}})/base-1.5)<1e-10);
});
test('role upgrades cost one hundred per level and give three percent per level',()=>{
 for(let level=0;level<10;level++){
  const state={tier:{},role:{수군:level},hero:{}};
  assert.equal(upgradeCost('role','수군',state),100*(level+1));
  const bought=purchaseUpgrade(state,10000,'role','수군');
  assert.equal(bought.gold,10000-100*(level+1));
  assert.ok(Math.abs(upgradedAttack(byName.이순신,bought.upgrades)/byName.이순신.damage-(1+.03*(level+1)))<1e-10);
 }
 assert.equal(upgradeCost('role','수군',{tier:{},role:{수군:10},hero:{}}),null);
});
test('hard tier and role costs double; individual heroes cost five hundred per level',()=>{
 for(let level=0;level<10;level++){
  for(let tier=1;tier<=5;tier++){
   const state={tier:{[tier]:level},role:{수군:level},hero:{이순신:level}};
   assert.equal(upgradeCost('tier',String(tier),state,'hard'),tierUpgradeTotalCosts[tier]/10);
   assert.equal(upgradeCost('role','수군',state,'hard'),200*(level+1));
   assert.equal(upgradeCost('hero','이순신',state,'hard'),500*(level+1));
  }
 }
 for(const [kind,key,cost] of [['tier','1',100],['role','수군',200],['hero','이순신',500]]){
  assert.equal(purchaseUpgrade(emptyUpgrades(),cost-1,kind,key,'hard'),null);
  const hard=purchaseUpgrade(emptyUpgrades(),cost,kind,key,'hard');
  assert.equal(hard.gold,0);
  const normal=purchaseUpgrade(emptyUpgrades(),10000,kind,key,'normal');
  assert.equal(upgradedAttack(byName.이순신,hard.upgrades),upgradedAttack(byName.이순신,normal.upgrades));
 }
 assert.equal(upgradeCost('hero','이순신',{tier:{},role:{},hero:{이순신:10}},'hard'),null);
 assert.equal(upgradeCost('tier','1',{tier:{1:20},role:{},hero:{}},'hard'),null);
});
