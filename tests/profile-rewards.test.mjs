import test from 'node:test';
import assert from 'node:assert/strict';
import {awardHardClear,readPlayer} from '../lib/player.ts';
const profile={version:1,nickname:'홍길동',prologueComplete:true,avatar:'이순신'};
test('only full hard clear unlocks both cosmetics; duplicate awards preserve equipment choices',()=>{
 assert.equal(awardHardClear(profile,9),profile);
 const rewarded=awardHardClear(profile,10);
 assert.equal(rewarded.hardClearReward,true);
 assert.equal(rewarded.title,'salsu');assert.equal(rewarded.frame,'crimson');
 const unequipped={...rewarded,title:undefined,frame:undefined};
 assert.equal(awardHardClear(unequipped,10),unequipped);
 assert.deepEqual(readPlayer(JSON.stringify(rewarded)),rewarded);
 const restored=readPlayer(JSON.stringify(unequipped));
 assert.equal(restored.hardClearReward,true);assert.equal(restored.title,undefined);
 assert.equal(restored.frame,undefined);
});
test('old profiles remain valid and locked or unknown cosmetics are discarded',()=>{
 assert.deepEqual(readPlayer(JSON.stringify(profile)),profile);
 const locked=readPlayer(JSON.stringify({...profile,title:'salsu',frame:'crimson'}));
 assert.equal(locked.title,undefined);assert.equal(locked.frame,undefined);
 const unknown=readPlayer(JSON.stringify({...profile,hardClearReward:true,title:'other',frame:'other'}));
 assert.equal(unknown.title,undefined);assert.equal(unknown.frame,undefined);
});
