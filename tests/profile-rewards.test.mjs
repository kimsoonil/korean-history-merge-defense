import test from 'node:test';
import assert from 'node:assert/strict';
import {awardHardClear,awardStageProfile,PROFILE_REWARD_PLAN,profileAvatars,profileRewardTier,readPlayer,unlockedProfileIds} from '../lib/player.ts';
const profile={version:1,nickname:'홍길동',prologueComplete:true,avatar:'이순신'};
test('only full hard clear unlocks both cosmetics; duplicate awards preserve equipment choices',()=>{
 assert.equal(awardHardClear(profile,9),profile);
 const rewarded=awardHardClear(profile,10);
 assert.equal(rewarded.hardClearReward,true);
 assert.equal(rewarded.title,'salsu');assert.equal(rewarded.frame,'crimson');
 const unequipped={...rewarded,title:undefined,frame:undefined};
 assert.equal(awardHardClear(unequipped,10),unequipped);
 const reread=readPlayer(JSON.stringify(rewarded));assert.equal(reread.hardClearReward,true);assert.equal(reread.avatar,'이순신');
 const restored=readPlayer(JSON.stringify(unequipped));
 assert.equal(restored.hardClearReward,true);assert.equal(restored.title,undefined);
 assert.equal(restored.frame,undefined);
});
test('old profiles remain valid and locked or unknown cosmetics are discarded',()=>{
 const restoredProfile=readPlayer(JSON.stringify(profile));assert.equal(restoredProfile.avatar,'이순신');
 const locked=readPlayer(JSON.stringify({...profile,title:'salsu',frame:'crimson'}));
 assert.equal(locked.title,undefined);assert.equal(locked.frame,undefined);
 const unknown=readPlayer(JSON.stringify({...profile,hardClearReward:true,title:'other',frame:'other'}));
 assert.equal(unknown.title,undefined);assert.equal(unknown.frame,undefined);
});

test('the campaign plans exactly 55 increasingly valuable profile rewards',()=>{
 const rewards=[];
 for(let chapter=1;chapter<=10;chapter++)for(const [stage,tier] of Object.entries(PROFILE_REWARD_PLAN[chapter]))rewards.push({chapter,stage:Number(stage),tier});
 assert.equal(rewards.length,55);
 assert.deepEqual(Object.fromEntries([1,2,3,4,5,6,7].map(tier=>[tier,rewards.filter(reward=>reward.tier===tier).length])),{1:7,2:8,3:8,4:8,5:8,6:8,7:8});
 assert.equal(profileRewardTier(1,1),1);assert.equal(profileRewardTier(10,10),7);assert.equal(profileRewardTier(5,1),null);
 for(let index=1;index<rewards.length;index++)assert.ok(rewards[index].tier>=rewards[index-1].tier);
});

test('normal clear rewards are unique, while unavailable tier six and seven wait for future units',()=>{
 let current={version:1,nickname:'홍길동',prologueComplete:true};
 for(const stage of [1,2,3,4,6,8,10]){const result=awardStageProfile(current,1,stage,()=>0);assert.ok(result.reward);assert.equal(result.reward.avatar.tier,1);current=result.profile;assert.equal(awardStageProfile(current,1,stage,()=>0).reward,null);}
 assert.equal(unlockedProfileIds(current).size,8);
 assert.equal(current.claimedProfileRewards.length,7);
 assert.equal(awardStageProfile(current,1,10,()=>0).reward,null);
 assert.equal(profileAvatars.some(avatar=>avatar.tier===6||avatar.tier===7),false);
 assert.equal(awardStageProfile(current,7,10,()=>0).reward,null);
 assert.equal(awardStageProfile(current,9,6,()=>0).reward,null);
});
