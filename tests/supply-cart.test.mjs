import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {SUPPLY_CART_NAME,createRoundInvader,enemyPortraitFor} from '../lib/game.ts';
import {bossRounds,isSupplyRound,roundBossName,roundEnemyCount,stageRoundCount,supplyCartReward} from '../lib/rounds.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';

test('one grain supply cart appears in the round immediately before each boss',()=>{
 for(const difficulty of ['normal','hard'])for(let stage=1;stage<=10;stage++){
  for(let round=1;round<=stageRoundCount(stage,difficulty);round++){
   const count=roundEnemyCount(stage,round,difficulty);
   const enemies=Array.from({length:count},(_,index)=>createRoundInvader(stage,round,index,index+1,difficulty,3));
   const carts=enemies.filter(enemy=>enemy.name===SUPPLY_CART_NAME);
   assert.equal(carts.length,isSupplyRound(stage,round,difficulty)?1:0,`${difficulty} ${stage}-${round}`);
   if(carts.length){
    assert.equal(carts[0].reward,supplyCartReward(stage,round,difficulty));
    assert.equal(carts[0].boss,false);
    assert.equal(enemies.indexOf(carts[0]),0);
    assert.equal(roundBossName(stage,round,3,difficulty),null);
    assert.ok(bossRounds(stage,difficulty).includes(round+1));
    assert.equal(enemies.length,count);
   }
  }
 }
 assert.equal(supplyCartReward(10,9,'hard'),100);
 assert.equal(supplyCartReward(10,14,'hard'),200);
 assert.equal(supplyCartReward(10,19,'hard'),400);
 assert.equal(supplyCartReward(10,24,'hard'),800);
 assert.equal(supplyCartReward(10,29,'hard'),1600);
 assert.equal(supplyCartReward(10,64,'hard'),204800);
 assert.equal(supplyCartReward(10,65,'hard'),0);
 assert.equal(isSupplyRound(10,65,'hard'),false);
 assert.equal(createRoundInvader(10,65,0,2,'hard',3).name===SUPPLY_CART_NAME,false);
});

test('supply cart has its own visible artwork and survives a mid-round save',()=>{
 const cart=createRoundInvader(1,9,0,1,'normal',3);
 const art=enemyPortraitFor(cart);
 assert.equal(art.src,'/portraits/enemies/supply-cart.png');
 assert.equal(art.standalone,true);
 assert.equal(existsSync(new URL(`../public${art.src}`,import.meta.url)),true);
 const save=makeGameSave({chapter:3,difficulty:'normal',stage:1,round:9,roster:[],enemies:[cart],gold:100,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:10000},1);
 assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 const legacyCart=createRoundInvader(1,5,0,2,'normal',3);
 const olderSave=makeGameSave({chapter:3,difficulty:'normal',stage:1,round:5,roster:[],enemies:[{...legacyCart,name:SUPPLY_CART_NAME,reward:100}],gold:100,wall:10,phase:'battle',spawned:1,speed:1,remainingMs:10000},1);
 assert.equal(readGameSave(JSON.stringify(olderSave)).enemies[0].reward,100);
});
