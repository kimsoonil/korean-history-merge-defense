import test from 'node:test';
import assert from 'node:assert/strict';
import {units} from '../lib/game.ts';
import {salePrice} from '../lib/selling.ts';
import {MAX_UNIT_TIER} from '../lib/unit-tiers.ts';

test('tiers below seven use their configured price and only the final tier is protected',()=>{
 const prices={1:35,2:100,3:300,4:900,5:2700,6:8100,7:null};
 for(const unit of units)assert.equal(salePrice(unit),prices[unit.tier],unit.name);
 assert.equal(salePrice({...units[0],name:'6단계 테스트',tier:6}),8100);
 assert.equal(salePrice({...units[0],name:'7단계 테스트',tier:MAX_UNIT_TIER}),null);
 assert.equal(salePrice(null),null);
 assert.equal(salePrice(undefined),null);
});
