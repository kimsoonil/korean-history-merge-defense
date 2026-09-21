import test from 'node:test';
import assert from 'node:assert/strict';
import {moveOrSwap} from '../lib/placement.ts';
const roster=[{id:1,name:'창병',slot:0},{id:2,name:'창병',slot:1},{id:3,name:'이순신',slot:39}];
test('occupied cells exchange by identity, including same-name soldiers',()=>{
 const result=moveOrSwap(roster,1,1);
 assert.deepEqual(result.map(s=>s.slot),[1,0,39]);assert.deepEqual(roster.map(s=>s.slot),[0,1,39]);
 assert.deepEqual(result.map(s=>[s.id,s.name]),roster.map(s=>[s.id,s.name]));
});
test('move to empty cell, full field swap and invalid requests preserve valid placement',()=>{
 assert.deepEqual(moveOrSwap(roster,3,5).map(s=>s.slot),[0,1,5]);
 for(const [id,slot] of [[1,0],[999,2],[1,-1],[1,40],[1,1.5]])assert.equal(moveOrSwap(roster,id,slot),roster);
 const full=Array.from({length:40},(_,slot)=>({id:slot+1,name:'창병',slot}));
 const result=moveOrSwap(full,1,39);assert.equal(result.length,40);assert.equal(new Set(result.map(s=>s.slot)).size,40);assert.equal(result[39].slot,0);
});
