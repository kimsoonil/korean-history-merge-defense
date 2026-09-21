import test from 'node:test';
import assert from 'node:assert/strict';
import {canCompleteStage} from '../lib/stage-flow.ts';
import {nextRound,stageRoundCount} from '../lib/rounds.ts';
import {makeGameSave,readGameSave,canContinue} from '../lib/save.ts';
import {recordWaveClear,isWaveUnlocked} from '../lib/campaign.ts';
test('last round clears immediately, not intermediate rounds or while enemies remain',()=>{
 const state={phase:'battle',timeLeft:15,spawned:10,maxSpawn:10,enemyCount:0,paused:false};
 assert.equal(canCompleteStage(state,1,20),true);
 for(const change of [{enemyCount:1},{spawned:9},{paused:true},{phase:'cleared'}])assert.equal(canCompleteStage({...state,...change},1,20),false);
 assert.equal(canCompleteStage(state,1,19),false);
});
test('stage endings stop automatic progression and unlock only the next choice',()=>{
 let cleared=0;
 for(let stage=1;stage<=8;stage++){
  assert.equal(nextRound(stage,stageRoundCount(stage)),null);
  cleared=recordWaveClear(cleared,stage);
  if(stage<8)assert.equal(isWaveUnlocked(stage+1,cleared),true);
  if(stage<7)assert.equal(isWaveUnlocked(stage+2,cleared),false);
 }
});
test('completed stage save cannot resume into next stage; newly selected stage begins at round one',()=>{
 const base={roster:[],enemies:[],gold:400,wall:10,stage:1,round:20,phase:'cleared',spawned:10,speed:1,remainingMs:0};
 const cleared=readGameSave(JSON.stringify(makeGameSave(base)));assert.ok(cleared);assert.equal(canContinue(cleared),false);
 const fresh=readGameSave(JSON.stringify(makeGameSave({...base,stage:2,round:1,phase:'ready',spawned:0,remainingMs:30000})));
 assert.ok(fresh);assert.equal(canContinue(fresh),true);assert.equal(fresh.round,1);
});
