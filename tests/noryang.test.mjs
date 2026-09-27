import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chapterUnlocked,progressKey} from '../lib/ansi.ts';
import {noryangBossNames,noryangArrival,NORYANG_IMAGE} from '../lib/noryang.ts';
import {frontForStage} from '../lib/campaign.ts';
import {frontIntro} from '../lib/front-intro.ts';
import {stageRoundCount,roundBossName} from '../lib/rounds.ts';
import {createRoundInvader,enemyPortraits} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {bossLine,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {drawBannedHeroes} from '../lib/hard-mode.ts';
import {storyChapters} from '../lib/story-chapters.ts';
test('replaced siege saves do not resume as Noryang and progress keys are separate',()=>{
 const save=makeGameSave({chapter:10,stage:1,round:1,enemies:[],roster:[],gold:400,wall:10,phase:'ready',spawned:0,speed:1,remainingMs:30000},1);
 assert.ok(readGameSave(JSON.stringify(save)));
 delete save.chapterScenario;
 assert.equal(readGameSave(JSON.stringify(save)),null);
 assert.equal(progressKey(10),'noryang-campaign-v1');
 assert.equal(progressKey(10,true),'noryang-hard-campaign-v1');
 assert.equal(storyChapters[9].title,'노량해전');
});
test('Noryang requires previous nine normal chapters and has independent progress',()=>{
 assert.equal(chapterUnlocked(10,10,10,10,10,10,10,10,10,10),true);
 for(let i=0;i<9;i++){const progress=[10,10,10,10,10,10,10,10,10];progress[i]=9;assert.equal(chapterUnlocked(10,...progress),false);}
 assert.equal(chapterUnlocked(10,10,10,10,10,10),false);
 assert.equal(new Set([1,2,3,4,5,6,7,8,10].flatMap(c=>[progressKey(c),progressKey(c,true)])).size,18);
 assert.ok(storyChapters[9].available);assert.equal(storyChapters[8].available,false);
 assert.ok(existsSync(new URL('../public'+NORYANG_IMAGE,import.meta.url)));
 assert.match(noryangArrival(0,'홍길동').text,/홍길동/);assert.equal(noryangArrival(5,'홍길동'),undefined);
});
test('every Noryang normal and hard round spawns and resumes correctly',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++){
  const enemy=createRoundInvader(stage,round,0,1,difficulty,10);
  assert.equal(enemy.chapter,10);assert.equal(enemy.boss,!!roundBossName(stage,round,10));assert.ok(enemyPortraits[enemy.name]);assert.ok(existsSync(new URL('../public'+enemyPortraits[enemy.name].src,import.meta.url)));
  assert.match(enemy.name,/노량|관음포|시마즈/);assert.match(frontForStage(stage,10).id,/^noryang-/);assert.equal(frontIntro(stage,10).speaker,'이순신');
  const save=makeGameSave({chapter:10,difficulty,bannedHeroes:difficulty==='hard'?drawBannedHeroes(()=>.5,10):[],stage,round,enemies:[enemy],roster:[],gold:400,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:15000},1);
  assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 }
});
test('Noryang dialogue, final boss balance and victory save use chapter ten',()=>{
 for(const [round,name] of Object.entries(noryangBossNames)){
  assert.equal(roundBossName(10,Number(round),10),name);assert.ok(bossLine(name,10,false,10));assert.ok(bossLine(name,10,true,10));
  if(name!=='시마즈 요시히로')assert.equal(defeatedDialogueBoss([{id:1,name,boss:true,hp:1}],new Map([[1,5]])).name,name);
 }
 assert.equal(createRoundInvader(10,65,0,1,'normal',10).hp,50000);
 assert.equal(createRoundInvader(10,65,0,1,'hard',10).hp,100000);
 const save=makeGameSave({chapter:10,stage:10,round:65,enemies:[],roster:[],gold:400,wall:10,phase:'won',spawned:15,speed:1,remainingMs:0},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
