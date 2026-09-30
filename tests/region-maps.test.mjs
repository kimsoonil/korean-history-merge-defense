import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {regionMaps,regionPins,regionCanvasSize} from '../lib/region-maps.ts';

test('every implemented chapter has its own panoramic region map, Salsu is retained',()=>{
 assert.equal(regionMaps[1],'/terrain/campaign-panorama.png');
 assert.equal(new Set(Object.values(regionMaps)).size,10);
 for(const [chapter,path] of Object.entries(regionMaps)){
  if(chapter!=='1')assert.match(path,/^\/regions\//);
  const png=readFileSync(new URL('../public'+path,import.meta.url));
  assert.equal(png.toString('ascii',1,4),'PNG');
  assert.equal(png.readUInt32BE(16)/png.readUInt32BE(20),3);
 }
});
test('region canvas and markers retain native aspect ratio on all viewport heights',()=>{
 for(const height of [180,300,600,900,1400]){
  const size=regionCanvasSize(height);assert.equal(size.width/size.height,3);assert.equal(size.height,height);
 }
 assert.equal(regionPins.length,4);
 for(const point of regionPins)assert.ok(point.x>0&&point.x<100&&point.y>0&&point.y<100);
 const component=readFileSync(new URL('../app/StageMap.tsx',import.meta.url),'utf8');
 assert.match(component,/src=\{regionMaps\[chapter\]\}/);
 assert.match(component,/ResizeObserver/);
 const css=readFileSync(new URL('../app/region-map.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/background-size:100% 100%|width:1700px/);
});
