import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('recipe cards merge from the whole highlighted card without effect copy or merge buttons',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const styles=readFileSync(new URL('../app/book-cards.css',import.meta.url),'utf8');
 const mergeHandler=page.slice(page.indexOf('const merge='),page.indexOf('const buyUpgrade='));
 assert.match(page,/className={`book-card \$\{ready\?'ready':''\}`} role="button"/);
 assert.match(page,/onClick={activate}/);
 assert.doesNotMatch(page,/book-role-effect/);
 assert.doesNotMatch(page,/>조합하기</);
 assert.match(styles,/\.book-card\.ready\{[^}]*border:2px solid #f4d88d/);
 assert.match(styles,/grid-template-rows:minmax\(74px,1fr\) auto auto/);
 assert.doesNotMatch(mergeHandler,/setOverlay\(null\)/);
});
