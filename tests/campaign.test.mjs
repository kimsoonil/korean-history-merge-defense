import assert from 'node:assert/strict';
import test from 'node:test';
import {campaignNodes,chapterOneBattles,FINAL_WAVE,MAP_WIDTH,MAP_HEIGHT,horizontalWheelDelta,isWaveUnlocked,nextUnlockedWave,readCampaignProgress,recordWaveClear,waveEnemyCount} from '../lib/campaign.ts';
import {createInvader} from '../lib/game.ts';

test('historical campaign names follow chronology and retain distinct battle terrain',()=>{
 assert.deepEqual(campaignNodes.map(node=>node.name),['살수대첩','안시성 전투','황산벌 전투','나당전쟁','귀주대첩','처인성 전투','한산도대첩','행주대첩','명량대첩','남한산성 공성전']);
 assert.deepEqual(campaignNodes.map(node=>node.terrain),['river','mountain','plain','coast','plain','hill','sea','hill','strait','mountain']);
 assert.equal(campaignNodes[3].year,'670~676년');
 assert.equal(campaignNodes[9].year,'1636~1637년');
 for(const node of campaignNodes)assert.ok(node.year&&node.setting&&node.description);
});

test('ten map points span a horizontal route, with only the first chapter implemented',()=>{
 assert.equal(campaignNodes.length,10);
 assert.deepEqual(campaignNodes.map(node=>node.id),[1,2,3,4,5,6,7,8,9,10]);
 assert.deepEqual(campaignNodes.filter(node=>node.available).map(node=>node.id),[1]);
 assert.ok(campaignNodes[9].x-campaignNodes[0].x>2400);
 for(const node of campaignNodes)assert.ok(node.x>0&&node.x<MAP_WIDTH&&node.y>0&&node.y<MAP_HEIGHT);
});
test('chapter one lists seven Sui invasions and Salsu as 1-8',()=>{
 assert.equal(FINAL_WAVE,8);assert.equal(chapterOneBattles.length,8);
 for(let i=0;i<7;i++){assert.equal(chapterOneBattles[i].name,'수나라의 침공');assert.equal(chapterOneBattles[i].code,`1-${i+1}`);assert.equal(chapterOneBattles[i].boss,false);}
 assert.deepEqual(chapterOneBattles[7],{wave:8,code:'1-8',name:'살수대첩',boss:true});
 assert.equal(waveEnemyCount(8),23);assert.equal(createInvader(8,0,1).name,'수양제');assert.equal(createInvader(8,0,1).hp,4890);
 for(let stage=1;stage<8;stage++)assert.equal(createInvader(stage,0,stage).boss,false);
});
test('only the first battle is initially open; clears unlock exactly the next battle',()=>{
 let progress=0;
 assert.equal(isWaveUnlocked(1,progress),true);assert.equal(isWaveUnlocked(2,progress),false);
 assert.equal(recordWaveClear(0,8),0);
 for(let stage=1;stage<=8;stage++){
  assert.equal(isWaveUnlocked(stage,progress),true);
  assert.equal(isWaveUnlocked(stage+1,progress),false);
  progress=recordWaveClear(progress,stage);
  assert.equal(progress,stage);assert.equal(recordWaveClear(progress,stage),stage);
 }
 assert.equal(nextUnlockedWave(progress),8);assert.equal(isWaveUnlocked(9,progress),false);
 assert.equal(recordWaveClear(8,1),8);
 for(const wave of [0,9,1.5,NaN])assert.equal(isWaveUnlocked(wave,8),false);
});
test('campaign progress persists independently of new-game saves and rejects corrupt records',()=>{
 assert.equal(readCampaignProgress(JSON.stringify({version:1,highestClearedWave:5})),5);
 for(const raw of [null,'broken','{}','{"version":2,"highestClearedWave":5}','{"version":1,"highestClearedWave":9}','{"version":1,"highestClearedWave":-1}','{"version":1,"highestClearedWave":"8"}'])assert.equal(readCampaignProgress(raw),0);
});
test('vertical mouse wheels and horizontal trackpads both move the map horizontally',()=>{
 assert.equal(horizontalWheelDelta(0,120,0,900),120);
 assert.equal(horizontalWheelDelta(-80,5,0,900),-80);
 assert.equal(horizontalWheelDelta(0,3,1,900),48);
 assert.equal(horizontalWheelDelta(0,-1,2,900),-900);
 assert.equal(horizontalWheelDelta(0,0,0,900),0);
});
