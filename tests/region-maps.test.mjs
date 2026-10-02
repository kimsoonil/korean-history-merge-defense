import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {regionMaps,regionPins,regionCanvasSize} from '../lib/region-maps.ts';

function jpegSize(bytes){
 assert.equal(bytes.readUInt16BE(0),0xffd8);
 for(let offset=2;offset<bytes.length-9;offset++)
  if(bytes[offset]===0xff&&[0xc0,0xc1,0xc2,0xc3].includes(bytes[offset+1]))
   return {height:bytes.readUInt16BE(offset+5),width:bytes.readUInt16BE(offset+7)};
 throw new Error('JPEG dimensions not found');
}
function imageSize(bytes){
 if(bytes.toString('ascii',1,4)==='PNG')return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
 return jpegSize(bytes);
}

test('every implemented chapter has its own historical region image',()=>{
 assert.equal(regionMaps[1],'/regions/pyongyang-v2.jpg');
 assert.equal(regionMaps[10],'/regions/imjin-four-victories-v3.jpg');
 assert.equal(new Set(Object.values(regionMaps)).size,10);
 for(const [chapter,path] of Object.entries(regionMaps)){
  assert.match(path,/^\/(?:regions|terrain)\//);
  const {width,height}=imageSize(readFileSync(new URL('../public'+path,import.meta.url)));
  assert.equal(width/height,3,`chapter ${chapter} map must be a native 3:1 panorama`);
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
 assert.match(css,/background-size:cover/);
 assert.doesNotMatch(css,/background-size:100% 100%|width:1700px/);
});
