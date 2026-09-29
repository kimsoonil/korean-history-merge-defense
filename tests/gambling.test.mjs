import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyUnitGambleUsage,gambleUnlocked,goldGambles,goldGambleResult,recordUnitGambleSuccess,readUnitGambleUsage,unitGambles,unitGamblesRemaining,playGoldGamble,playUnitGamble} from '../lib/gambling.ts';

test('gold gamble tiers unlock at rounds 1, 10 and 20',()=>{
 assert.deepEqual(goldGambles.map(x=>x.unlockRound),[1,10,20]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(goldGambles.map(x=>[x.cost,x.maxReward]),[[100,600],[500,1500],[1000,4000]]);
 for(const gamble of goldGambles){
  assert.deepEqual(gamble.outcomes.map(x=>[x.category,x.chance]),[['대실패',.2],['소실패',.2],['본전',.35],['중박',.2],['대박',.05]]);
  assert.equal(gamble.outcomes.reduce((sum,x)=>sum+x.chance,0),1);
  assert.equal(Math.max(...gamble.outcomes.map(x=>x.net)),gamble.maxReward-gamble.cost);
 }
});
test('gold gamble uses the five weighted outcomes including both bounds',()=>{
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>0),{gold:0,reward:0,category:'대실패'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>.2),{gold:50,reward:50,category:'소실패'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>.4),{gold:100,reward:100,category:'본전'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>.75),{gold:300,reward:300,category:'중박'});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>1),{gold:600,reward:600,category:'대박'});
 assert.equal(playGoldGamble(goldGambles[0],99,()=>0),null);
});
test('gold gamble result reports the exact success, failure and draw amount',()=>{
 assert.deepEqual(goldGambleResult(goldGambles[0],600),{net:500,outcome:'success',category:'대박'});
 assert.deepEqual(goldGambleResult(goldGambles[1],0),{net:-500,outcome:'failure',category:'대실패'});
 assert.deepEqual(goldGambleResult(goldGambles[2],1000),{net:0,outcome:'draw',category:'본전'});
});
test('unit gamble observes failure refunds and random success',()=>{
 assert.deepEqual(unitGambles.map(x=>[x.cost,x.failureChance,x.refund,x.unlockRound]),[[500,.1,100,1],[1000,.3,200,10],[3000,.5,500,20]]);
 assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병'],()=>0),{gold:100,success:false,refund:100,name:null});
 const rolls=[.9,.99];assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병','활병'],()=>rolls.shift()),{gold:0,success:true,refund:0,name:'활병'});
});
test('unit gamble success limits reset every ten rounds and failures do not consume them',()=>{
 let usage=emptyUnitGambleUsage(1);
 assert.deepEqual([1,2,3].map(tier=>unitGamblesRemaining(tier,1,usage)),[10,5,2]);
 for(let i=0;i<10;i++)usage=recordUnitGambleSuccess(1,1,usage);
 assert.equal(unitGamblesRemaining(1,1,usage),0);
 assert.equal(unitGamblesRemaining(1,10,usage),0);
 assert.equal(unitGamblesRemaining(1,11,usage),10);
 const unchanged=usage;
 playUnitGamble(unitGambles[0],500,['창병'],()=>0);
 assert.equal(unitGamblesRemaining(1,1,unchanged),0);
 usage=recordUnitGambleSuccess(3,21,usage);
 assert.equal(unitGamblesRemaining(3,21,usage),1);
 assert.deepEqual(readUnitGambleUsage(usage,21),usage);
 assert.deepEqual(readUnitGambleUsage({block:2,successes:{1:11,2:0,3:0}},21),emptyUnitGambleUsage(21));
});
test('battle gambling UI exposes only success and failure result labels',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const dialog=readFileSync(new URL('../app/GamblingDialog.tsx',import.meta.url),'utf8');
 assert.match(dialog,/도박 결과는 성공 또는 실패로 표시됩니다/);
 assert.doesNotMatch(dialog,/대실패|소실패|본전|중박|대박/);
 assert.doesNotMatch(page,/summary\.category/);
 assert.match(page,/success=summary\.net>=0/);
});
test('battle utility popups use a bottom sheet while keeping the field visible',()=>{
 const css=readFileSync(new URL('../app/bottom-sheets.css',import.meta.url),'utf8');
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(css,/\.unit-bag\[open\],\.upgrade-dialog\[open\]/);
 assert.match(css,/place-items:end center/);
 assert.match(css,/background:#07161045/);
 assert.match(page,/battle-bottom-sheet/);
});
