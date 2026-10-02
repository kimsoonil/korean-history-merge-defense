import test from 'node:test';
import assert from 'node:assert/strict';
import {nicknameError,normalizeNickname,readPlayer,spiritDialogue,profileAvatars,resolveProfileAvatar} from '../lib/player.ts';
test('profile image persists and invalid images fall back without losing progress',()=>{
 const profile={version:1,nickname:'새이름',prologueComplete:true,tutorialComplete:true,avatar:'세종대왕'};
 const restored=readPlayer(JSON.stringify(profile));
 assert.equal(restored.avatar,'세종대왕');assert.deepEqual(restored.unlockedAvatars,['시민','세종대왕']);
 const invalid=readPlayer(JSON.stringify({...profile,avatar:'../../unknown'}));
 assert.equal(invalid.avatar,undefined);assert.equal(invalid.tutorialComplete,true);
});
test('profile choices include every current unit and begin with the citizen',()=>{
 assert.equal(profileAvatars.length,56);
 assert.deepEqual([...new Set(profileAvatars.map(a=>a.tier))],[1,2,3,4,5,6,7]);
 assert.ok(profileAvatars.every(a=>a.src&&((a.standalone&&!a.x&&!a.y)||(!a.standalone&&a.x>=0&&a.y>=0))));
 assert.equal(resolveProfileAvatar('scholar').id,'시민');
 assert.equal(resolveProfileAvatar(undefined).id,'시민');
 for(const avatar of profileAvatars)assert.equal(resolveProfileAvatar(avatar.id),avatar);
});
test('nickname validates before insertion and normalizes Korean text',()=>{
 assert.equal(normalizeNickname(' 홍길동 '),'홍길동');
 assert.equal(nicknameError(' 홍길동 '),'');
 for(const name of ['','가','<script>','길 동','1234567890123','😀😀'])assert.ok(nicknameError(name));
 assert.equal(nicknameError('Hero_123'),'');
 assert.ok(spiritDialogue('홍길동').includes('홍길동, 들리느냐?'));
});
test('profile resumes unfinished prologue and preserves completion',()=>{
 for(const complete of [true,false]){
  const profile={version:1,nickname:'홍길동',prologueComplete:complete};
  assert.deepEqual(readPlayer(JSON.stringify(profile)),{...profile,level:1,xp:0,accountGold:0,research:{},recordTickets:0,heroRecords:{}});
 }
 for(const raw of [null,'bad','{}','{"version":1,"nickname":"홍길동","prologueComplete":"false"}'])assert.equal(readPlayer(raw),null);
});
