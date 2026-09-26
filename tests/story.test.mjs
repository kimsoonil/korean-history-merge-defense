import test from 'node:test';
import assert from 'node:assert/strict';
import {freshStory,readStory,advanceStory,recruitTutorial,mergeTutorial,storyRoster,storyGold,storyDialogue,TUTORIAL_RECIPE} from '../lib/story.ts';
import {byName} from '../lib/game.ts';
test('tutorial requires actual recruits and recipe merge before the battle',()=>{
 let state=freshStory();for(let i=0;i<6;i++)state=advanceStory(state);
 assert.equal(advanceStory(state),state);
 for(let i=0;i<4;i++)state=recruitTutorial(state);
 assert.deepEqual(storyRoster(state).map(u=>u.name),byName.온달.recipe);
 assert.equal(storyGold(state),200);assert.equal(recruitTutorial(state),state);
 for(let i=0;i<3;i++)state=advanceStory(state);
 assert.equal(state.step,9);assert.equal(advanceStory(state),state);
 state=mergeTutorial(state);assert.equal(mergeTutorial(state),state);
 for(let i=0;i<3;i++)state=advanceStory(state);
 assert.equal(state.step,12);assert.equal(storyRoster(state)[0].name,'온달');
 assert.deepEqual(readStory(JSON.stringify(state)),state);
});
test('old or corrupt checkpoints reset safely and nickname occurs in dialogue',()=>{
 for(const raw of [null,'bad','{"step":12,"summoned":0,"merged":true}','{"step":2,"summoned":4,"merged":false}'])assert.deepEqual(readStory(raw),freshStory());
 assert.ok(storyDialogue(4,'홍길동').text.includes('홍길동!'));
 assert.ok(storyDialogue(12,'홍길동').text.includes('내 이름은 홍길동'));
 assert.equal(TUTORIAL_RECIPE.length,4);
});
