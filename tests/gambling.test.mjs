import test from 'node:test';
import assert from 'node:assert/strict';
import {gambleUnlocked,goldGambles,unitGambles,playGoldGamble,playUnitGamble} from '../lib/gambling.ts';

test('gold gamble tiers unlock at rounds 1, 10 and 20',()=>{
 assert.deepEqual(goldGambles.map(x=>x.unlockRound),[1,10,20]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(goldGambles.map(x=>[x.cost,x.maxReward]),[[100,500],[500,2000],[1000,5000]]);
});
test('gold gamble charges entry and includes both payout bounds',()=>{
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>0),{gold:0,reward:0});
 assert.deepEqual(playGoldGamble(goldGambles[0],100,()=>1),{gold:500,reward:500});
 assert.equal(playGoldGamble(goldGambles[0],99,()=>0),null);
});
test('unit gamble observes failure refunds and random success',()=>{
 assert.deepEqual(unitGambles.map(x=>[x.cost,x.failureChance,x.refund,x.unlockRound]),[[500,.1,100,1],[1000,.3,200,10],[3000,.5,500,20]]);
 assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병'],()=>0),{gold:100,success:false,refund:100,name:null});
 const rolls=[.9,.99];assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병','활병'],()=>rolls.shift()),{gold:0,success:true,refund:0,name:'활병'});
});
