import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('traditional ink, wood, paper, dancheong and brass palette is loaded last',()=>{
 const css=readFileSync(new URL('../app/traditional-theme.css',import.meta.url),'utf8');
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 for(const color of ['#171714','#29251f','#3b3026','#e7d5ad','#f2e6c9','#9e3f32','#c5a45b','#4f8276'])assert.match(css,new RegExp(color));
 assert.match(css,/\.game-header/);
 assert.match(css,/\.music-controls/);
 assert.match(css,/\.game-actions/);
 assert.match(css,/\.wave-action button/);
 assert.match(css,/\.battle-resource/);
 assert.match(css,/\.board-bag/);
 assert.match(css,/\.book-modal/);
 assert.match(css,/\.story-library/);
 assert.match(css,/\.stage-map-screen/);
 assert.ok(layout.lastIndexOf("import './traditional-theme.css'")>layout.lastIndexOf("import './bottom-sheets.css'"));
});
