import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

test('museum, chapter opening, and epilogue share a full-bleed image and bottom copy layout',()=>{
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/story-mobile.css',import.meta.url),'utf8');
 const arrival=readFileSync(new URL('../app/StoryArrival.tsx',import.meta.url),'utf8');
 const epilogue=readFileSync(new URL('../app/StoryEpilogue.tsx',import.meta.url),'utf8');
 assert.match(layout,/import '\.\/story-mobile\.css'/);
 assert.match(css,/\.prologue,\.story-arrival\.story-cinematic\{[^}]*max-width:430px/);
 assert.match(css,/\.story-arrival\.story-cinematic \.story-backdrop\{[^}]*position:absolute;inset:0;[^}]*background-size:cover/);
 assert.match(css,/\.story-arrival\.story-cinematic \.story-content\{[^}]*justify-content:flex-end;[^}]*overflow-y:auto/);
 assert.match(arrival,/story-opening story-cinematic/);
 assert.match(epilogue,/story-epilogue story-cinematic/);
});
