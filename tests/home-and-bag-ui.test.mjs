import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('home keeps the codex in settings and removes archive shortcuts and close icon',()=>{
 const source=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 assert.match(source,/home-settings-panel[\s\S]*영웅 도감/);
 assert.doesNotMatch(source,/home-shortcuts/);
 assert.doesNotMatch(source,/홈 설정 닫기/);
 assert.match(source,/document\.addEventListener\('pointerdown',close\)/);
});

test('unit bag uses a themed auto-store check and omits explanatory copy',()=>{
 const source=readFileSync(new URL('../app/UnitBag.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/unit-bag.css',import.meta.url),'utf8');
 assert.match(source,/bag-auto-check/);
 assert.match(css,/input:checked\+\.bag-auto-check/);
 assert.doesNotMatch(source,/5단계는 보관 불가/);
 assert.doesNotMatch(source,/가방의 유닛도 조합 재료/);
});
