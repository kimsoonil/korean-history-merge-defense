import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('battle settings keep profile, codex and account access after the home menu is removed',()=>{
 const title=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 const settings=readFileSync(new URL('../app/BattleSettings.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(title,/home-settings-panel|home-menu/);
 assert.match(settings,/영웅 도감/);
 assert.match(settings,/프로필 변경/);
 assert.match(settings,/로그아웃/);
 assert.match(settings,/SNS 로그인/);
});

test('unit bag uses a themed auto-store check and omits explanatory copy',()=>{
 const source=readFileSync(new URL('../app/UnitBag.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/unit-bag.css',import.meta.url),'utf8');
 assert.match(source,/bag-auto-check/);
 assert.match(css,/input:checked\+\.bag-auto-check/);
 assert.doesNotMatch(source,/5단계는 보관 불가/);
 assert.doesNotMatch(source,/가방의 유닛도 조합 재료/);
});
