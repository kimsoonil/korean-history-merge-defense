import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {battleFronts,frontForStage,campaignNodes,chapterOneBattles,FINAL_WAVE,MAP_WIDTH,MAP_HEIGHT,horizontalWheelDelta,isWaveUnlocked,nextUnlockedWave,readCampaignProgress,recordWaveClear,waveEnemyCount} from '../lib/campaign.ts';
import {createInvader} from '../lib/game.ts';

test('all battle fronts have full-map illustrations without an SVG road overlay',()=>{
 for(let stage=1;stage<=10;stage++){
  const id=frontForStage(stage).id;
  assert.ok(existsSync(new URL(`../public/terrain/front-${id}-exterior.png`,import.meta.url)));
 }
 const component=readFileSync(new URL('../app/BattleTerrain.tsx',import.meta.url),'utf8');
 assert.match(component,/integrated-terrain/);assert.doesNotMatch(component,/<BattleRoad/);
 assert.match(component,/front-\$\{front.id\}-exterior.png/);
});

test('historical campaign names follow chronology and retain distinct battle terrain',()=>{
 assert.deepEqual(campaignNodes.map(node=>node.name),['살수대첩','안시성 전투','황산벌 전투','나당전쟁','귀주대첩','처인성 전투','한산도대첩','행주대첩','명량대첩','노량해전']);
 assert.deepEqual(campaignNodes.map(node=>node.terrain),['river','mountain','plain','coast','plain','hill','sea','hill','strait','strait']);
 assert.equal(campaignNodes[3].year,'670~676년');
 assert.equal(campaignNodes[9].year,'1598년');
 for(const node of campaignNodes)assert.ok(node.year&&node.setting&&node.description);
});

test('ten map points span a horizontal route, with only the first chapter implemented',()=>{
 assert.equal(campaignNodes.length,10);
 assert.deepEqual(campaignNodes.map(node=>node.id),[1,2,3,4,5,6,7,8,9,10]);
 assert.deepEqual(campaignNodes.filter(node=>node.available).map(node=>node.id),[1]);
 assert.ok(campaignNodes[9].x-campaignNodes[0].x>2400);
 for(const node of campaignNodes)assert.ok(node.x>0&&node.x<MAP_WIDTH&&node.y>0&&node.y<MAP_HEIGHT);
});
test('ten stages select four distinct fronts',()=>{
 assert.equal(FINAL_WAVE,10);
 assert.deepEqual(chapterOneBattles.map(b=>b.name),['요동성','요동성','요동성','평양성','평양성','평양성','살수','살수','살수','수양제 최종전']);
 assert.equal(new Set(battleFronts.map(f=>f.image)).size,4);
 for(let stage=1;stage<=10;stage++)assert.ok(frontForStage(stage).image);
 assert.equal(createInvader(10,0,1).name,'수양제');
});
test('only the first battle is initially open; clears unlock exactly the next battle',()=>{
 let progress=0;
 assert.equal(isWaveUnlocked(1,progress),true);assert.equal(isWaveUnlocked(2,progress),false);
 assert.equal(recordWaveClear(0,8),0);
 for(let stage=1;stage<=10;stage++){
  assert.equal(isWaveUnlocked(stage,progress),true);
  assert.equal(isWaveUnlocked(stage+1,progress),false);
  progress=recordWaveClear(progress,stage);
  assert.equal(progress,stage);assert.equal(recordWaveClear(progress,stage),stage);
 }
 assert.equal(nextUnlockedWave(progress),10);assert.equal(isWaveUnlocked(11,progress),false);
 assert.equal(recordWaveClear(8,1),8);
 for(const wave of [0,11,1.5,NaN])assert.equal(isWaveUnlocked(wave,8),false);
});
test('campaign progress persists independently of new-game saves and rejects corrupt records',()=>{
 assert.equal(readCampaignProgress(JSON.stringify({version:1,highestClearedWave:5})),5);
 for(const raw of [null,'broken','{}','{"version":2,"highestClearedWave":5}','{"version":1,"highestClearedWave":11}','{"version":1,"highestClearedWave":-1}','{"version":1,"highestClearedWave":"8"}'])assert.equal(readCampaignProgress(raw),0);
});
test('vertical mouse wheels and horizontal trackpads both move the map horizontally',()=>{
 assert.equal(horizontalWheelDelta(0,120,0,900),120);
 assert.equal(horizontalWheelDelta(-80,5,0,900),-80);
 assert.equal(horizontalWheelDelta(0,3,1,900),48);
 assert.equal(horizontalWheelDelta(0,-1,2,900),-900);
 assert.equal(horizontalWheelDelta(0,0,0,900),0);
});
