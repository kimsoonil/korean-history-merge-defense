import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

test('mobile opening and epilogue keep the full image and scroll only the copy',()=>{
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/story-mobile.css',import.meta.url),'utf8');
 assert.match(layout,/import '\.\/story-mobile\.css'/);
 assert.match(css,/\.story-arrival \.story-backdrop\{[^}]*background-size:contain/);
 assert.match(css,/\.story-arrival \.story-content\{[^}]*overflow-y:auto/);
 assert.match(css,/\.story-arrival>header h1\{[^}]*word-break:keep-all/);
});
