import test from 'node:test';
import assert from 'node:assert/strict';
import {roundEnemyCount,stageRoundCount,ROUND_CLEAR_GOLD} from '../lib/rounds.ts';
import {createRoundInvader} from '../lib/game.ts';
test('round clear grants fifty gold in addition to kill rewards',()=>{
 assert.equal(ROUND_CLEAR_GOLD,50);
});
test('normal enemies pay twenty or fifteen, while stage-final bosses pay no reward',()=>{
 for(let stage=1;stage<=10;stage++)for(let round=1;round<=stageRoundCount(stage);round++)for(const mode of ['normal','hard']){
  const count=roundEnemyCount(stage,round,mode);assert.equal(count,mode==='normal'?15:20);
  const enemies=Array.from({length:count},(_,i)=>createRoundInvader(stage,round,i,i+1,mode));
  for(const e of enemies)assert.equal(e.reward,e.boss?(round===stageRoundCount(stage)?0:30*round):mode==='normal'?20:15);
  if(!enemies.some(e=>e.boss))assert.equal(enemies.reduce((sum,e)=>sum+e.reward,0),300);
 }
 assert.equal(createRoundInvader(1,10,0,1).reward,300);
 assert.equal(createRoundInvader(9,60,0,1).reward,0);
 assert.equal(createRoundInvader(10,65,0,1).hp,100000);
 assert.equal(createRoundInvader(10,65,0,1,'hard').hp,100000);
});
