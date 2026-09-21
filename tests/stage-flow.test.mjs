import assert from 'node:assert/strict';
import test from 'node:test';
import {canSkipStage,stageClearGold,canAutoAdvanceRound} from '../lib/stage-flow.ts';

const clearedEarly={phase:'battle',timeLeft:19,spawned:7,maxSpawn:7,enemyCount:0,paused:false};

test('automatic advance waits for the timer and every enemy, without a skip click',()=>{
 const ended={...clearedEarly,timeLeft:0};
 assert.equal(canAutoAdvanceRound(ended),true);
 for(const change of [{timeLeft:1},{enemyCount:1},{spawned:6},{paused:true},{phase:'won'},{phase:'lost'},{phase:'ready'},{phase:'cleared'}])assert.equal(canAutoAdvanceRound({...ended,...change}),false);
});

test('skip unlocks only after the entire wave has spawned and been defeated',()=>{
  assert.equal(canSkipStage(clearedEarly),true);
  assert.equal(canSkipStage({...clearedEarly,enemyCount:1}),false);
  assert.equal(canSkipStage({...clearedEarly,spawned:6}),false);
  assert.equal(canSkipStage({...clearedEarly,spawned:0}),false);
  assert.equal(canSkipStage({...clearedEarly,maxSpawn:0}),false);
});

test('skip is unavailable before battle, after timeout, during cinematics or after a result',()=>{
  for(const phase of ['ready','cleared','lost','won'])assert.equal(canSkipStage({...clearedEarly,phase}),false);
  assert.equal(canSkipStage({...clearedEarly,timeLeft:0}),false);
  assert.equal(canSkipStage({...clearedEarly,timeLeft:-1}),false);
  assert.equal(canSkipStage({...clearedEarly,paused:true}),false);
});

test('final-stage time can be skipped only after the boss and every other enemy are defeated',()=>{
  const final={...clearedEarly,spawned:23,maxSpawn:23};
  assert.equal(canSkipStage(final),true);
  assert.equal(canSkipStage({...final,enemyCount:1}),false);
  assert.equal(canSkipStage({...final,spawned:22}),false);
});

test('time skips use the same clear reward as waiting for the timer',()=>{
  assert.equal(stageClearGold(1),85);
  assert.equal(stageClearGold(7),175);
  assert.equal(stageClearGold(8),0);
});
