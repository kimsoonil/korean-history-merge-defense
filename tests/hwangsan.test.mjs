import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {hwangsanBossNames,hwangsanArrival,hwangsanVictory,HWANGSAN_IMAGE} from '../lib/hwangsan.ts';
import {frontForStage} from '../lib/campaign.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits,byName} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';

test('Hwangsan requires previous chapters, and progress has six independent keys',()=>{
 assert.equal(chapterUnlocked(3,10,9),false);
 assert.equal(chapterUnlocked(3,9,10),false);
 assert.equal(chapterUnlocked(3,10,10),true);
 assert.equal(chapterUnlocked(4,10,10),false);
 assert.equal(new Set([1,2,3].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,6);
 assert.ok(existsSync(new URL('../public'+HWANGSAN_IMAGE,import.meta.url)));
 assert.equal(hwangsanArrival(0,'테스트').text.includes('테스트'),true);
 assert.equal(hwangsanArrival(4,'테스트').speaker,'책의 정령');
});
test('every Hwangsan round spawns Baekje enemies and round-trips normal/hard saves',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  assert.match(frontForStage(stage,3).id,/^hwangsan-/);
  const enemy=createRoundInvader(stage,round,0,1,difficulty,3);
  assert.equal(enemy.boss,!!roundBossName(stage,round,3));
  assert.doesNotMatch(enemy.name,/수나라|당나라|수양제/);
  assert.ok(enemyPortraits[enemy.name]);
  const save=makeGameSave({chapter:3,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,3):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Hwangsan boss dialogues, Gaebaek art and final victory use chapter three',()=>{
 for(const [round,name] of Object.entries(hwangsanBossNames)){
  assert.equal(roundBossName(10,Number(round),3),name);
  assert.ok(bossLine(name,10,false,3));assert.ok(bossLine(name,10,true,3));
  if(name!=='계백')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',3).hp,50000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',3).hp,100000);
 assert.deepEqual(enemyPortraits['계백'],byName['계백'].atlas);
 const save=makeGameSave({chapter:3,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 assert.match(hwangsanVictory,/황산벌/);
});
