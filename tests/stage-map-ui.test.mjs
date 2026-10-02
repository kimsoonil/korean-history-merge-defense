import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const component=readFileSync(new URL('../app/StageMap.tsx',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/stage-map.css',import.meta.url),'utf8');
const theme=readFileSync(new URL('../app/traditional-theme.css',import.meta.url),'utf8');

test('stage selection unlocks the hard icon and uses an icon-only completed state',()=>{
 assert.match(component,/hardUnlocked \? <LockOpen/);
 assert.match(component,/<Check size=\{24\} strokeWidth=\{4\} aria-label="클리어"/);
 assert.doesNotMatch(component,/전투를 선택하면 병사 모집부터 새로 시작합니다/);
 assert.doesNotMatch(component,/일반 10스테이지 완료 후 1부터 순차 도전합니다/);
 assert.doesNotMatch(component,/하드 · 무작위 5단계 영웅 3명 조합 금지|hard-status/);
 assert.match(layout,/\.map-dialog-header\{[^}]*margin-bottom:14px/);
});

test('hard mode colors only list rows red and leaves stage codes transparent',()=>{
 for(const selector of ['.hard-preview .map-battle-row','.hard-preview .map-battle-row:disabled','.hard-preview .map-battle-code']){
  assert.ok(theme.includes(selector),selector);
 }
 assert.doesNotMatch(theme,/\.hard-preview \.stage-map-dialog\{/);
 assert.match(theme,/\.hard-preview \.map-battle-code\{[^}]*background:transparent/);
});
