import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyUpgrades,purchaseUpgrade,upgradeCost,upgradedAttack,readUpgrades,tierUpgradeTotalCosts,TIER_MAX_UPGRADE_LEVEL,upgradeOptions} from '../lib/upgrades.ts';
import {byName,createInvader} from '../lib/game.ts';
import {hitDamage} from '../lib/combat.ts';
import {heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {MAX_UNIT_TIER} from '../lib/unit-tiers.ts';
import {plannedUpperTierUnits} from '../lib/planned-units.ts';
test('purchases deduct gold once, escalate price and reject insufficient or capped upgrades',()=>{
 const initial=emptyUpgrades(),first=purchaseUpgrade(initial,400,'tier','1');
 assert.equal(first.gold,350);assert.equal(first.upgrades.tier['1'],1);
 assert.deepEqual(initial,emptyUpgrades());assert.equal(upgradeCost('tier','1',first.upgrades),50);
 assert.equal(purchaseUpgrade(first.upgrades,49,'tier','1'),null);
 assert.equal(purchaseUpgrade({tier:{1:20},role:{},hero:{}},99999,'tier','1'),null);
 assert.equal(purchaseUpgrade(initial,400,'hero','창병'),null);
});
test('tier, role and named hero bonuses add; other units keep their own bonuses',()=>{
 const state={tier:{7:2},role:{수군:3},hero:{이순신:4}};
 assert.equal(upgradedAttack(byName.이순신,state),byName.이순신.damage*1.31);
 assert.equal(upgradedAttack(byName.장보고,state),byName.장보고.damage*1.09);
 assert.equal(upgradedAttack(byName.세종대왕,state),byName.세종대왕.damage);
 const enemy=createInvader(1,0,100);
 assert.ok(Math.abs(hitDamage('이순신',enemy,0,1,state)/hitDamage('이순신',enemy,0,1)-1.31)<1e-10);
});
test('save/resume preserves upgrades; old saves start without upgrades and invalid levels are ignored',()=>{
 const upgrades={tier:{1:2},role:{지원:1},hero:{이순신:1}};
 const progress={roster:[],enemies:[],gold:100,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000,upgrades};
 const save=makeGameSave(progress);
 upgrades.tier[1]=9;
 assert.equal(readGameSave(JSON.stringify(save)).upgrades.tier[1],2);
 assert.deepEqual(readUpgrades(undefined),emptyUpgrades());
 assert.deepEqual(readUpgrades({tier:{1:21,2:-1,3:1.5},hero:{창병:3,왕건:2}}),emptyUpgrades());
});
test('tier upgrades cap at twenty percent and match each requested total cost',()=>{
 const expectedPerLevel={1:50,2:100,3:200,4:350,5:600,6:1000,7:1500};
 for(let tier=1;tier<=MAX_UNIT_TIER;tier++){
  let total=0,state=emptyUpgrades();
  assert.equal(upgradeCost('tier',String(tier),state),expectedPerLevel[tier]);
  for(let level=0;level<TIER_MAX_UPGRADE_LEVEL;level++){
   const cost=upgradeCost('tier',String(tier),state);total+=cost;
   state={...state,tier:{...state.tier,[tier]:level+1}};
  }
  assert.equal(total,tierUpgradeTotalCosts[tier]);
  assert.equal(upgradeCost('tier',String(tier),state),null);
 }
 assert.equal(upgradeCost('hero','이순신',emptyUpgrades()),300);
 assert.equal(upgradeCost('hero','이순신',{tier:{},role:{},hero:{이순신:9}}),3000);
 assert.equal(upgradeCost('hero','왕건',emptyUpgrades()),null);
 assert.equal(upgradeCost('role','수군',emptyUpgrades()),100);
 const base=byName.이순신.damage;
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{7:20},role:{},hero:{}})/base-1.2)<1e-10);
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{},role:{},hero:{이순신:1}})/base-1.05)<1e-10);
 assert.ok(Math.abs(upgradedAttack(byName.이순신,{tier:{},role:{},hero:{이순신:10}})/base-1.5)<1e-10);
 assert.equal(upgradedAttack(byName.왕건,{tier:{},role:{},hero:{왕건:10}}),byName.왕건.damage);
 for(const unit of plannedUpperTierUnits){
  assert.ok(Math.abs(upgradedAttack(unit,{tier:{[unit.tier]:20},role:{},hero:{}})/unit.damage-1.2)<1e-10);
 }
});
test('individual hero upgrades list every tier seven hero and no lower-tier unit',()=>{
 const expected=Object.values(byName).filter(unit=>unit.tier===7).map(unit=>unit.name).sort();
 assert.deepEqual(upgradeOptions.hero.map(option=>option.key).sort(),expected);
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
  for(let tier=1;tier<=MAX_UNIT_TIER;tier++){
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
test('upgrade dialog keeps only actionable upgrade content',()=>{
 const dialog=readFileSync(new URL('../app/UpgradeDialog.tsx',import.meta.url),'utf8');
 const styles=readFileSync(new URL('../app/upgrades.css',import.meta.url),'utf8');
 for(const copy of ['단계 강화:','단계·직업·영웅 강화는 합산됩니다.','보유 골드','공격속도·사거리·특수 효과는 변하지 않습니다.','새 게임·새 스테이지 시작 시 초기화']){
  assert.doesNotMatch(dialog,new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 }
 assert.match(dialog,/<header className="upgrade-heading">/);
 assert.match(dialog,/BATTLE FORGE/);
 assert.match(styles,/width:min\(980px,100vw\)/);
 assert.match(styles,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
