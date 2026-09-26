import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import test from 'node:test';
import {createInvader,enemyNames,enemyPortraits,units} from '../lib/game.ts';
import {findLegendaryScene,legendaryScenes,resumeStageDeadline} from '../lib/legendary.ts';

test('every tier-five hero has exactly one cinematic and all background assets exist',()=>{
  const heroes=units.filter(unit=>unit.tier===5);
  assert.equal(legendaryScenes.length,heroes.length);
  assert.equal(new Set(legendaryScenes.map(scene=>scene.slug)).size,heroes.length);
  for(const hero of heroes){
    const scene=findLegendaryScene(hero.name);
    assert.ok(scene,`${hero.name} has no cinematic`);
    assert.ok(existsSync(new URL(`../public/cinematics/${scene.slug}.png`,import.meta.url)),`${hero.name} background missing`);
    assert.ok(scene.quote.length>10);
  }
  for(const hero of units.filter(unit=>unit.tier<5))assert.equal(findLegendaryScene(hero.name),undefined);
});

test('legendary cinematics preserve remaining stage time, even in overtime',()=>{
  assert.equal(resumeStageDeadline(null,10000,15000),null);
  const resumed=resumeStageDeadline(30000,10000,18500);
  assert.equal(resumed-18500,30000-10000);
  assert.equal(resumeStageDeadline(9000,10000,15000)-15000,-1000);
  assert.equal(resumeStageDeadline(30000,10000,9000),30000);
});

test('the final-stage boss arrives first and has ten times the strongest regular invader HP',()=>{
  const boss=createInvader(10,0,1);
  const regular=Array.from({length:22},(_,index)=>createInvader(10,index+1,index+2));
  assert.equal(boss.name,'수양제');
  assert.equal(boss.boss,true);
  assert.equal(regular.some(enemy=>enemy.boss),false);
  assert.equal(boss.hp,Math.max(...regular.map(enemy=>enemy.hp))*10);
});

test('earlier stages do not create a boss',()=>{
  assert.equal(createInvader(7,0,1).boss,false);
});

test('all tier 2–5 heroes have a unique sprite cell in an available sheet',()=>{
  const heroes=units.filter(unit=>unit.tier>=2);
  assert.equal(heroes.length,32);
  const cells=new Set();
  for(const hero of heroes){
    assert.ok(hero.atlas,`${hero.name} is missing a sprite`);
    assert.equal(hero.atlas.src,`/portraits/tier-${hero.tier}-atlas.png`);
    assert.ok(existsSync(new URL(`../public${hero.atlas.src}`,import.meta.url)),`${hero.name} sheet is missing`);
    assert.ok(hero.atlas.col>=0&&hero.atlas.col<4&&hero.atlas.row>=0&&hero.atlas.row<2);
    cells.add(`${hero.atlas.src}:${hero.atlas.col}:${hero.atlas.row}`);
  }
  assert.equal(cells.size,heroes.length);
});

test('six Sui invaders and Emperor Yang have separate sprite cells',()=>{
  const names=[...enemyNames,'수양제'];
  const cells=new Set(names.map(name=>{
    const sprite=enemyPortraits[name];
    assert.ok(sprite,`${name} is missing a sprite`);
    assert.ok(existsSync(new URL(`../public${sprite.src}`,import.meta.url)));
    return `${sprite.col}:${sprite.row}`;
  }));
  assert.equal(cells.size,7);
});
