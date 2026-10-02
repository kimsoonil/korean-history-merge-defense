import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('the lobby exposes the core game menus while battle settings keep account access',()=>{
 const title=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 const settings=readFileSync(new URL('../app/BattleSettings.tsx',import.meta.url),'utf8');
 assert.match(title,/lobby-bottom-nav/);
 assert.match(title,/진행 중인 전투/);
 assert.match(title,/클리어한 스테이지/);
 assert.match(title,/게임하기/);
 assert.doesNotMatch(title,/책을 펼쳐 이야기 보기/);
 assert.match(title,/조합서/);
 assert.match(title,/도감/);
 assert.match(title,/프로필/);
 assert.match(title,/화면을 터치하여 시작/);
 assert.doesNotMatch(title,/splash-entry"><button/);
 assert.match(title,/event\.key==='Enter'\|\|event\.key===' '/);
 assert.match(settings,/영웅 도감/);
 assert.match(settings,/프로필 변경/);
 assert.match(settings,/로그아웃/);
 assert.match(settings,/SNS 로그인/);
 assert.doesNotMatch(settings,/첫 화면으로/);
 assert.doesNotMatch(settings,/onHome/);
});

test('unit bag uses a themed auto-store check and omits explanatory copy',()=>{
 const source=readFileSync(new URL('../app/UnitBag.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/unit-bag.css',import.meta.url),'utf8');
 assert.match(source,/bag-auto-check/);
 assert.match(css,/input:checked\+\.bag-auto-check/);
 assert.doesNotMatch(source,/5단계는 보관 불가/);
 assert.doesNotMatch(source,/가방의 유닛도 조합 재료/);
});

test('lobby stage summary and account-only resources have separate locations',()=>{
 const title=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const research=readFileSync(new URL('../app/ResearchLab.tsx',import.meta.url),'utf8');
 assert.match(title,/className="lobby-stage-overview"/);
 assert.doesNotMatch(title,/className="lobby-account"/);
 assert.match(page,/className="account-resources"/);
 assert.match(page,/계정 경험치/);
 assert.match(page,/연구금/);
 assert.match(research,/연구금/);
});
