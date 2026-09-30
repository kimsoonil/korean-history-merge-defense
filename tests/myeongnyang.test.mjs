import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {myeongnyangBossNames,myeongnyangArrival,MYEONGNYANG_IMAGE} from '../lib/myeongnyang.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';

test('Myeongnyang unlocks after the previous eight chapters and keeps separate progress',()=>{
 assert.equal(chapterUnlocked(9,10,10,10,10,10,10,10,10),true);
 for(let i=0;i<8;i++){const progress=[10,10,10,10,10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(9,...progress),false);}
 assert.equal(progressKey(9),'myeongnyang-campaign-v1');
 assert.equal(progressKey(9,true),'myeongnyang-hard-campaign-v1');
 assert.equal(storyChapters[8].title,'명량대첩');
 assert.ok(storyChapters[8].available);
 assert.ok(existsSync(new URL('../public'+MYEONGNYANG_IMAGE,import.meta.url)));
 assert.ok(existsSync(new URL('../public/regions/myeongnyang.png',import.meta.url)));
});

test('every Myeongnyang normal and hard round spawns and resumes correctly',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,9);
  assert.equal(enemy.chapter,9);assert.equal(enemy.boss,!!roundBossName(stage,round,9));
  assert.ok(enemyPortraits[enemy.name]);assert.match(enemy.name,/일본|명량|울돌목|구루시마/);
  assert.match(frontForStage(stage,9).id,/^myeongnyang-/);assert.equal(frontIntro(stage,9).speaker,'이순신');
  const save=makeGameSave({chapter:9,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,9):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});

test('Myeongnyang boss dialogue and final battle are connected',()=>{
 for(const [round,name] of Object.entries(myeongnyangBossNames)){
  assert.equal(roundBossName(10,Number(round),9),name);
  assert.ok(bossLine(name,10,false,9));assert.ok(bossLine(name,10,true,9));
 }
 assert.match(myeongnyangArrival(0,'홍길동').text,/홍길동/);
 assert.equal(myeongnyangArrival(5,'홍길동'),undefined);
});
