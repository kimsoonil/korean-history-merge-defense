import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {battleQuests,emptyQuestProgress} from '../lib/quests.ts';
import {emptyUpgrades} from '../lib/upgrades.ts';

test('gold gambling is no longer offered or wired into the battle screen',()=>{
 const dialog=readFileSync(new URL('../app/GamblingDialog.tsx',import.meta.url),'utf8');
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(dialog,/골드 도박|goldGambles|onGold/);
 assert.doesNotMatch(page,/gambleGold|playGoldGamble|onGold=/);
 assert.match(dialog,/유닛 도박/);
 const quests=battleQuests(emptyQuestProgress(),[],{},emptyUpgrades());
 assert.equal(quests.some(quest=>quest.id==='gold-gamble-10'),false);
 assert.equal(quests.find(quest=>quest.id==='unit-gamble-20')?.title,'유닛 도박 20회 이용');
});
