import test from 'node:test';
import assert from 'node:assert/strict';
import {defeatedVanguard,vanguardName,bossLine,siegeName,defeatedDialogueBoss} from '../lib/battle-dialogue.ts';
import {roundBossName} from '../lib/rounds.ts';
test('round forty and fifty bosses show the requested dialogue and correct speakers',()=>{
 const cases=[
  {round:40,stage:5,name:'내호아',speaker:'수나라 병사',arrival:'육군 녀석들을 기다릴 것 없다! 우리 수군이 먼저 평양성을 함락시키겠다!',defeat:'함정이다! 평양성 외곽에 숨어있던 고구려 복병들이 기습해 옵니다! 배들이 침몰하고 있습니다!'},
  {round:50,stage:7,name:'우중문',speaker:'우중문',arrival:'감히 나에게 신기한 책략 운운하며 조롱해?! 평양성을 잿더미로 만들어 주마!',defeat:'윽... 식량은 없고 병사들은 굶주려 창을 쥘 힘도 없구나... 일단 철수한다!'}
 ];
 for(const c of cases)for(let stage=c.stage;stage<=10;stage++){
  assert.equal(roundBossName(stage,c.round),c.name);
  assert.equal(bossLine(c.name,stage).text,c.arrival);
  assert.equal(bossLine(c.name,stage).speaker,c.name);
  assert.equal(bossLine(c.name,stage,true).text,c.defeat);
  assert.equal(bossLine(c.name,stage,true).speaker,c.speaker);
  const enemy={id:c.round,name:c.name,boss:true,hp:100};
  assert.equal(defeatedDialogueBoss([enemy],new Map([[c.round,99]])),undefined);
  assert.equal(defeatedDialogueBoss([enemy],new Map([[c.round,100]])),enemy);
 }
});
test('round thirty Umunsul has arrival and lethal-damage defeat dialogue',()=>{
 for(let stage=3;stage<=10;stage++){
  assert.equal(roundBossName(stage,30),'우문술');
  assert.equal(bossLine('우문술',stage).text,'요동성에 묶여 있을 시간이 없다. 짐을 버리고 속도를 높여라! 평양성으로 직공한다!');
  const defeat=bossLine('우문술',stage,true);
  assert.equal(defeat.speaker,'우문술');
  assert.equal(defeat.text,'고구려의 매복인가?! 제길, 행군 속도가 늦어지면 군량이 부족해진다... 서둘러라!');
 }
 const boss={id:30,name:'우문술',boss:true,hp:100};
 assert.equal(defeatedDialogueBoss([boss],new Map([[30,99]])),undefined);
 assert.equal(defeatedDialogueBoss([boss],new Map([[30,100]])),boss);
 assert.equal(defeatedDialogueBoss([{...boss,name:'수양제'}],new Map([[30,100]])),undefined);
});
test('round sixty coalition shows both defeat speakers in order',()=>{
 const name='우중문 & 우문술';
 for(const stage of [9,10]){
  assert.equal(roundBossName(stage,60),name);
  assert.equal(bossLine(name,stage).text,'살수만 건너면 살 수 있다! 고구려군을 막아서고 후방을 사수하라!');
  const line=bossLine(name,stage,true);
  assert.equal(line.speaker,'수나라 병사');
  assert.equal(line.text,'강물이... 강물이 갑자기 밀려옵니다! 으악! 살려주십시오! 몸이 떠내려갑니다!');
  assert.deepEqual(line.extra,[{speaker:'우문술',text:'30만 대군이... 고작 수천 명만 남고 수장되다니... 이럴 수가...'}]);
 }
 const enemy={id:60,name,boss:true,hp:100};
 assert.equal(defeatedDialogueBoss([enemy],new Map([[60,99]])),undefined);
 assert.equal(defeatedDialogueBoss([enemy],new Map([[60,100]])),enemy);
});
test('siege dialogue follows fronts and uses the soldier as defeat speaker',()=>{
 for(let stage=1;stage<=10;stage++){
  assert.equal(roundBossName(stage,20),siegeName);
  const line=bossLine(siegeName,stage);
  assert.ok(line.text.includes(stage<=3?'요동성':stage<=6?'평양성':stage<=9?'살수':'최후 방어선'));
  if(stage>=7)assert.ok(!line.text.includes('성벽'));
  assert.equal(bossLine(siegeName,stage,true).speaker,'수나라 병사');
 }
 const enemy={id:20,name:siegeName,boss:true,hp:100};
 assert.equal(defeatedDialogueBoss([enemy],new Map([[20,100]])),enemy);
 assert.equal(defeatedDialogueBoss([enemy],new Map([[20,99]])),undefined);
 assert.equal(bossLine('unknown',10),null);
});
test('emperor has final arrival and victory dialogue but death alone does not trigger victory',()=>{
 assert.equal(roundBossName(10,65),'수양제');
 assert.equal(bossLine('수양제',10).text,'감히 고구려 놈들이 내 위대한 수나라를 모욕하느냐! 천자의 분노를 보여주마, 모두 비켜라!');
 assert.equal(bossLine('수양제',10,true).speaker,'수 양제');
 assert.equal(bossLine('수양제',10,true).text,'30만 대군을 보냈거늘... 겨우 2,700명만 살아 돌아왔다고?! 내 나라가, 내 위대한 수나라가 고작 고구려 따위에게 이렇게 무너진단 말이냐아악!');
 assert.equal(defeatedDialogueBoss([{id:65,name:'수양제',boss:true,hp:1}],new Map([[65,100]])),undefined);
});
test('vanguard arrives at round ten and defeat is triggered only by lethal damage',()=>{
 for(let stage=1;stage<=10;stage++)assert.equal(roundBossName(stage,10),vanguardName);
 const boss={id:1,name:vanguardName,boss:true,hp:100};
 assert.equal(defeatedVanguard([boss],new Map([[1,99]])),undefined);
 assert.equal(defeatedVanguard([boss],new Map([[1,100]])),boss);
 assert.equal(defeatedVanguard([] ,new Map([[1,100]])),undefined);
 assert.equal(defeatedVanguard([{...boss,name:'수양제'}],new Map([[1,1000]])),undefined);
});
