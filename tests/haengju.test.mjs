import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {haengjuBossNames,haengjuArrival,HAENGJU_IMAGE} from '../lib/haengju.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('Haengju requires previous seven normal chapters and has independent progress',()=>{
 assert.equal(chapterUnlocked(8,10,10,10,10,10,10,10),true);
 for(let i=0;i<7;i++){const progress=[10,10,10,10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(8,...progress),false);}
 assert.equal(chapterUnlocked(8,10,10,10,10,10),false);
 assert.equal(new Set([1,2,3,4,5,6,7,8].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,16);
 assert.ok(storyChapters[7].available);assert.ok(storyChapters[8].available);
 assert.ok(existsSync(new URL('../public'+HAENGJU_IMAGE,import.meta.url)));
 assert.match(haengjuArrival(0,'홍길동').text,/홍길동/);assert.equal(haengjuArrival(5,'홍길동'),undefined);
});
test('every Haengju normal and hard round spawns and resumes correctly',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,8);
  assert.equal(enemy.chapter,8);assert.equal(enemy.boss,!!roundBossName(stage,round,8));assert.ok(enemyPortraits[enemy.name]);assert.equal(enemyPortraits[enemy.name].standalone,true);assert.ok(existsSync(new URL('../public'+enemyPortraits[enemy.name].src,import.meta.url)));
  assert.match(enemy.name,/일본|목책|우키타/);assert.match(frontForStage(stage,8).id,/^haengju-/);assert.equal(frontIntro(stage,8).speaker,'권율');
  const save=makeGameSave({chapter:8,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,8):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Haengju dialogue, final boss balance and victory save use chapter eight',()=>{
 for(const [round,name] of Object.entries(haengjuBossNames)){
  assert.equal(roundBossName(10,Number(round),8),name);assert.ok(bossLine(name,10,false,8));assert.ok(bossLine(name,10,true,8));
  if(name!=='우키타 히데이에')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',8).hp,139000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',8).hp,139000);
 const save=makeGameSave({chapter:8,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
