import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const cards=readFileSync(new URL('../app/book-cards.css',import.meta.url),'utf8');

test('hard bans appear as card locks instead of archive status copy',()=>{
 assert.doesNotMatch(page,/하드 조합 금지:/);
 assert.match(page,/className="book-hard-lock"/);
 assert.match(cards,/\.book-hard-lock\{[^}]*background:#05050573[^}]*color:#fff/);
});

test('starting hard mode shows the three random tier-seven bans as dialogue',()=>{
 assert.match(page,/>변칙 모드</);
 assert.match(page,/>해당 유닛 조합이 금지됩니다\.</);
 assert.match(page,/>7단계 랜덤 유닛 3개</);
 assert.match(page,/hardBanIntro\.join\(" · "\)/);
});
