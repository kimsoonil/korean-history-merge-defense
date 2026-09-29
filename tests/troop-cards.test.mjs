import test from 'node:test';
import assert from 'node:assert/strict';
import {START_TROOP_CARDS,ROUND_TROOP_CARDS,BOSS_TROOP_CARDS,RECRUIT_TROOP_COST,bossUnitRewardTier,randomName} from '../lib/troop-cards.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {createRoundInvader} from '../lib/game.ts';

test('troop card economy uses the requested starting, round and boss amounts',()=>{
 assert.equal(START_TROOP_CARDS,4);
 assert.equal(ROUND_TROOP_CARDS,3);
 assert.equal(BOSS_TROOP_CARDS,3);
 assert.equal(RECRUIT_TROOP_COST,1);
});

test('boss unit rewards step through tiers two, three and four',()=>{
 assert.deepEqual([10,20,30,40,50,60,65].map(bossUnitRewardTier),[2,2,3,3,4,4,null]);
 assert.equal(createRoundInvader(10,10,0,1).originRound,10);
});

test('randomName includes both selection bounds',()=>{
 assert.equal(randomName(['A','B'],()=>0),'A');
 assert.equal(randomName(['A','B'],()=>1),'B');
 assert.equal(randomName([],()=>0),null);
});

test('troop cards survive save and resume while older saves remain valid',()=>{
 const save=makeGameSave({chapter:1,difficulty:'normal',bannedHeroes:[],roster:[],bag:{},enemies:[],gold:400,troopCards:17,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000},1);
 assert.equal(readGameSave(JSON.stringify(save))?.troopCards,17);
 const legacy={...save};delete legacy.troopCards;
 assert.equal(readGameSave(JSON.stringify(legacy))?.troopCards,undefined);
});
