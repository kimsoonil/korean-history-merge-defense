import test from 'node:test';
import assert from 'node:assert/strict';
import {storySeenKey,hasSeenStory} from '../lib/story-seen.ts';

test('story completion persists per chapter, not globally',()=>{
 const storage=new Map();
 assert.equal(hasSeenStory(storage.get(storySeenKey(1))??null),false);
 storage.set(storySeenKey(1),'complete');
 assert.equal(hasSeenStory(storage.get(storySeenKey(1))),true);
 assert.equal(hasSeenStory(storage.get(storySeenKey(2))??null),false);
 assert.equal(new Set([1,2,3,4,5,6,7,8,10].map(storySeenKey)).size,9);
 assert.match(storySeenKey(10),/^noryang-/);
 for(const raw of [null,'','false','{}','started'])assert.equal(hasSeenStory(raw),false);
});
