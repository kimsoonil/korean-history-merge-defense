import test from 'node:test';
import assert from 'node:assert/strict';
import {awardHardClear,awardStageProfile,HARD_CLEAR_REWARDS,PROFILE_REWARD_PLAN,profileAvatars,profileRewardTier,readPlayer,unlockedProfileIds} from '../lib/player.ts';
const profile={version:1,nickname:'홍길동',prologueComplete:true,avatar:'이순신'};
test('only full hard clear unlocks a title; duplicate awards preserve equipment choices',()=>{
 assert.equal(awardHardClear(profile,9),profile);
 const rewarded=awardHardClear(profile,3,10);
 assert.equal(rewarded.hardClearReward,true);
 assert.equal(rewarded.title,'hard-3');assert.equal(rewarded.frame,undefined);
 const unequipped={...rewarded,title:undefined};
 assert.equal(awardHardClear(unequipped,3,10),unequipped);
 const reread=readPlayer(JSON.stringify(rewarded));assert.equal(reread.hardClearReward,true);assert.equal(reread.avatar,'이순신');
 const restored=readPlayer(JSON.stringify(unequipped));
 assert.equal(restored.hardClearReward,true);assert.equal(restored.title,undefined);
 assert.equal(restored.frame,undefined);assert.equal(restored.unlockedFrames,undefined);
});
test('each story hard clear unlocks one selectable title',()=>{
 let current={version:1,nickname:'홍길동',prologueComplete:true};
 for(let chapter=1;chapter<=10;chapter++)current=awardHardClear(current,chapter,10);
 assert.equal(current.unlockedTitles.length,10);assert.equal(current.unlockedFrames,undefined);
 assert.deepEqual(new Set(current.unlockedTitles),new Set(Object.values(HARD_CLEAR_REWARDS).map(reward=>reward.id)));
});
test('old profiles remain valid and locked or unknown cosmetics are discarded',()=>{
 const restoredProfile=readPlayer(JSON.stringify(profile));assert.equal(restoredProfile.avatar,'이순신');
 const locked=readPlayer(JSON.stringify({...profile,title:'hard-3',frame:'hard-3'}));
 assert.equal(locked.title,undefined);assert.equal(locked.frame,undefined);
 const legacy=readPlayer(JSON.stringify({...profile,hardClearReward:true,title:'salsu',frame:'crimson'}));
 assert.equal(legacy.title,'hard-3');assert.equal(legacy.frame,undefined);assert.deepEqual(legacy.unlockedTitles,['hard-3']);assert.equal(legacy.unlockedFrames,undefined);
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

test('normal clear rewards are unique and high-stage clears award active tier six and seven profiles',()=>{
 let current={version:1,nickname:'홍길동',prologueComplete:true};
 for(const stage of [1,2,3,4,6,8,10]){const result=awardStageProfile(current,1,stage,()=>0);assert.ok(result.reward);assert.equal(result.reward.avatar.tier,1);current=result.profile;assert.equal(awardStageProfile(current,1,stage,()=>0).reward,null);}
 assert.equal(unlockedProfileIds(current).size,8);
 assert.equal(current.claimedProfileRewards.length,7);
 assert.equal(awardStageProfile(current,1,10,()=>0).reward,null);
 assert.equal(profileAvatars.some(avatar=>avatar.tier===6),true);
 assert.equal(profileAvatars.some(avatar=>avatar.tier===7),true);
 const six=awardStageProfile(current,7,10,()=>0);assert.equal(six.reward.avatar.tier,6);current=six.profile;
 const seven=awardStageProfile(current,9,6,()=>0);assert.equal(seven.reward.avatar.tier,7);
});
