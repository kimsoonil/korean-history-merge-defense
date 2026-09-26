import test from 'node:test';
import assert from 'node:assert/strict';
import {isOverrun,canCompleteStage} from '../lib/stage-flow.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {createRoundInvader} from '../lib/game.ts';
test('100 enemies triggers defeat, but 99 does not',()=>{
 assert.equal(isOverrun(99),false);assert.equal(isOverrun(100),true);assert.equal(isOverrun(101),true);
});
test('carryover enemies and earlier bosses survive save and resume',()=>{
 const enemies=Array.from({length:40},(_,i)=>createRoundInvader(1,i<20?10:11,i%20,i+1));
 const saved=makeGameSave({stage:1,round:11,enemies,roster:[],gold:400,wall:10,phase:'battle',spawned:20,speed:1,remainingMs:1000},1);
 assert.deepEqual(readGameSave(JSON.stringify(saved)),saved);
});
test('the last round cannot clear with living enemies',()=>{
 const progress={phase:'battle',timeLeft:0,spawned:20,maxSpawn:20,enemyCount:1,paused:false};
 assert.equal(canCompleteStage(progress,1,20),false);
 assert.equal(canCompleteStage({...progress,enemyCount:0},1,20),true);
});
