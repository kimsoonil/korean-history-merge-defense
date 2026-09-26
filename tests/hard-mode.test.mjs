import test from 'node:test';
import assert from 'node:assert/strict';
import {drawBannedHeroes,validBannedHeroes} from '../lib/hard-mode.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
import {createRoundInvader} from '../lib/game.ts';
import {isWaveUnlocked,recordWaveClear} from '../lib/campaign.ts';
test('hard bans three distinct top-tier heroes, never Eulji',()=>{
 for(let i=0;i<100;i++){
  const banned=drawBannedHeroes();
  assert.equal(validBannedHeroes(banned),true);
  assert.equal(banned.includes('을지문덕'),false);
 }
 assert.equal(validBannedHeroes(['이순신','이순신','정조']),false);
 assert.equal(validBannedHeroes(['이순신','창병','정조']),false);
});
test('save preserves difficulty and bans without rerolling; old saves remain normal',()=>{
 const progress={roster:[],enemies:[],gold:400,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000};
 const banned=drawBannedHeroes(()=>.5);
 const saved=makeGameSave({...progress,difficulty:'hard',bannedHeroes:banned});
 const restored=readGameSave(JSON.stringify(saved));
 assert.equal(restored.difficulty,'hard');assert.deepEqual(restored.bannedHeroes,banned);
 assert.ok(readGameSave(JSON.stringify(makeGameSave(progress))));
 assert.equal(readGameSave(JSON.stringify({...saved,bannedHeroes:['을지문덕','이순신','정조']})),null);
 assert.equal(readGameSave(JSON.stringify({...saved,difficulty:'normal'})),null);
});
test('hard uses the same enemy speeds and boss schedule with its own sequential progress',()=>{
 for(const round of [1,10,20,25,40,60,65]){
  const normal=createRoundInvader(10,round,0,1,'normal'),hard=createRoundInvader(10,round,0,1,'hard');
  assert.equal(normal.speed,hard.speed);assert.equal(normal.name,hard.name);assert.equal(normal.boss,hard.boss);
 }
 let hardProgress=0;
 assert.equal(isWaveUnlocked(1,hardProgress),true);assert.equal(isWaveUnlocked(2,hardProgress),false);
 hardProgress=recordWaveClear(hardProgress,1);assert.equal(isWaveUnlocked(2,hardProgress),true);
 assert.equal(isWaveUnlocked(3,hardProgress),false);
});
