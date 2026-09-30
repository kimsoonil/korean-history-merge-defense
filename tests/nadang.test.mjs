import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {nadangBossNames,nadangArrival,nadangVictory} from '../lib/nadang.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('Nadang unlocks after previous three normal chapters and stores progress separately',()=>{
 for(const progress of [[9,10,10],[10,9,10],[10,10,9]])assert.equal(chapterUnlocked(4,...progress),false);
 assert.equal(chapterUnlocked(4,10,10,10),true);
 assert.equal(chapterUnlocked(5,10,10,10),false);
 assert.equal(new Set([1,2,3,4].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,8);
 assert.match(nadangArrival(0,'테스트').text,/테스트/);
 assert.equal(nadangArrival(5,'테스트'),undefined);
});
test('all Nadang stage rounds spawn, save and restore in both difficulties',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,4);
  assert.equal(enemy.boss,!!roundBossName(stage,round,4));
  assert.ok(enemyPortraits[enemy.name]);
  assert.doesNotMatch(enemy.name,/수나라|백제|수양제|계백/);
  const save=makeGameSave({chapter:4,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,4):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Nadang boss dialogues, final balance and victory are chapter-specific',()=>{
 for(const [round,name] of Object.entries(nadangBossNames)){
  assert.equal(roundBossName(10,Number(round),4),name);
  assert.ok(bossLine(name,10,false,4));assert.ok(bossLine(name,10,true,4));
  if(name!=='설인귀')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',4).hp,50000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',4).hp,100000);
 const save=makeGameSave({chapter:4,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 assert.match(nadangVictory,/나당전쟁/);
 assert.equal(frontIntro(1,4).speaker,'문무왕');assert.equal(frontIntro(4,4).speaker,'김원술');assert.equal(frontIntro(7,4).speaker,'시득');
});
test('book covers are illustrations and Nadang terrain switches at coastal stages',()=>{
 assert.equal(storyChapters.filter(c=>c.available).length,10);
 assert.equal(storyChapters[0].image,'/cinematics/eulji.png');
 assert.equal(storyChapters[6].image,'/cinematics/yi-sunsin.png');
 for(const chapter of storyChapters){assert.doesNotMatch(chapter.image,/terrain/);assert.ok(existsSync(new URL('../public'+chapter.image,import.meta.url)));}
 for(let stage=1;stage<=10;stage++){
  const front=frontForStage(stage,4);assert.match(front.image,stage<=6?/nadang-land/:/nadang-coast/);
  assert.ok(existsSync(new URL('../public'+front.image,import.meta.url)));
 }
});
