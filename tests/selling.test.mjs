import test from 'node:test';
import assert from 'node:assert/strict';
import {units} from '../lib/game.ts';
import {salePrice} from '../lib/selling.ts';

test('every unit uses its tier price and every top-tier hero is protected',()=>{
 const prices={1:35,2:100,3:300,4:900,5:null};
 for(const unit of units)assert.equal(salePrice(unit),prices[unit.tier],unit.name);
 assert.equal(salePrice(null),null);
 assert.equal(salePrice(undefined),null);
});
