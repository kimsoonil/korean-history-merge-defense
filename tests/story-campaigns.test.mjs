import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {frontsForChapter} from '../lib/campaign.ts';
import {storyCampaigns,getStoryCampaign,reinforcementDamage,reinforcementFor,validReinforcement} from '../lib/story-campaigns.ts';
import {storyEpilogue,storyEpilogueMeta} from '../lib/story-epilogue.ts';
import {roundBossName,stageRoundCount} from '../lib/rounds.ts';
import {createRoundInvader} from '../lib/game.ts';
import {storyEnemyNames} from '../lib/story-battle.ts';
import {imjinPrelude,isImjinPreludeStage} from '../lib/imjin-prelude.ts';

const publicAsset=path=>fileURLToPath(new URL(`../public${path}`,import.meta.url));

test('ten stories use one ten-stage campaign structure with connected artwork and epilogues',()=>{
 assert.equal(storyCampaigns.length,10);
 assert.deepEqual(storyCampaigns.map(story=>story.id),[1,2,3,4,5,6,7,8,9,10]);
 assert.deepEqual(storyCampaigns.map(story=>story.title),['평양성 전투','고구려의 정복 전쟁','살수대첩','안시성 전투','황산벌 전투','나당전쟁','천문령 전투','고려거란 전쟁','처인성 전투','임진왜란']);
 for(const story of storyCampaigns){
  assert.equal(getStoryCampaign(story.id),story);
  assert.equal(story.stageCount,10);
  assert.equal(story.stages.length,10);
  assert.deepEqual(story.stages.map(stage=>stage.number),[1,2,3,4,5,6,7,8,9,10]);
  assert.equal(story.arrival(0,'테스트').text.includes('테스트'),true);
  const fronts=frontsForChapter(story.id);
  assert.equal(fronts[0].first,1);
  assert.equal(fronts.at(-1).last,10);
  for(const asset of [story.coverImage,story.arrivalImage,story.epilogue.image,story.reinforcement.image]){
   assert.equal(existsSync(publicAsset(asset)),true,`${story.title}: ${asset}`);
  }
  assert.equal(storyEpilogue(story.id,'테스트').length,10);
  assert.equal(storyEpilogueMeta(story.id).image,story.epilogue.image);
 }
});

test('battle enemies and each final boss follow the same common story registry',()=>{
 for(const story of storyCampaigns){
  const enemy=createRoundInvader(1,1,1,story.id*100,'normal',story.id);
  assert.equal(storyEnemyNames(story.id).includes(enemy.name),true,`${story.title}: ${enemy.name}`);
  assert.equal(roundBossName(10,stageRoundCount(10),story.id),story.finalBoss);
 }
});

test('historical reinforcements only join normal stage ten and have a fixed damage cap',()=>{
 for(const story of storyCampaigns){
  const plan=reinforcementFor(story.id,'normal',10);
  assert.equal(plan?.hero,story.reinforcement.hero);
  assert.equal(reinforcementFor(story.id,'hard',10),null);
  assert.equal(reinforcementFor(story.id,'normal',9),null);
  const cap=100_000*plan.contribution;
  assert.equal(reinforcementDamage(plan,100_000,70,0),cap);
  assert.equal(reinforcementDamage(plan,100_000,10,cap),0);
  const progress={chapter:story.id,hero:plan.hero,damageDealt:123,halfSpoken:false};
  assert.equal(validReinforcement(progress,story.id,'normal',10),true);
  assert.equal(validReinforcement(progress,story.id,'hard',10),false);
 }
});

test('the Imjin War follows the four requested victories from Hansando to Myeongnyang',()=>{
 const story=getStoryCampaign(10),fronts=frontsForChapter(10);
 assert.deepEqual(fronts.map(front=>front.name),['한산도 대첩','진주성 대첩','행주대첩','명량대첩']);
 assert.deepEqual(fronts.map(front=>[front.first,front.last]),[[1,3],[4,6],[7,9],[10,10]]);
 assert.deepEqual(fronts.map(front=>front.image),['/terrain/hansando-battlefield.png','/terrain/namhan-battlefield.png','/terrain/haengju-battlefield.png','/terrain/myeongnyang-battlefield.png']);
 assert.equal(story.stages[0].intro.includes('학익진'),true);
 assert.equal(story.stages[3].intro.includes('3,800여 명'),true);
 assert.equal(story.stages[6].intro.includes('승병·의병·백성'),true);
 assert.equal(story.stages[9].intro.includes('13척의 배로 133척'),true);
 assert.equal(story.finalBoss,'구루시마 미치후사');
});

test('the first stage in each Imjin front opens its matching story image and commander exchange',()=>{
 const expected=[
  [1,'한산도 대첩','/story/epilogues/hansando-victory.jpg','이순신','와키자카 야스하루'],
  [4,'진주성 대첩','/story/arrivals-v2/imjin-war.png','김시민','일본군 공성대장'],
  [7,'행주대첩','/story/epilogues/haengju-victory.jpg','권율','우키타 히데이에'],
  [10,'명량대첩','/story/epilogues/myeongnyang-victory.jpg','이순신','구루시마 미치후사'],
 ];
 for(const [stage,title,image,hero,enemy] of expected){
  const prelude=imjinPrelude(stage,'테스트');
  assert.equal(prelude.title,title);assert.equal(prelude.image,image);assert.equal(existsSync(publicAsset(image)),true);
  assert.equal(prelude.pages.some(page=>page.speaker===hero),true);assert.equal(prelude.pages.some(page=>page.speaker===enemy),true);
 }
 assert.deepEqual(Array.from({length:10},(_,index)=>index+1).filter(isImjinPreludeStage),[1,4,7,10]);
 const page=readFileSync(fileURLToPath(new URL('../app/page.tsx',import.meta.url)),'utf8');
 assert.match(page,/chapter === 10 && isImjinPreludeStage\(wave\)/);assert.match(page,/<BattlePrelude/);
});

test('battle UI connects delayed arrival, dialogue, persistence, and a separate ally presentation',()=>{
 const page=readFileSync(fileURLToPath(new URL('../app/page.tsx',import.meta.url)),'utf8');
 assert.match(page,/bossSeconds\s*\?\?\s*BOSS_SECONDS\)\s*<=\s*70/);
 assert.match(page,/역사의 원군 도착/);
 assert.match(page,/reinforcementDamage\(/);
 assert.match(page,/className="story-reinforcement"/);
 assert.match(page,/reinforcement:\s*reinforcementRef\.current\s*\?\?\s*undefined/);
});
