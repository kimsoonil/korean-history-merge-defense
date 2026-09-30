import test from 'node:test';
import assert from 'node:assert/strict';
import {ADMIN_CHAPTERS,ADMIN_COMPLETE_PROGRESS,ADMIN_NICKNAME,ADMIN_PROGRESS_KEYS,adminPlayerProfile,adminProgressValue,isAdminAccount} from '../lib/admin.ts';

test('only the configured signed-in email receives administrator access',()=>{
 assert.equal(isAdminAccount('Admin@Example.com ',' admin@example.com'),true);
 assert.equal(isAdminAccount('player@example.com','admin@example.com'),false);
 assert.equal(isAdminAccount('admin@example.com',undefined),false);
 assert.equal(isAdminAccount(null,'admin@example.com'),false);
});

test('administrator progress completes every normal and hard campaign',()=>{
 assert.equal(ADMIN_PROGRESS_KEYS.length,20);
 assert.equal(new Set(ADMIN_PROGRESS_KEYS).size,20);
 for(const name of ['salsu','ansi','hwangsan','nadang','gwiju','cheoin','hansando','haengju','myeongnyang','noryang']){
  assert.ok(ADMIN_PROGRESS_KEYS.includes(`${name}-campaign-v1`));
  assert.ok(ADMIN_PROGRESS_KEYS.includes(`${name}-hard-campaign-v1`));
 }
 assert.deepEqual(JSON.parse(adminProgressValue()),{version:1,highestClearedWave:ADMIN_COMPLETE_PROGRESS});
});

test('administrator profile always skips onboarding and uses the administrator name',()=>{
 const existing={version:1,nickname:'기존이름',prologueComplete:false,avatar:'세종대왕',hardClearReward:true,title:'salsu',frame:'crimson'};
 assert.deepEqual(adminPlayerProfile(existing),{...existing,nickname:ADMIN_NICKNAME,prologueComplete:true,tutorialComplete:true});
 assert.deepEqual(adminPlayerProfile(null),{version:1,nickname:'관리자',prologueComplete:true,tutorialComplete:true});
 assert.deepEqual(ADMIN_CHAPTERS,[1,2,3,4,5,6,7,8,9,10]);
});
