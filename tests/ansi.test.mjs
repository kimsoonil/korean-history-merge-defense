import test from 'node:test';
import assert from 'node:assert/strict';
import {progressKey,ansiArrival,ansiBossNames} from '../lib/ansi.ts';
import {frontForStage} from '../lib/campaign.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';

test('chapters have independent normal and hard progress',()=>{
 assert.equal(new Set([progressKey(1),progressKey(1,true),progressKey(2),progressKey(2,true)]).size,4);
 assert.equal(progressKey(1),'salsu-campaign-v1');
 for(let stage=1;stage<=10;stage++)assert.match(frontForStage(stage,2).id,/^ansi-/);
 assert.equal(ansiArrival(0,'테스트').text.includes('테스트'),true);
 assert.equal(ansiArrival(4,'테스트')!==undefined,true);
});
test('Ansi every stage round spawns and resumes with Tang enemies',()=>{
 for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,'normal',2);
  assert.equal(enemy.chapter,2);
  assert.equal(enemy.boss,!!roundBossName(stage,round,2));
  assert.doesNotMatch(enemy.name,/수나라|수양제/);
  const save=makeGameSave({chapter:2,stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:20000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save,`${stage}/${round}`);
 }
});
test('Ansi bosses preserve established balance and chapter one remains Sui',()=>{
 for(const [round,name] of Object.entries(ansiBossNames))assert.equal(roundBossName(10,Number(round),2),name);
 assert.equal(createRoundInvader(10,65,0,1,'normal',2).hp,50000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',2).hp,100000);
 assert.equal(createRoundInvader(10,65,0,1,'normal',1).name,'수양제');
 assert.equal(createRoundInvader(10,60,0,1,'normal',2).reward,1800);
});
