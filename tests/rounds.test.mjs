import test from 'node:test';
import assert from 'node:assert/strict';
import {stageRoundCount,roundBossName,roundEnemyCount,nextRound,isStageComplete,isCampaignComplete} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave,restoredCounters} from '../lib/save.ts';
import {getMusicMood} from '../lib/music.ts';

test('eight stages contain 20 through 55 rounds in increments of five',()=>{
 assert.deepEqual(Array.from({length:8},(_,i)=>stageRoundCount(i+1)),[20,25,30,35,40,45,50,55]);
 assert.deepEqual(nextRound(1,19),{stage:1,round:20});
 assert.equal(nextRound(1,20),null);
 assert.equal(nextRound(8,55),null);
});
test('all 300 rounds spawn one boss first only on the configured schedule',()=>{
 for(let stage=1;stage<=8;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const expected=round===10||round>=20&&round%5===0;
  const enemies=Array.from({length:roundEnemyCount(stage,round)},(_,i)=>createRoundInvader(stage,round,i,i+1));
  assert.equal(enemies.length,10);
  assert.equal(enemies.filter(e=>e.boss).length,expected?1:0,`${stage}/${round}`);
  assert.equal(enemies[0].boss,expected);
  if(expected){assert.equal(enemies[0].name,stage===8&&round===55?'수양제':'수나라 장군');assert.equal(enemies[0].hp,Math.max(...enemies.slice(1).map(e=>e.hp))*10);}
  assert.equal(getMusicMood('battle',enemies),expected?'boss':'silent');
  assert.equal(isStageComplete(stage,round),round===stageRoundCount(stage));
  assert.equal(isCampaignComplete(stage,round),stage===8&&round===55);
 }
 assert.deepEqual(enemyPortraits['수나라 장군'],enemyPortraits['수나라 정예군']);
});
test('version three saves adopt ten enemies without losing heroes, resources or boss health',()=>{
 const state={version:3,savedAt:1,stage:8,round:55,roster:[{id:1,name:'이순신',slot:0}],gold:800,wall:7,phase:'battle',spawned:40,speed:3,remainingMs:4000,heroCooldowns:[[1,4]]};
 const enemies=Array.from({length:15},(_,i)=>createRoundInvader(8,55,i,100+i));enemies[0].hp=123;
 const loaded=readGameSave(JSON.stringify({...state,enemies}));
 assert.equal(loaded.version,4);assert.equal(loaded.spawned,10);assert.equal(loaded.enemies.length,10);assert.equal(loaded.enemies[0].hp,123);
 for(const key of ['roster','gold','wall','round','heroCooldowns','remainingMs'])assert.deepEqual(loaded[key],state[key]);
 const clear=readGameSave(JSON.stringify({...state,phase:'won',enemies:[],remainingMs:0}));assert.equal(clear.spawned,10);
 const early=readGameSave(JSON.stringify({...state,stage:1,round:1,spawned:3,enemies:[]}));assert.equal(early.spawned,3);
});
test('every round can save and resume, including mid-stage clear and injured bosses',()=>{
 for(let stage=1;stage<=8;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy={...createRoundInvader(stage,round,0,1),hp:1,progress:.4};
  const state={stage,round,enemies:[enemy],roster:[],gold:320,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:12500};
  const save=makeGameSave(state,1);assert.deepEqual(readGameSave(JSON.stringify(save)),save);
  const clear=makeGameSave({...state,enemies:[],spawned:roundEnemyCount(stage,round),remainingMs:0,phase:isCampaignComplete(stage,round)?'won':'cleared'},2);
  assert.deepEqual(readGameSave(JSON.stringify(clear)),clear);
  assert.equal(restoredCounters(clear).completedStage,stage*100+round);
  if(!roundBossName(stage,round))assert.equal(readGameSave(JSON.stringify({...save,enemies:[{...enemy,boss:true,name:'수나라 장군'}]})),null);
 }
});
test('version two saves preserve inventory and migrate cleared stages and emperor battles',()=>{
 const base={version:2,savedAt:1,stage:1,roster:[{id:2,name:'장보고',slot:0}],enemies:[],gold:1250,wall:8,phase:'cleared',spawned:7,speed:2,remainingMs:0};
 const migrated=readGameSave(JSON.stringify(base));assert.equal(migrated.round,20);assert.deepEqual(migrated.roster,base.roster);assert.equal(migrated.gold,1250);
 const boss=createRoundInvader(8,55,0,3);
 const final=readGameSave(JSON.stringify({...base,stage:8,phase:'battle',spawned:23,enemies:[{...boss,hp:45}]}));
 assert.equal(final.round,55);assert.equal(final.enemies[0].hp,45);
});
