import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {enemyPortraits,enemyPortraitFor,createRoundInvader} from '../lib/game.ts';
import {storyCampaigns} from '../lib/story-campaigns.ts';
import {legacyStageBossName,stageBossName,storyEnemyNames} from '../lib/story-battle.ts';
import {stageRoundCount} from '../lib/rounds.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';

test('each story has its own enemy artwork and ten distinct final-round commanders',()=>{
 const sheets=new Set();
 for(const story of storyCampaigns){
  const regular=storyEnemyNames(story.id).map(name=>enemyPortraitFor({name,boss:false,chapter:story.id,originStage:1,originRound:1}));
  assert.equal(regular.length,6);
  const sheet=regular[0].src;
  assert.ok(existsSync(new URL(`../public${sheet}`,import.meta.url)),sheet);
  assert.equal(regular.every(art=>art.src===sheet&&art.crop),true,story.title);
  assert.equal(new Set(regular.map(art=>JSON.stringify(art.crop))).size,6,story.title);
  const bosses=Array.from({length:10},(_,index)=>{
   const stage=index+1,name=stageBossName(story.id,stage);
   const enemy=createRoundInvader(stage,stageRoundCount(stage),0,stage,'normal',story.id);
   assert.equal(enemy.name,name);
   const art=enemyPortraitFor(enemy);
   assert.equal(art.src,sheet);
   assert.deepEqual(enemyPortraitFor({...enemy,name:legacyStageBossName(story.id,stage)}),art);
   return {name,crop:art.crop};
  });
  assert.equal(new Set(bosses.map(boss=>boss.name)).size,10,story.title);
  assert.equal(new Set(bosses.map(boss=>JSON.stringify(boss.crop))).size,10,story.title);
  sheets.add(sheet);
 }
 assert.equal(sheets.size,10);
});

test('Imjin War enemies are human Japanese soldiers, not ship sprites',()=>{
 assert.deepEqual(storyEnemyNames(10),['일본 보병','일본 창병','일본 궁병','일본 기병','일본 조총병','일본 정예병']);
 for(const name of [...storyEnemyNames(10),stageBossName(10,10)]){
  assert.match(enemyPortraits[name].src,/\/portraits\/enemies\/imjin-war\.png$/);
  assert.notEqual(enemyPortraits[name].standalone,true);
 }
});

test('old in-progress stage bosses and ship-named enemies still resume',()=>{
 const boss={...createRoundInvader(1,20,0,1,'normal',10),name:legacyStageBossName(10,1),progress:.2};
 const regular={...createRoundInvader(1,20,1,2,'normal',10),name:'일본 전선',progress:.3};
 const save=makeGameSave({chapter:10,stage:1,round:20,enemies:[boss,regular],roster:[],gold:400,wall:10,phase:'battle',spawned:2,speed:1,remainingMs:15000},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
});
