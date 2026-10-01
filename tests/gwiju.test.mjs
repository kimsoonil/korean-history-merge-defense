import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {gwijuBossNames,gwijuArrival,GWIJU_IMAGE} from '../lib/gwiju.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('Gwiju requires all four earlier normal chapters, independent progress keys',()=>{
 assert.equal(chapterUnlocked(5,10,10,10,10),true);
 for(let i=0;i<4;i++){const progress=[10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(5,...progress),false);}
 assert.equal(chapterUnlocked(6,10,10,10,10),false);
 assert.equal(new Set([1,2,3,4,5].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,10);
 assert.ok(storyChapters[4].available);assert.ok(storyChapters[8].available);
 assert.ok(existsSync(new URL('../public'+GWIJU_IMAGE,import.meta.url)));
 assert.match(gwijuArrival(0,'홍길동').text,/홍길동/);assert.equal(gwijuArrival(5,'홍길동'),undefined);
});
test('every Gwiju normal and hard round can spawn and resume from a saved game',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,5);
  assert.equal(enemy.chapter,5);assert.equal(enemy.boss,!!roundBossName(stage,round,5));assert.ok(enemyPortraits[enemy.name]);
  assert.match(enemy.name,/거란|소배압/);
  assert.match(frontForStage(stage,5).id,/^gwiju-/);assert.equal(frontIntro(stage,5).speaker,'강감찬');
  const save=makeGameSave({chapter:5,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,5):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Gwiju boss speech, final balance and victory save use chapter five',()=>{
 for(const [round,name] of Object.entries(gwijuBossNames)){
  assert.equal(roundBossName(10,Number(round),5),name);assert.ok(bossLine(name,10,false,5));assert.ok(bossLine(name,10,true,5));
  if(name!=='소배압')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',5).hp,122000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',5).hp,122000);
 const save=makeGameSave({chapter:5,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
