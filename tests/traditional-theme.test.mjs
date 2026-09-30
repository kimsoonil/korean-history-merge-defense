import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('byeok-led ogansaek palette is loaded last across the full interface',()=>{
 const css=readFileSync(new URL('../app/traditional-theme.css',import.meta.url),'utf8');
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 for(const variable of ['--trad-byeok:#68aab8','--trad-byeok-deep:#356f7b','--trad-byeok-pale:#e3f1f1','--trad-jade:#5f806b','--trad-red:#b85f68','--trad-purple:#765574','--trad-yellow:#a8864d'])assert.match(css,new RegExp(variable));
 assert.match(css,/color-scheme:light/);
 assert.match(css,/Ogansaek skin: byeok blue leads/);
 assert.match(css,/\.game-header/);
 assert.match(css,/\.music-controls/);
 assert.match(css,/\.game-actions/);
 assert.match(css,/\.wave-action button/);
 assert.match(css,/\.battle-resource/);
 assert.match(css,/\.board-bag/);
 assert.match(css,/\.book-modal/);
 assert.match(css,/\.story-library/);
 assert.match(css,/\.stage-map-screen/);
 assert.match(css,/\.region-mode button\.active\{background:var\(--trad-jade\)/);
 assert.match(css,/\.hard-preview \.region-mode button\.active\{background:var\(--trad-red\)/);
 assert.match(css,/\.book-tabs button\.active,[^{]+\{background:var\(--trad-byeok-deep\)/);
 assert.match(css,/\.gamble-grid article>button,[^{]+\{background:var\(--trad-purple\)/);
 assert.ok(layout.lastIndexOf("import './traditional-theme.css'")>layout.lastIndexOf("import './bottom-sheets.css'"));
});
