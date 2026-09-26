import test from 'node:test';
import assert from 'node:assert/strict';
import {frontIntro} from '../lib/front-intro.ts';
test('all Yodong and Pyongyang stages use their respective opening dialogue',()=>{
 for(const stage of [1,2,3])assert.equal(frontIntro(stage).title,'612년 요동성.');
 for(const stage of [4,5,6]){
  assert.equal(frontIntro(stage).title,'612년 평양성.');
  assert.deepEqual(frontIntro(stage).lines,['수나라 30만 별동대,','평양성 근접! 청야 작전을 개시하라!']);
  assert.equal(frontIntro(stage).text,'적들의 식량이 바닥나고 있다. 성문을 닫고 지칠 때까지 굳게 버텨라!');
 }
 for(const stage of [7,8,9]){
  assert.equal(frontIntro(stage).title,'612년 살수 청천강');
  assert.deepEqual(frontIntro(stage).lines,['적들이 살수를 건너 도망친다! 둑을 무너뜨리고 추격하라!']);
  assert.equal(frontIntro(stage).speaker,'을지문덕');
  assert.equal(frontIntro(stage).text,'하늘이 주신 기회다! 살수를 적들의 무덤으로 만들어라! 전 군, 돌격!');
 }
 assert.equal(frontIntro(10),null);
});
