import assert from 'node:assert/strict';
import test from 'node:test';
import {createInvader} from '../lib/game.ts';
import {canContinue,makeGameSave,readGameSave,remainingStageMs,restoredCounters} from '../lib/save.ts';

const progress=()=>({roster:[{id:1,name:'유생',slot:7},{id:3,name:'창병',slot:12}],enemies:[{...createInvader(2,0,8),progress:.47,hp:32}],gold:186,wall:10,stage:2,round:1,phase:'battle',spawned:3,speed:2,remainingMs:12345});
const roundTrip=value=>readGameSave(JSON.stringify(value));

test('save restores exact units, enemies, resources and remaining time',()=>{
 const state=progress(),save=makeGameSave(state,123);
 assert.deepEqual(roundTrip(save),save);
 assert.ok(canContinue(save));
 state.roster[0].slot=0;state.enemies[0].hp=1;
 assert.equal(save.roster[0].slot,7);assert.equal(save.enemies[0].hp,32);
 const counters=restoredCounters(save,99999999);
 assert.equal(counters.deadline-99999999,12345);
 assert.equal(counters.nextId,9);assert.equal(counters.completedStage,0);
});
test('saving during a cinematic freezes the clock and overtime stays at zero',()=>{
 assert.equal(remainingStageMs(30000,'battle',22000,11000),19000);
 assert.equal(remainingStageMs(30000,'battle',22000),8000);
 assert.equal(remainingStageMs(30000,'battle',55000),0);
 assert.equal(remainingStageMs(null,'ready',55000),30000);
 assert.equal(remainingStageMs(30000,'cleared',55000),0);
});
test('cleared stages retain their reward latch and final results are not resumable',()=>{
 const cleared=makeGameSave({...progress(),enemies:[],spawned:10,remainingMs:0,phase:'cleared'});
 assert.ok(roundTrip(cleared));assert.equal(restoredCounters(cleared).completedStage,201);
 const won=makeGameSave({...progress(),enemies:[],stage:10,round:65,spawned:10,remainingMs:0,phase:'won'});
 assert.ok(roundTrip(won));assert.equal(canContinue(won),false);
 const lost=makeGameSave({...progress(),wall:0,phase:'lost',remainingMs:0});
 assert.ok(roundTrip(lost));assert.equal(canContinue(lost),false);
 assert.equal(canContinue(null),false);
});
test('boss HP, sprite identity, location and spawn count survive a reload',()=>{
 const boss={...createInvader(10,0,20),hp:1240,progress:.84};
 const save=makeGameSave({...progress(),stage:10,round:65,enemies:[boss],spawned:10,remainingMs:0});
 const loaded=roundTrip(save);
 assert.deepEqual(loaded.enemies,[boss]);assert.equal(loaded.spawned,10);
 assert.equal(restoredCounters(loaded).nextId,21);
});
test('invalid, incompatible and inconsistent saves are safely rejected',()=>{
 assert.equal(readGameSave(null),null);assert.equal(readGameSave('{broken'),null);
 const save=makeGameSave(progress());
 for(const changes of [
  {version:6},{phase:'unknown'},{stage:11},{wall:-1},{wall:0},{gold:-5},{speed:'2'},
  {remainingMs:40000},{spawned:21},{roster:[{id:1,name:'없는 영웅',slot:0}]},
  {roster:[{id:1,name:'constructor',slot:0}]},{roster:[{id:1,name:'유생',slot:40}]},
  {roster:[{id:1,name:'유생',slot:0},{id:2,name:'창병',slot:0}]},
  {enemies:[{...save.enemies[0],id:1}]},{enemies:[{...save.enemies[0],hp:0}]},
  {enemies:[{...save.enemies[0],progress:1}]},{enemies:[{...save.enemies[0],boss:true}]},
  {enemies:[{...save.enemies[0],originStage:1}]},{phase:'cleared'},{phase:'ready'},
 ])assert.equal(roundTrip({...save,...changes}),null,JSON.stringify(changes));
});
test('a preparation save can resume without beginning battle',()=>{
 const save=makeGameSave({...progress(),stage:1,phase:'ready',spawned:0,enemies:[],remainingMs:30000});
 assert.ok(roundTrip(save));assert.equal(restoredCounters(save).deadline,null);assert.ok(canContinue(save));
});

test('a selected 1-8 preparation is a valid resumable save',()=>{
 const save=makeGameSave({...progress(),stage:8,phase:'ready',spawned:0,enemies:[],remainingMs:30000});
 assert.ok(roundTrip(save));assert.equal(restoredCounters(save).completedStage,0);
});
test('legacy ten-wave saves migrate without losing units or resources',()=>{
 const early={...makeGameSave(progress()),version:1};
 assert.equal(roundTrip(early).version,5);assert.deepEqual(roundTrip(early).roster,early.roster);
 for(const stage of [8,9]){
  const legacy={...early,stage,spawned:5,enemies:[{...createInvader(7,0,8),originStage:stage}]};
  const migrated=roundTrip(legacy);
  assert.equal(migrated.stage,8);assert.equal(migrated.phase,'ready');assert.equal(migrated.gold,early.gold);
  assert.equal(migrated.spawned,0);assert.deepEqual(migrated.enemies,[]);assert.deepEqual(migrated.roster,early.roster);
 }
 const boss={...createInvader(10,0,80),originStage:10,hp:1200,progress:.6};
 const legacyFinal={...early,stage:10,enemies:[boss],spawned:23};
 const migratedFinal=roundTrip(legacyFinal);
 assert.equal(migratedFinal.stage,10);assert.equal(migratedFinal.phase,'battle');
 assert.deepEqual(migratedFinal.enemies,[{...boss,originStage:10}]);assert.equal(migratedFinal.remainingMs,early.remainingMs);
 const legacyWon={...legacyFinal,phase:'won',enemies:[],remainingMs:0};
 assert.equal(roundTrip(legacyWon).phase,'won');assert.equal(roundTrip(legacyWon).stage,10);
});
