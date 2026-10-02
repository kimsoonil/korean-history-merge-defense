import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GAMBLE_COOLDOWN_MS,emptyGambleState,emptyUnitGambleUsage,gambleAttemptsRemaining,gambleCooldownRemaining,gambleUnlocked,goldGambles,goldGambleOutcomes,goldSuccessChance,recordGoldGamble,recordUnitGambleSuccess,readGambleState,readUnitGambleUsage,unitGambles,unitGamblesRemaining,playGoldGamble,playUnitGamble} from '../lib/gambling.ts';

test('gold gamble tiers unlock at rounds 1, 10 and 20',()=>{
 assert.deepEqual(goldGambles.map(x=>x.unlockRound),[1,10,20]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(goldGambles.map(x=>x.cost),[100,500,1000]);
});
test('normal and hard gold odds use the agreed success, draw and failure split',()=>{
 for(const [difficulty,expected] of [['normal',[.3,.2,.5]],['hard',[.5,.2,.3]]]){
  const outcomes=goldGambleOutcomes(difficulty);
  const failure=outcomes.filter(x=>x.multiplier<1).reduce((s,x)=>s+x.chance,0),draw=outcomes.find(x=>x.multiplier===1).chance,success=outcomes.filter(x=>x.multiplier>1).reduce((s,x)=>s+x.chance,0);
  assert.ok(Math.abs(failure-expected[0])<1e-9);assert.ok(Math.abs(draw-expected[1])<1e-9);assert.ok(Math.abs(success-expected[2])<1e-9);
 }
 assert.equal(goldSuccessChance('normal',1),.53);assert.equal(goldSuccessChance('hard',1),.34);
 assert.equal(goldSuccessChance('normal',6),1);assert.equal(goldSuccessChance('hard',7),1);
});
test('gold gamble samples bounds and uses difficulty payouts',()=>{
 assert.deepEqual(playGoldGamble(goldGambles[0],100,'normal',0,()=>0),{gold:0,reward:0,category:'대실패',outcome:'failure'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,'normal',0,()=>.999),{gold:600,reward:600,category:'대박',outcome:'success'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,'hard',0,()=>.999),{gold:700,reward:700,category:'대박',outcome:'success'});
 assert.equal(playGoldGamble(goldGambles[0],99,'normal',0,()=>0),null);
});
test('shared gamble cooldown is three seconds and round limits differ by mode',()=>{
 const initial=emptyGambleState(4,'normal'),played=recordGoldGamble(initial,4,'normal','small','failure',1000);
 assert.equal(GAMBLE_COOLDOWN_MS,3000);assert.equal(gambleCooldownRemaining(played,1000),3000);assert.equal(gambleCooldownRemaining(played,3999),1);assert.equal(gambleCooldownRemaining(played,4000),0);
 assert.equal(gambleAttemptsRemaining(played,4,'normal'),2);
 let hard=emptyGambleState(4,'hard');hard=recordGoldGamble(hard,4,'hard','small','draw',0);hard=recordGoldGamble(hard,4,'hard','small','draw',4000);
 assert.equal(gambleAttemptsRemaining(hard,4,'hard'),0);assert.equal(gambleAttemptsRemaining(hard,5,'hard'),2);
 assert.deepEqual(readGambleState(played,4,'normal'),played);
});
test('unit gamble observes failure refunds, pity-compatible success and quotas',()=>{
 assert.deepEqual(unitGambles.map(x=>[x.cost,x.failureChance,x.refund,x.unlockRound]),[[500,.1,100,1],[1000,.3,200,10],[3000,.5,500,20]]);
 assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병'],'normal',0,()=>.99),{gold:100,success:false,refund:100,name:null});
 const rolls=[.1,.99];assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병','활병'],'normal',0,()=>rolls.shift()),{gold:0,success:true,refund:0,name:'활병'});
 let usage=emptyUnitGambleUsage(1);for(let i=0;i<10;i++)usage=recordUnitGambleSuccess(1,1,usage);
 assert.equal(unitGamblesRemaining(1,1,usage),0);assert.equal(unitGamblesRemaining(1,11,usage),10);
 usage=recordUnitGambleSuccess(3,21,usage);assert.equal(unitGamblesRemaining(3,21,usage),1);assert.deepEqual(readUnitGambleUsage(usage,21),usage);
});
test('battle gambling UI shows cooldown, attempts and only success/failure result labels',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8'),dialog=readFileSync(new URL('../app/GamblingDialog.tsx',import.meta.url),'utf8'),styles=readFileSync(new URL('../app/gambling.css',import.meta.url),'utf8');
 const goldHandler=page.slice(page.indexOf('const gambleGold='),page.indexOf('const gambleUnit=')),unitHandler=page.slice(page.indexOf('const gambleUnit='),page.indexOf('const changeBag='));
 assert.match(dialog,/공통 쿨타임 3초/);assert.match(dialog,/남은 도박/);assert.match(dialog,/천장/);assert.match(dialog,/도박하기/);assert.doesNotMatch(dialog,/도전하기/);
 assert.match(styles,/min-height:60px/);assert.match(styles,/grid-template-columns:28px minmax\(0,1fr\) 150px/);
 assert.doesNotMatch(page,/summary\.category/);assert.match(page,/success = net >= 0/);assert.doesNotMatch(goldHandler,/setGambleOpen\(false\)/);assert.doesNotMatch(unitHandler,/setGambleOpen\(false\)/);
});
test('battle utility popups use a bottom sheet while keeping the field visible',()=>{
 const css=readFileSync(new URL('../app/bottom-sheets.css',import.meta.url),'utf8'),page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(css,/\.unit-bag\[open\],\.upgrade-dialog\[open\]/);assert.match(css,/place-items:end center/);assert.match(css,/background:#07161045/);assert.match(page,/battle-bottom-sheet/);
});
