import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('recipe cards merge from the whole highlighted card without effect copy or merge buttons',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const styles=readFileSync(new URL('../app/book-cards.css',import.meta.url),'utf8');
 const mergeHandler=page.slice(page.indexOf('const merge='),page.indexOf('const buyUpgrade='));
 assert.match(page,/className={`book-card \$\{ready\?'ready':''\} \$\{locked\?'locked':''\}`} role="button"/);
 assert.match(page,/onClick={activate}/);
 assert.doesNotMatch(page,/book-role-effect/);
 assert.doesNotMatch(page,/>조합하기</);
 assert.doesNotMatch(page,/book-preview/);
 assert.doesNotMatch(page,/등장 연출 미리보기/);
 assert.match(styles,/\.book-card\.ready\{[^}]*border:2px solid #f4d88d/);
 assert.match(styles,/\.book-card-art\{position:absolute;inset:0/);
 assert.match(styles,/\.book-card-art \.unit-portrait\.normal\{[^}]*width:100%;height:100%/);
 assert.match(styles,/\.book-card \.book-card-head\{position:relative;z-index:2/);
 assert.match(styles,/\.book-card \.book-card-head\{[^}]*padding:8px 9px 2px/);
 assert.match(styles,/\.book-card \.book-ingredients\{position:relative;z-index:2[^}]*flex:0 0 auto[^}]*margin:auto 0 0/);
 assert.match(styles,/@media\(max-width:760px\)\{[\s\S]*?\.book-grid\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\);grid-template-rows:repeat\(2,minmax\(0,1fr\)\)\}/);
 assert.doesNotMatch(mergeHandler,/setOverlay\(null\)/);
});
