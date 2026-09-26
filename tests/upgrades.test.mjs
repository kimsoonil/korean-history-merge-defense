import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyUpgrades,purchaseUpgrade,upgradeCost,upgradedAttack,readUpgrades} from '../lib/upgrades.ts';
import {byName,createInvader} from '../lib/game.ts';
import {hitDamage} from '../lib/combat.ts';
import {heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
test('purchases deduct gold once, escalate price and reject insufficient or capped upgrades',()=>{
 const initial=emptyUpgrades(),first=purchaseUpgrade(initial,400,'tier','1');
 assert.equal(first.gold,300);assert.equal(first.upgrades.tier['1'],1);
 assert.deepEqual(initial,emptyUpgrades());assert.equal(upgradeCost('tier','1',first.upgrades),200);
 assert.equal(purchaseUpgrade(first.upgrades,199,'tier','1'),null);
 assert.equal(purchaseUpgrade({tier:{1:10},role:{},hero:{}},99999,'tier','1'),null);
 assert.equal(purchaseUpgrade(initial,400,'hero','창병'),null);
});
test('tier, role and named hero bonuses add; other units keep their own bonuses',()=>{
 const state={tier:{5:2},role:{수군:3},hero:{이순신:4}};
 assert.equal(upgradedAttack(byName.이순신,state),2090);
 assert.equal(upgradedAttack(byName.장보고,state),494);
 assert.equal(upgradedAttack(byName.세종대왕,state),1128);
 const enemy=createInvader(1,0,100);
 assert.ok(Math.abs(hitDamage('이순신',enemy,0,1,state)/hitDamage('이순신',enemy,0,1)-1.9)<1e-10);
 assert.ok(Math.abs(heroSkillDamage('이순신',enemy,[],1,state)/heroSkillDamage('이순신',enemy,[],1)-1.9)<1e-10);
});
test('save/resume preserves upgrades; old saves start without upgrades and invalid levels are ignored',()=>{
 const upgrades={tier:{1:2},role:{지원:1},hero:{정조:1}};
 const progress={roster:[],enemies:[],gold:100,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000,upgrades};
 const save=makeGameSave(progress);
 upgrades.tier[1]=9;
 assert.equal(readGameSave(JSON.stringify(save)).upgrades.tier[1],2);
 assert.deepEqual(readUpgrades(undefined),emptyUpgrades());
 assert.deepEqual(readUpgrades({tier:{1:11,2:-1,3:1.5},hero:{창병:3}}),emptyUpgrades());
});
