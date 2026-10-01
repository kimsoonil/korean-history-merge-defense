import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {cheoinBossNames,cheoinArrival,CHEOIN_IMAGE} from '../lib/cheoin.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('Cheoin requires previous five normal chapters and has independent progress',()=>{
 assert.equal(chapterUnlocked(6,10,10,10,10,10),true);
 for(let i=0;i<5;i++){const progress=[10,10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(6,...progress),false);}
 assert.equal(chapterUnlocked(7,10,10,10,10,10),false);
 assert.equal(new Set([1,2,3,4,5,6].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,12);
 assert.ok(storyChapters[5].available);assert.ok(storyChapters[8].available);
 assert.ok(existsSync(new URL('../public'+CHEOIN_IMAGE,import.meta.url)));
 assert.match(cheoinArrival(0,'홍길동').text,/홍길동/);assert.equal(cheoinArrival(5,'홍길동'),undefined);
});
test('every Cheoin normal and hard round spawns and resumes correctly',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,6);
  assert.equal(enemy.chapter,6);assert.equal(enemy.boss,!!roundBossName(stage,round,6));assert.ok(enemyPortraits[enemy.name]);
  assert.match(enemy.name,/몽골|살리타/);assert.match(frontForStage(stage,6).id,/^cheoin-/);assert.equal(frontIntro(stage,6).speaker,'김윤후');
  const save=makeGameSave({chapter:6,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,6):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Cheoin dialogue, final boss balance and victory save use chapter six',()=>{
 for(const [round,name] of Object.entries(cheoinBossNames)){
  assert.equal(roundBossName(10,Number(round),6),name);assert.ok(bossLine(name,10,false,6));assert.ok(bossLine(name,10,true,6));
  if(name!=='살리타')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',6).hp,128000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',6).hp,128000);
 const save=makeGameSave({chapter:6,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
