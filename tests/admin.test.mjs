import test from 'node:test';
import assert from 'node:assert/strict';
import {ADMIN_CHAPTERS,ADMIN_COMPLETE_PROGRESS,ADMIN_NICKNAME,ADMIN_PROGRESS_KEYS,adminPlayerProfile,adminProgressValue,isAdminAccount} from '../lib/admin.ts';
import {HARD_CLEAR_REWARDS} from '../lib/player.ts';

test('only the configured signed-in email receives administrator access',()=>{
 assert.equal(isAdminAccount('Admin@Example.com ',' admin@example.com'),true);
 assert.equal(isAdminAccount('player@example.com','admin@example.com'),false);
 assert.equal(isAdminAccount('admin@example.com',undefined),false);
 assert.equal(isAdminAccount(null,'admin@example.com'),false);
});

test('administrator progress completes every normal and hard campaign',()=>{
 assert.equal(ADMIN_PROGRESS_KEYS.length,20);
 assert.equal(new Set(ADMIN_PROGRESS_KEYS).size,20);
 for(const name of ['pyongyang','goguryeo-conquests','salsu','ansi','hwangsan','nadang','cheonmunryeong','goryeo-khitan','cheoin','imjin-war']){
  assert.ok(ADMIN_PROGRESS_KEYS.includes(`${name}-campaign-v1`));
  assert.ok(ADMIN_PROGRESS_KEYS.includes(`${name}-hard-campaign-v1`));
 }
 assert.deepEqual(JSON.parse(adminProgressValue()),{version:1,highestClearedWave:ADMIN_COMPLETE_PROGRESS});
});

test('administrator profile always skips onboarding and owns every hard title',()=>{
 const existing={version:1,nickname:'기존이름',prologueComplete:false,avatar:'세종대왕',unlockedTitles:['hard-3'],unlockedFrames:['hard-3']};
 const updated=adminPlayerProfile(existing),fresh=adminPlayerProfile(null);
 const everyReward=Object.values(HARD_CLEAR_REWARDS).map(reward=>reward.id);
 assert.equal(updated.nickname,ADMIN_NICKNAME);assert.equal(updated.prologueComplete,true);assert.equal(updated.tutorialComplete,true);
 assert.equal(updated.unlockedAvatars.length,56);assert.equal(updated.claimedProfileRewards.length,55);
 assert.equal(updated.unlockedTitles.length,10);assert.equal(updated.unlockedFrames,undefined);assert.equal(updated.frame,undefined);
 assert.deepEqual(updated.unlockedTitles,everyReward);
 assert.deepEqual(fresh.unlockedTitles,everyReward);assert.equal(fresh.unlockedFrames,undefined);
 assert.equal(fresh.nickname,'관리자');assert.equal(fresh.prologueComplete,true);assert.equal(fresh.tutorialComplete,true);assert.equal(fresh.unlockedAvatars.length,56);assert.equal(fresh.claimedProfileRewards.length,55);
 assert.deepEqual(ADMIN_CHAPTERS,[1,2,3,4,5,6,7,8,9,10]);
});
