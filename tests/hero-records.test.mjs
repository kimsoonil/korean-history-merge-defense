import test from 'node:test';
import assert from 'node:assert/strict';
import {drawHeroRecord,heroRecordAttackPercent,normalizeHeroRecords,shardsForNextStar} from '../lib/hero-records.ts';

test('legacy and malformed hero records normalize safely',()=>{
 assert.deepEqual(normalizeHeroRecords(undefined),{});
 assert.deepEqual(normalizeHeroRecords({서희:{stars:3,shards:2},시민:{stars:7,shards:0},없는영웅:{stars:2,shards:0}}),{서희:{stars:3,shards:2}});
});

test('tickets draw only available heroes and duplicates raise stars progressively',()=>{
 let records={};
 for(let i=0;i<3;i++){
  const result=drawHeroRecord(records,['시민','서희'],()=>0);
  assert.equal(result?.unit?.name,'서희');
  records=result.records;
 }
 assert.deepEqual(records.서희,{stars:2,shards:0});
 assert.equal(shardsForNextStar(2),3);
 assert.equal(heroRecordAttackPercent(records,'서희'),1);
 assert.equal(heroRecordAttackPercent(records,'온달'),0);
});

test('maximum stars are capped and exhausted pools do not consume a draw',()=>{
 const records={서희:{stars:7,shards:0}};
 const result=drawHeroRecord(records,['서희'],()=>0);
 assert.equal(result?.allMaxed,true);
 assert.equal(result?.unit,null);
 assert.equal(heroRecordAttackPercent(records,'서희'),3.5);
});
