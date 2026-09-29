import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyUnitGambleUsage,gambleUnlocked,goldGambles,goldGambleResult,recordUnitGambleSuccess,readUnitGambleUsage,unitGambles,unitGamblesRemaining,playGoldGamble,playUnitGamble} from '../lib/gambling.ts';

test('gold gamble tiers unlock at rounds 1, 10 and 20',()=>{
 assert.deepEqual(goldGambles.map(x=>x.unlockRound),[1,10,20]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(goldGambles.map(x=>[x.cost,x.maxReward]),[[100,400],[500,1500],[1000,4000]]);
});
test('gold gamble charges entry and includes both payout bounds',()=>{
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>0),{gold:0,reward:0});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>1),{gold:400,reward:400});
 assert.equal(playGoldGamble(goldGambles[0],99,()=>0),null);
});
test('gold gamble result reports the exact success, failure and draw amount',()=>{
 assert.deepEqual(goldGambleResult(goldGambles[0],400),{net:300,outcome:'success'});
 assert.deepEqual(goldGambleResult(goldGambles[1],0),{net:-500,outcome:'failure'});
 assert.deepEqual(goldGambleResult(goldGambles[2],1000),{net:0,outcome:'draw'});
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
