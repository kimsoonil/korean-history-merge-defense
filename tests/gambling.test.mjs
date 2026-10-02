import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GAMBLE_COOLDOWN_MS,emptyGambleState,emptyUnitGambleUsage,gambleAttemptsRemaining,gambleCooldownRemaining,gambleUnlocked,recordUnitGamble,recordUnitGambleSuccess,readGambleState,readUnitGambleUsage,unitGambles,unitGamblesRemaining,playUnitGamble} from '../lib/gambling.ts';

test('unit gamble tiers unlock at rounds 1, 10 and 20',()=>{
 assert.deepEqual(unitGambles.map(x=>x.unlockRound),[1,10,20]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(unitGambles.map(x=>x.cost),[500,1000,3000]);
});
test('shared gamble cooldown is three seconds and round limits differ by mode',()=>{
 const initial=emptyGambleState(4,'normal'),played=recordUnitGamble(initial,4,'normal',1,false,1000);
 assert.equal(GAMBLE_COOLDOWN_MS,3000);assert.equal(gambleCooldownRemaining(played,1000),3000);assert.equal(gambleCooldownRemaining(played,3999),1);assert.equal(gambleCooldownRemaining(played,4000),0);
 assert.equal(gambleAttemptsRemaining(played,4,'normal'),2);
 let hard=emptyGambleState(4,'hard');hard=recordUnitGamble(hard,4,'hard',1,false,0);hard=recordUnitGamble(hard,4,'hard',1,true,4000);
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
 const unitHandler=page.slice(page.indexOf('const gambleUnit='),page.indexOf('const changeBag='));
 assert.match(dialog,/쿨타임 3초/);assert.match(dialog,/남은 도박/);assert.match(dialog,/천장/);assert.match(dialog,/도박하기/);assert.doesNotMatch(dialog,/도전하기|골드 도박/);
 assert.match(styles,/min-height:60px/);assert.match(styles,/grid-template-columns:28px minmax\(0,1fr\) 150px/);
 assert.doesNotMatch(page,/summary\.category|gambleGold/);assert.doesNotMatch(unitHandler,/setGambleOpen\(false\)/);
});
test('battle utility popups use a bottom sheet while keeping the field visible',()=>{
 const css=readFileSync(new URL('../app/bottom-sheets.css',import.meta.url),'utf8'),page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(css,/\.unit-bag\[open\],\.upgrade-dialog\[open\]/);assert.match(css,/place-items:end center/);assert.match(css,/background:#07161045/);assert.match(page,/battle-bottom-sheet/);
});
