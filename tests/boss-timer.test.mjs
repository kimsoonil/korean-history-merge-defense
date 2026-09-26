import test from 'node:test';
import assert from 'node:assert/strict';
import {tickBossTimers,expiredBoss} from '../lib/boss-timer.ts';
import {createRoundInvader} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
test('bosses have independent ninety-second real-time timers',()=>{
 const a=createRoundInvader(1,10,0,1),b=createRoundInvader(1,20,0,2);
 const first=tickBossTimers([a],60);
 const next=tickBossTimers([...first,b],29);
 assert.equal(next[0].bossSeconds,1);assert.equal(next[1].bossSeconds,61);assert.equal(expiredBoss(next),undefined);
 assert.equal(expiredBoss(tickBossTimers(next,1)).id,1);
 assert.equal(expiredBoss(tickBossTimers([next[1]],1)),undefined);
 assert.equal(a.bossSeconds,undefined);
});
test('remaining boss time survives save/resume and invalid values are rejected',()=>{
 const enemies=tickBossTimers([createRoundInvader(1,10,0,1)],22);
 const save=makeGameSave({roster:[],enemies,gold:400,wall:10,stage:1,round:10,phase:'battle',spawned:1,speed:3,remainingMs:8000});
 assert.equal(readGameSave(JSON.stringify(save)).enemies[0].bossSeconds,68);
 assert.equal(readGameSave(JSON.stringify({...save,enemies:[{...enemies[0],bossSeconds:91}]})),null);
});
