import test from 'node:test';
import assert from 'node:assert/strict';
import {START_TROOP_CARDS,ROUND_TROOP_CARDS,BOSS_TROOP_CARDS,RECRUIT_TROOP_COST,bossCitizenRewardCount,bossUnitRewardTier,randomName} from '../lib/troop-cards.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {basics,byName,createRoundInvader} from '../lib/game.ts';
import {bossRounds} from '../lib/round-config.ts';

test('troop card economy uses the requested starting, round and boss amounts',()=>{
 assert.equal(START_TROOP_CARDS,4);
 assert.equal(ROUND_TROOP_CARDS,3);
 assert.equal(BOSS_TROOP_CARDS,3);
 assert.equal(RECRUIT_TROOP_COST,1);
});

test('boss unit and citizen rewards advance every five rounds',()=>{
 const rounds=[10,15,20,25,30,35,40,45,50,55,60,65];
 assert.deepEqual(rounds.map(bossUnitRewardTier),[2,2,3,3,3,4,4,4,5,5,5,null]);
 assert.deepEqual(rounds.map(bossCitizenRewardCount),[1,1,1,1,2,2,2,2,3,3,3,0]);
 assert.equal(bossUnitRewardTier(14),2);
 assert.equal(bossUnitRewardTier(21),3);
 assert.equal(bossUnitRewardTier(36),4);
 assert.equal(bossCitizenRewardCount(21),1);
 assert.equal(createRoundInvader(10,10,0,1).originRound,10);
 assert.equal(bossRounds(10,'hard').includes(15),true);
 assert.equal(bossRounds(1,'normal').includes(15),true);
 assert.equal(bossRounds(2,'normal').includes(15),false);
});

test('citizen is a zero-attack tier-one reward outside the recruit pool',()=>{
 assert.equal(byName.시민.tier,1);assert.equal(byName.시민.damage,0);
 assert.equal(basics.some(unit=>unit.name==='시민'),false);
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
