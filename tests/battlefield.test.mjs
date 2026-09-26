import test from 'node:test';
import assert from 'node:assert/strict';
import {pathAt} from '../lib/game.ts';
import {unitPosition} from '../lib/combat.ts';
import {ROAD_PATH} from '../lib/battlefield.ts';

test('enemies follow the outer lane while defenders stay inside the map',()=>{
 assert.ok(ROAD_PATH.includes('A8 8'));
 assert.deepEqual([0,.25,.5,.75].map(pathAt),[{x:13,y:5},{x:95,y:13},{x:87,y:95},{x:5,y:87}]);
 assert.deepEqual(pathAt(1),pathAt(0));
 for(let i=0;i<100;i++){const p=pathAt(i/100);assert.ok(p.x>=5&&p.x<=95&&p.y>=5&&p.y<=95);assert.ok(p.x<=13||p.x>=87||p.y<=13||p.y>=87);}
 for(let slot=0;slot<40;slot++){const p=unitPosition(slot);assert.ok(p.x>20&&p.x<80&&p.y>20&&p.y<80);}
});
