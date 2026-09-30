import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('bright oriental hanji, celadon, dancheong and brass palette is loaded last',()=>{
 const css=readFileSync(new URL('../app/traditional-theme.css',import.meta.url),'utf8');
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 for(const color of ['#efe4cf','#fffaf0','#e7d3ae','#355047','#263a32','#a9463c','#b78832','#4c8978'])assert.match(css,new RegExp(color));
 assert.match(css,/color-scheme:light/);
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
 assert.ok(layout.lastIndexOf("import './traditional-theme.css'")>layout.lastIndexOf("import './bottom-sheets.css'"));
});
