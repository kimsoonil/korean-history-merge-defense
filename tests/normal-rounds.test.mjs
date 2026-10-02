import test from 'node:test';
import assert from 'node:assert/strict';
import {stageRoundCount,bossRounds,roundBossName,isStageComplete,isCampaignComplete,nextRound} from '../lib/rounds.ts';
import {createRoundInvader} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';

test('normal stages shorten to 15–42 rounds while hard stages stay at 20–65',()=>{
 assert.deepEqual(Array.from({length:10},(_,i)=>stageRoundCount(i+1,'normal')),[15,18,21,24,27,30,33,36,39,42]);
 assert.deepEqual(Array.from({length:10},(_,i)=>stageRoundCount(i+1,'hard')),[20,25,30,35,40,45,50,55,60,65]);
 for(let stage=1;stage<=10;stage++){
  assert.equal(isStageComplete(stage,stageRoundCount(stage,'normal'),'normal'),true);
  assert.equal(nextRound(stage,stageRoundCount(stage,'normal'),'normal'),null);
  assert.equal(bossRounds(stage,'normal').length,stage+1);
  assert.equal(new Set(bossRounds(stage,'normal')).size,stage+1);
  assert.equal(bossRounds(stage,'normal')[0],10);
  assert.equal(bossRounds(stage,'normal').at(-1),stageRoundCount(stage,'normal'));
  for(let round=1;round<=stageRoundCount(stage,'normal');round++){
   const boss=!!roundBossName(stage,round,3,'normal');
   assert.equal(boss,bossRounds(stage,'normal').includes(round));
   assert.equal(createRoundInvader(stage,round,0,stage*100+round,'normal',3).boss,boss);
  }
 }
 assert.equal(isCampaignComplete(10,42,'normal'),true);
 assert.equal(isCampaignComplete(10,42,'hard'),false);
 assert.equal(createRoundInvader(10,42,0,1,'normal',3).reward,0);
});

test('old normal saves beyond the shortened end retain their progress and resources',()=>{
 const base={version:6,roundRules:2,savedAt:1,stage:2,round:25,roster:[],enemies:[],gold:1234,wall:9,phase:'cleared',spawned:20,speed:1,remainingMs:0,difficulty:'normal'};
 const cleared=readGameSave(JSON.stringify(base));
 assert.equal(cleared.round,18);assert.equal(cleared.roundRules,3);assert.equal(cleared.gold,1234);assert.equal(cleared.phase,'cleared');
 const active=readGameSave(JSON.stringify({...base,phase:'battle',spawned:3,remainingMs:10000,round:22}));
 assert.equal(active.round,18);assert.equal(active.phase,'ready');assert.equal(active.gold,1234);
 const newFinal=readGameSave(JSON.stringify({...base,stage:1,round:15,phase:'cleared'}));
 assert.equal(newFinal.round,15);assert.equal(newFinal.phase,'ready');
 const fresh=makeGameSave({...base,round:18,phase:'ready',spawned:0,remainingMs:30000,enemies:[]},2);
 assert.equal(readGameSave(JSON.stringify(fresh)).round,18);
});
