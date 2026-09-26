import test from 'node:test';
import assert from 'node:assert/strict';
import {nicknameError,normalizeNickname,readPlayer,spiritDialogue} from '../lib/player.ts';
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
  assert.deepEqual(readPlayer(JSON.stringify(profile)),profile);
 }
 for(const raw of [null,'bad','{}','{"version":1,"nickname":"홍길동","prologueComplete":"false"}'])assert.equal(readPlayer(raw),null);
});
