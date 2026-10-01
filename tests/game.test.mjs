import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import test from 'node:test';
import {createInvader,enemyNames,enemyPortraits,units} from '../lib/game.ts';
import {findLegendaryScene,legendaryScenes,resumeStageDeadline} from '../lib/legendary.ts';

test('every registered cinematic has a hero and a background asset',()=>{
  assert.equal(new Set(legendaryScenes.map(scene=>scene.slug)).size,legendaryScenes.length);
  for(const scene of legendaryScenes){
    const hero=units.find(unit=>unit.name===scene.name);
    assert.ok(hero,`${scene.name} has no unit`);
    assert.ok(existsSync(new URL(`../public/cinematics/${scene.slug}.png`,import.meta.url)),`${hero.name} background missing`);
    assert.ok(scene.quote.length>10);
  }
  for(const name of ['근초고왕','광개토대왕','을지문덕','양만춘','김유신','이순신'])assert.ok(findLegendaryScene(name));
});

test('hero codex exposes only the eight tier-seven heroes',()=>{
  const codexSource=existsSync(new URL('../app/HeroCodex.tsx',import.meta.url));
  assert.equal(codexSource,true);
  const tierSeven=legendaryScenes.filter(scene=>units.find(unit=>unit.name===scene.name)?.tier===7);
  assert.equal(tierSeven.length,8);
  assert.deepEqual(tierSeven.map(scene=>scene.name),['근초고왕','광개토대왕','을지문덕','양만춘','김유신','대조영','강감찬','이순신']);
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

test('all tier 2–7 heroes have available atlas or standalone artwork',()=>{
  const heroes=units.filter(unit=>unit.tier>=2);
  assert.equal(heroes.length,48);
  const cells=new Set();
  for(const hero of heroes){
    const src=hero.atlas?.src??hero.portrait;
    assert.ok(src,`${hero.name} is missing a sprite`);
    assert.ok(existsSync(new URL(`../public${src}`,import.meta.url)),`${hero.name} artwork is missing`);
    const key=hero.atlas?`${src}:${hero.atlas.col}:${hero.atlas.row}`:src;
    cells.add(key);
  }
  assert.ok(cells.size>=heroes.length-1);
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
