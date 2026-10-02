import test from 'node:test';
import assert from 'node:assert/strict';
import {battleQuests,claimQuest,emptyQuestProgress,readQuestProgress,recordCombinedTier,recordGoldQuest,recordUnitQuest} from '../lib/quests.ts';
import {emptyUpgrades} from '../lib/upgrades.ts';

test('battle quests reset to an empty state for every new battle',()=>{
 assert.deepEqual(emptyQuestProgress(),{basicUnitsPeak:0,goldGambles:0,unitGambleWins:0,gambleFailures:0,earlyTier4:false,earlyTier6:false,tier7Combined:false,claimed:[]});
 assert.deepEqual(readQuestProgress(null),emptyQuestProgress());
});
test('collecting seven basic units completes the citizen quest',()=>{
 const roster=Array.from({length:5},(_,i)=>({id:i+1,name:'창병',slot:i})),bag={활병:2,시민:10};
 const quest=battleQuests(emptyQuestProgress(),roster,bag,emptyUpgrades()).find(item=>item.id==='basic-7');
 assert.equal(quest.complete,true);assert.deepEqual(quest.reward,{gold:0,troopCards:1,citizens:1});
 const claimed=claimQuest(emptyQuestProgress(),quest);assert.ok(claimed.progress.claimed.includes('basic-7'));
});
test('combination deadlines, gambling counters and tier upgrades drive quests',()=>{
 let progress=recordCombinedTier(emptyQuestProgress(),4,9);progress=recordCombinedTier(progress,6,29);progress=recordCombinedTier(progress,7,60);
 for(let i=0;i<10;i++)progress=recordGoldQuest(progress,i<4);
 for(let i=0;i<10;i++)progress=recordUnitQuest(progress,true);
 const upgrades=emptyUpgrades();upgrades.tier['3']=20;
 const quests=battleQuests(progress,[],{},upgrades);
 for(const id of ['tier4-before-10','tier6-before-30','tier7-combine','gold-gamble-10','unit-gamble-10','tier-upgrade-3'])assert.equal(quests.find(q=>q.id===id).complete,true,id);
 assert.deepEqual(quests.find(q=>q.id==='tier-upgrade-3').reward,{gold:3000,troopCards:3,citizens:0});
 assert.equal(quests.find(q=>q.id==='gamble-fail-10').progress,4);
});
