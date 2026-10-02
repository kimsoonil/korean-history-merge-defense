import test from 'node:test';
import assert from 'node:assert/strict';
import {battleQuests,claimQuest,emptyQuestProgress,readQuestProgress,recordBasicTypesPeak,recordCombinedTier,recordRoleFormation,recordSupplyCartDefeated,recordUnitQuest} from '../lib/quests.ts';
import {emptyUpgrades} from '../lib/upgrades.ts';

test('battle quests reset to an empty state for every new battle',()=>{
 assert.deepEqual(emptyQuestProgress(),{basicTypesPeak:0,supplyCartsDefeated:0,roleFormationAchieved:false,goldGambles:0,unitGambleWins:0,gambleFailures:0,earlyTier4:false,earlyTier6:false,tier7Combined:false,claimed:[]});
 assert.deepEqual(readQuestProgress(null),emptyQuestProgress());
});
test('supply cart quest counts unique recorded kills and survives a save',()=>{
 let progress=emptyQuestProgress();
 assert.equal(battleQuests(progress,[],{},emptyUpgrades()).find(q=>q.id==='supply-cart-2').complete,false);
 progress=recordSupplyCartDefeated(recordSupplyCartDefeated(progress));
 progress=readQuestProgress(JSON.parse(JSON.stringify(progress)));
 const quest=battleQuests(progress,[],{},emptyUpgrades()).find(q=>q.id==='supply-cart-2');
 assert.equal(quest.complete,true);assert.deepEqual(quest.reward,{gold:0,troopCards:1,citizens:0});
 const legacy={...progress};delete legacy.supplyCartsDefeated;delete legacy.roleFormationAchieved;
 assert.equal(readQuestProgress(legacy).supplyCartsDefeated,0);
});
test('role formation needs debuff, support and damage units on the field together',()=>{
 const units=['서희','허준','온달'].map((name,id)=>({id,name,slot:id}));
 const initial=emptyQuestProgress();
 assert.equal(recordRoleFormation(initial,units.slice(0,2)).roleFormationAchieved,false);
 const progress=recordRoleFormation(initial,units);
 assert.equal(progress.roleFormationAchieved,true);
 assert.equal(recordRoleFormation(progress,[]),progress);
 const quest=battleQuests(progress,[],{},emptyUpgrades()).find(q=>q.id==='role-formation');
 assert.equal(quest.complete,true);assert.deepEqual(quest.reward,{gold:0,troopCards:0,citizens:1});
});
test('the citizen quest requires seven distinct non-citizen Lv 1 types at once',()=>{
 const roster=Array.from({length:7},(_,i)=>({id:i+1,name:'창병',slot:i}));
 const incomplete=battleQuests(emptyQuestProgress(),roster,{활병:2,시민:10},emptyUpgrades()).find(item=>item.id==='basic-7');
 assert.equal(incomplete.complete,false);assert.equal(incomplete.progress,2);
 const basics=['창병','활병','수병','포수','의병','기병','유생'];
 const field=basics.slice(0,4).map((name,i)=>({id:i+1,name,slot:i})),bag={포수:2,의병:1,기병:1,유생:1,시민:10};
 const progress=recordBasicTypesPeak(emptyQuestProgress(),field,bag);
 const quest=battleQuests(progress,field,bag,emptyUpgrades()).find(item=>item.id==='basic-7');
 assert.equal(quest.complete,true);assert.equal(quest.progress,7);assert.deepEqual(quest.reward,{gold:0,troopCards:1,citizens:1});
 assert.equal(battleQuests(progress,[],{},emptyUpgrades()).find(item=>item.id==='basic-7').complete,true);
 const claimed=claimQuest(progress,quest);assert.ok(claimed.progress.claimed.includes('basic-7'));
 const legacy=readQuestProgress({...emptyQuestProgress(),basicTypesPeak:undefined,basicUnitsPeak:7});
 assert.equal(legacy.basicTypesPeak,0);assert.equal(battleQuests(legacy,[],{},emptyUpgrades()).find(item=>item.id==='basic-7').complete,false);
 const previouslyClaimed=readQuestProgress({...legacy,claimed:['basic-7']});
 assert.equal(battleQuests(previouslyClaimed,[],{},emptyUpgrades()).find(item=>item.id==='basic-7').claimed,true);
});
test('combination deadlines, gambling counters and tier upgrades drive quests',()=>{
 let progress=recordCombinedTier(emptyQuestProgress(),4,9);progress=recordCombinedTier(progress,6,29);progress=recordCombinedTier(progress,7,60);
 for(let i=0;i<10;i++)progress=recordUnitQuest(progress,true);
 for(let i=0;i<4;i++)progress=recordUnitQuest(progress,false);
 const upgrades=emptyUpgrades();upgrades.tier['3']=20;
 const quests=battleQuests(progress,[],{},upgrades);
 for(const id of ['tier4-before-10','tier6-before-30','tier7-combine','unit-gamble-10','tier-upgrade-3'])assert.equal(quests.find(q=>q.id===id).complete,true,id);
 assert.equal(quests.some(q=>q.id==='gold-gamble-10'),false);
 assert.deepEqual(quests.find(q=>q.id==='tier-upgrade-3').reward,{gold:3000,troopCards:3,citizens:0});
 assert.equal(quests.find(q=>q.id==='gamble-fail-10').progress,4);
});
