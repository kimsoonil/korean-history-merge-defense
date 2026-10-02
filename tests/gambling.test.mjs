import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GAMBLE_COOLDOWN_MS,emptyGambleState,gambleAttemptsRemaining,gambleCooldownRemaining,gambleUnlocked,recordUnitGamble,readGambleState,unitGambles,playUnitGamble} from '../lib/gambling.ts';

test('unit gamble tiers unlock at rounds 1, 10, 20 and 30',()=>{
 assert.deepEqual(unitGambles.map(x=>x.unlockRound),[1,10,20,30]);
 assert.equal(gambleUnlocked(9,10),false);assert.equal(gambleUnlocked(10,10),true);
 assert.deepEqual(unitGambles.map(x=>x.cost),[500,1000,2000,3000]);
});
test('shared gamble cooldown is one second and both modes allow five attempts per round',()=>{
 const initial=emptyGambleState(4,'normal'),played=recordUnitGamble(initial,4,'normal',1,false,1000);
 assert.equal(GAMBLE_COOLDOWN_MS,1000);assert.equal(gambleCooldownRemaining(played,1000),1000);assert.equal(gambleCooldownRemaining(played,1999),1);assert.equal(gambleCooldownRemaining(played,2000),0);
 assert.equal(gambleAttemptsRemaining(played,4,'normal'),4);
 let hard=emptyGambleState(4,'hard');for(let i=0;i<5;i++)hard=recordUnitGamble(hard,4,'hard',1,true,i*1000);
 assert.equal(gambleAttemptsRemaining(hard,4,'hard'),0);assert.equal(gambleAttemptsRemaining(hard,5,'hard'),5);
 assert.deepEqual(readGambleState(played,4,'normal'),played);
});
test('unit gambles guarantee a unit with no ten-round quota',()=>{
 assert.deepEqual(unitGambles.map(x=>[x.cost,x.failureChance,x.refund,x.unlockRound]),[[500,0,0,1],[1000,0,0,10],[2000,0,0,20],[3000,0,0,30]]);
 assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병'],'normal',0,()=>.99),{gold:0,success:true,refund:0,name:'창병'});
 assert.deepEqual(playUnitGamble(unitGambles[3],3000,['광개토대왕'],'hard',0,()=>.99),{gold:0,success:true,refund:0,name:'광개토대왕'});
 assert.deepEqual(playUnitGamble(unitGambles[0],500,['창병','활병'],'normal',0,()=>.99),{gold:0,success:true,refund:0,name:'활병'});
 assert.equal(playUnitGamble(unitGambles[2],1999,['온달']),null);
});
test('battle gambling UI shows cooldown, attempts and only success/failure result labels',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8'),dialog=readFileSync(new URL('../app/GamblingDialog.tsx',import.meta.url),'utf8'),styles=readFileSync(new URL('../app/gambling.css',import.meta.url),'utf8');
 const unitHandler=page.slice(page.indexOf('const gambleUnit='),page.indexOf('const changeBag='));
 assert.match(dialog,/쿨타임 1초/);assert.match(dialog,/남은 도박/);assert.match(dialog,/확정 획득/);assert.match(dialog,/도박하기/);assert.doesNotMatch(dialog,/천장|도전하기|골드 도박/);
 assert.match(styles,/min-height:60px/);assert.match(styles,/grid-template-columns:28px minmax\(0,1fr\) 150px/);
 assert.doesNotMatch(page,/summary\.category|gambleGold/);assert.doesNotMatch(unitHandler,/setGambleOpen\(false\)/);
});
test('battle utility popups use a bottom sheet while keeping the field visible',()=>{
 const css=readFileSync(new URL('../app/bottom-sheets.css',import.meta.url),'utf8'),page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(css,/\.unit-bag\[open\],\.upgrade-dialog\[open\]/);assert.match(css,/place-items:end center/);assert.match(css,/background:#07161045/);assert.match(page,/battle-bottom-sheet/);
});
