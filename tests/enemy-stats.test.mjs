import test from 'node:test';
import assert from 'node:assert/strict';
import {enemyStats} from '../lib/enemy-stats.ts';
import {createRoundInvader} from '../lib/game.ts';
import {hitDamage} from '../lib/combat.ts';
import {heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
test('early rounds retain health and have zero armor in both modes',()=>{
 for(const mode of ['normal','hard']){
  assert.deepEqual(enemyStats(1,0,false,false,mode),{hp:93,armor:0});
  assert.deepEqual(enemyStats(10,0,true,false,mode),{hp:1850,armor:0});
 }
});
test('round eleven onwards uses round-based health and armor at seventy percent in normal mode',()=>{
 for(let round=11;round<=65;round++)for(const boss of [false,true]){
  const hard=enemyStats(round,0,boss,false,'hard'),normal=enemyStats(round,0,boss);
  assert.equal(hard.hp,round*(boss?1000:100));assert.equal(hard.armor,round*(boss?5:3));
  assert.equal(normal.hp,Math.round(hard.hp*.7));assert.equal(normal.armor,Math.round(hard.armor*.7*10)/10);
 }
 assert.deepEqual(enemyStats(65,0,true,true,'hard'),{hp:100000,armor:400});
 assert.deepEqual(enemyStats(65,0,true,true),{hp:50000,armor:280});
});
test('spawn, damage, armor ignore and saves use per-enemy armor',()=>{
 const enemy=createRoundInvader(10,65,0,1);
 assert.equal(enemy.hp,50000);assert.equal(enemy.armor,280);
 assert.equal(createRoundInvader(10,65,0,1,'hard').armor,400);
 assert.ok(hitDamage('활병',enemy,.4,10)>hitDamage('활병',enemy,0,10));
 assert.ok(Math.abs(heroSkillDamage('을지문덕',enemy,[],10)-heroSkillDamage('을지문덕',{...enemy,armor:0},[],10))<1e-8);
 const save=makeGameSave({roster:[],enemies:[enemy],gold:400,wall:10,stage:10,round:65,phase:'battle',spawned:1,speed:1,remainingMs:30000});
 assert.equal(readGameSave(JSON.stringify(save)).enemies[0].armor,280);
 assert.equal(readGameSave(JSON.stringify({...save,enemies:[{...enemy,armor:-1}]})),null);
});
