import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {SALSU_EPILOGUE_IMAGE,salsuEpilogue} from '../lib/salsu-epilogue.ts';
import {EPILOGUE_RETURN_IMAGE,STORY_EPILOGUE_IMAGES,storyEpilogue,storyEpilogueMeta} from '../lib/story-epilogue.ts';

test('Salsu victory uses a ten-page epilogue with the requested speakers',()=>{
 const pages=salsuEpilogue('홍길동');
 assert.equal(pages.length,10);
 const script=pages.map(page=>`${page.speaker} ${page.text}`).join('\n');
 for(const phrase of ['수양제','을지문덕','병사들','홍길동','끝난 거야','책의 정령'])assert.match(script,new RegExp(phrase));
 assert.match(pages.at(-1).text,/돌아가자|서책/);
});

test('every story has a distinct ten-page epilogue with player and spirit return dialogue',()=>{
 const titles=new Set(),headings=new Set();
 for(let chapter=1;chapter<=10;chapter++){
  const pages=storyEpilogue(chapter,'홍길동'),meta=storyEpilogueMeta(chapter);
  assert.equal(pages.length,10,meta.title);
  const script=pages.map(page=>`${page.speaker} ${page.text}`).join('\n');
  assert.match(script,/홍길동/);assert.match(script,/책의 정령/);assert.match(script,/돌아/);
  titles.add(meta.title);headings.add(meta.heading);
 }
 assert.equal(titles.size,10);assert.equal(headings.size,10);
});

test('every normal and hard story final opens an epilogue instead of the result popup',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.match(page,/showStoryEpilogue:\s*boolean\s*=\s*isStoryVictory\(phase\)/);
 assert.match(page,/isStoryVictory\s*=\s*\(phase:\s*Phase\)\s*=>\s*phase\s*===\s*["']won["']/);
 assert.doesNotMatch(page,/showStoryEpilogue=phase==='won'&&difficulty/);
 assert.match(page,/showStoryEpilogue\s*&&\s*\(/);
 assert.match(page,/phase\s*===\s*["']won["']\s*&&\s*!showStoryEpilogue/);
 const component=readFileSync(new URL('../app/StoryEpilogue.tsx',import.meta.url),'utf8');
 assert.match(component,/메인 화면으로/);
 assert.match(page,/setProfileReward\(null\);\s*returnHome\(\);\s*setStoryOpen\(false\);\s*setBooksOpen\(false\)/);
 assert.match(component,/step>=8\?EPILOGUE_RETURN_IMAGE:meta\.image/);
 assert.doesNotMatch(component,/스킵/);
});

test('all epilogue battle and return artwork is bundled with the game',()=>{
 const projectRoot=fileURLToPath(new URL('..',import.meta.url));
 assert.equal(SALSU_EPILOGUE_IMAGE,'/story/salsu-victory.png');
 assert.equal(EPILOGUE_RETURN_IMAGE,'/story/cinematics-mobile/history-return.jpg');
 assert.equal(new Set(STORY_EPILOGUE_IMAGES).size,10);
 for(const image of STORY_EPILOGUE_IMAGES)assert.match(image,/^\/story\/cinematics-mobile\/.*-epilogue\.jpg$/);
 for(const image of [...STORY_EPILOGUE_IMAGES,EPILOGUE_RETURN_IMAGE])assert.equal(existsSync(`${projectRoot}/public${image}`),true,image);
});

test('all story opening images, headings and dialogue pages are available',async()=>{
 const {getStoryCampaign}=await import('../lib/story-campaigns.ts');
 const projectRoot=fileURLToPath(new URL('..',import.meta.url));
 for(let chapter=1;chapter<=10;chapter++){
  const story=getStoryCampaign(chapter);
  assert.equal(existsSync(`${projectRoot}/public${story.arrivalImage}`),true,story.title);
  assert.equal(existsSync(`${projectRoot}/public${story.epilogue.image}`),true,story.title);
  assert.ok(story.title.trim());
  assert.ok(story.arrivalTitle.trim());
  for(let step=0;step<5;step++){
   const page=story.arrival(step,'홍길동');
   assert.ok(page.speaker.trim()&&page.text.trim(),`${story.title} opening ${step+1}`);
  }
  for(const [index,page] of story.epilogue.pages('홍길동').entries()){
   assert.ok(page.speaker.trim()&&page.text.trim(),`${story.title} epilogue ${index+1}`);
  }
 }
});
