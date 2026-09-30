import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('fortress charcoal, hanji, pine and dancheong palette is loaded last',()=>{
 const css=readFileSync(new URL('../app/traditional-theme.css',import.meta.url),'utf8');
 const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');
 for(const variable of ['--trad-ink:#242829','--trad-panel:#323738','--trad-wood:#6b5a43','--trad-paper:#e8deca','--trad-jade:#327b52','--trad-red:#b74938'])assert.match(css,new RegExp(variable));
 assert.match(css,/color-scheme:light/);
 assert.match(css,/Fortress skin: roof-tile charcoal/);
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
 assert.match(css,/\.book-tabs button\.active,[^{]+\{background:var\(--trad-jade\)/);
 assert.match(css,/\.gamble-grid article>button,[^{]+\{background:#655640/);
 assert.ok(layout.lastIndexOf("import './traditional-theme.css'")>layout.lastIndexOf("import './bottom-sheets.css'"));
});
