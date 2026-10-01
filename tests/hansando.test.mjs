import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {hansandoBossNames,hansandoArrival,HANSANDO_IMAGE} from '../lib/hansando.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('Hansando requires previous six normal chapters and has independent progress',()=>{
 assert.equal(chapterUnlocked(7,10,10,10,10,10,10),true);
 for(let i=0;i<6;i++){const progress=[10,10,10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(7,...progress),false);}
 assert.equal(chapterUnlocked(7,10,10,10,10,10),false);
 assert.equal(new Set([1,2,3,4,5,6,7].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,14);
 assert.ok(storyChapters[6].available);assert.ok(storyChapters[8].available);
 assert.ok(existsSync(new URL('../public'+HANSANDO_IMAGE,import.meta.url)));
 assert.match(hansandoArrival(0,'홍길동').text,/홍길동/);assert.equal(hansandoArrival(5,'홍길동'),undefined);
});
test('every Hansando normal and hard round spawns and resumes correctly',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,7);
  assert.equal(enemy.chapter,7);assert.equal(enemy.boss,!!roundBossName(stage,round,7));assert.ok(enemyPortraits[enemy.name]);
  assert.match(enemy.name,/일본|선단|지휘관|와키자카/);assert.match(frontForStage(stage,7).id,/^hansando-/);assert.equal(frontIntro(stage,7).speaker,'이순신');
  const save=makeGameSave({chapter:7,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,7):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Hansando dialogue, final boss balance and victory save use chapter seven',()=>{
 for(const [round,name] of Object.entries(hansandoBossNames)){
  assert.equal(roundBossName(10,Number(round),7),name);assert.ok(bossLine(name,10,false,7));assert.ok(bossLine(name,10,true,7));
  if(name!=='와키자카 야스하루')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',7).hp,133000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',7).hp,133000);
 const save=makeGameSave({chapter:7,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
