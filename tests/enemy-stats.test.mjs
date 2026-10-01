import test from 'node:test';
import assert from 'node:assert/strict';
import {enemyStats,storyFinalBossHp} from '../lib/enemy-stats.ts';
import {createRoundInvader} from '../lib/game.ts';
import {hitDamage} from '../lib/combat.ts';
import {heroSkillDamage} from '../lib/hero-skills.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
test('enemy health and armor grow across round, stage and chapter',()=>{
 assert.deepEqual(enemyStats(1,0,false,false,'hard',1,1,false,20),{hp:200,armor:0});
 assert.deepEqual(enemyStats(1,0,false,false,'normal',1,1,false,20),{hp:140,armor:0});
 assert.deepEqual(enemyStats(20,0,false,false,'hard',1,1,false,20),{hp:800,armor:40});
 assert.deepEqual(enemyStats(20,0,false,false,'normal',1,1,false,20),{hp:560,armor:28});
 const early=enemyStats(65,1,false,false,'hard',10,1,false,65);
 const late=enemyStats(65,1,false,false,'hard',10,10,false,65);
 assert.deepEqual(early,{hp:1520,armor:292});
 assert.deepEqual(late,{hp:3162,armor:364});
});
test('normal scaling, mid bosses, stage bosses and story finales use separate rules',()=>{
 const regular=enemyStats(10,0,false,false,'hard',1,1,false,20);
 const mid=enemyStats(10,0,true,false,'hard',1,1,false,20);
 assert.equal(mid.hp,regular.hp*8);assert.equal(mid.armor,regular.armor+40);
 assert.deepEqual(enemyStats(20,0,true,false,'hard',1,1,true,20),{hp:11200,armor:100});
 assert.deepEqual(enemyStats(20,0,true,false,'normal',1,1,true,20),{hp:7840,armor:70});
 assert.deepEqual(enemyStats(65,0,true,true,'hard',10,1,true,65),{hp:100000,armor:310});
 assert.deepEqual(enemyStats(65,0,true,true,'normal',10,10,true,65),{hp:150000,armor:400});
 assert.deepEqual(enemyStats(65,1,false,false,'normal',10,10,false,65),{hp:2688,armor:309.4});
});
test('spawn, damage, armor ignore and saves use per-enemy armor',()=>{
 const enemy=createRoundInvader(10,65,0,1,'normal',10);
 assert.equal(enemy.hp,150000);assert.equal(enemy.armor,400);
 assert.equal(createRoundInvader(10,65,0,1,'hard',10).armor,400);
 assert.ok(hitDamage('활병',enemy,.4,10)>hitDamage('활병',enemy,0,10));
 assert.ok(Math.abs(heroSkillDamage('을지문덕',enemy,[],10)-heroSkillDamage('을지문덕',{...enemy,armor:0},[],10))<1e-8);
 const save=makeGameSave({chapter:10,roster:[],enemies:[enemy],gold:400,wall:10,stage:10,round:65,phase:'battle',spawned:1,speed:1,remainingMs:30000});
 assert.equal(readGameSave(JSON.stringify(save)).enemies[0].armor,400);
 assert.equal(readGameSave(JSON.stringify({...save,enemies:[{...enemy,armor:-1}]})),null);
});
test('story-finale health rises from one hundred thousand at Salsu to one hundred fifty thousand at Noryang',()=>{
 const expected=[100000,106000,111000,117000,122000,128000,133000,139000,144000,150000];
 for(let chapter=1;chapter<=10;chapter++)for(const difficulty of ['normal','hard']){
  const enemy=createRoundInvader(10,65,0,1,difficulty,chapter);
  assert.equal(enemy.hp,expected[chapter-1]);
  assert.equal(enemy.hp,storyFinalBossHp(chapter));
  assert.equal(enemy.armor,310+(chapter-1)*10);
 }
});
