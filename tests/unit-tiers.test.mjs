import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMBINATION_TIERS,MAX_UNIT_TIER,STORABLE_UNIT_TIERS,UNIT_TIERS,hasHeroSkillTier,isFinalUnitTier,isStorableUnitTier,isUnitTier} from '../lib/unit-tiers.ts';

test('the shared unit-tier rules cover one through seven',()=>{
 assert.equal(MAX_UNIT_TIER,7);
 assert.deepEqual(UNIT_TIERS,[1,2,3,4,5,6,7]);
 assert.deepEqual(COMBINATION_TIERS,[2,3,4,5,6,7]);
 assert.deepEqual(STORABLE_UNIT_TIERS,[1,2,3,4,5,6]);
 for(const tier of UNIT_TIERS)assert.equal(isUnitTier(tier),true);
 assert.equal(isUnitTier(0),false);assert.equal(isUnitTier(8),false);
 assert.equal(isFinalUnitTier(7),true);assert.equal(isFinalUnitTier(5),false);
 assert.equal(isStorableUnitTier(6),true);assert.equal(isStorableUnitTier(7),false);
 assert.equal(hasHeroSkillTier(5),true);assert.equal(hasHeroSkillTier(7),true);
});

test('recipe and bag interfaces use the shared tier collections',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const bag=readFileSync(new URL('../app/UnitBag.tsx',import.meta.url),'utf8');
 assert.match(page,/COMBINATION_TIERS\.map/);
 assert.match(page,/const recipeCatalog:UnitDef\[\]=recipes/);
 assert.doesNotMatch(page,/plannedUpperTierUnits/);
 assert.match(bag,/STORABLE_UNIT_TIERS\.map/);
});
