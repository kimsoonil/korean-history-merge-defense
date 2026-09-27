// 1018–1019 setting; dialogue and repeated boss encounters are game fiction.
export const GWIJU_IMAGE='/terrain/gwiju-battlefield.png';
export const gwijuYear=(stage:number)=>stage<=3?'1018년':'1019년';
export const gwijuFronts=[
 {id:'gwiju-heunghwa',name:'흥화진',first:1,last:3,image:GWIJU_IMAGE,intro:'1018년 흥화진. 거란군이 국경을 넘어온다. 길목을 지켜라!',dialogue:'서두르지 마라. 지형을 살피고 적의 선봉을 끊어라!'},
 {id:'gwiju-gaegyeong',name:'개경 방어선',first:4,last:6,image:GWIJU_IMAGE,intro:'거란군이 개경을 위협한다. 보급로를 끊고 방어선을 유지하라!',dialogue:'백성을 보호하고 진영을 굳게 지켜라. 적의 보급이 끊기면 기회가 온다!'},
 {id:'gwiju-plain',name:'귀주 벌판',first:7,last:9,image:GWIJU_IMAGE,intro:'1019년 귀주. 물러나는 거란군을 맞아 포위망을 완성하라!',dialogue:'전열을 맞춰라! 흩어지지 말고 서로 호응하여 적을 막아라!'},
 {id:'gwiju-final',name:'소배압 최종전',first:10,last:10,image:GWIJU_IMAGE,intro:'소배압의 마지막 돌파! 고려의 방어선을 끝까지 지켜라!',dialogue:'모든 군이 함께 나아간다. 이곳 귀주에서 침략을 끝내자!'},
];
export const gwijuEnemyNames=['거란 보병','거란 창병','거란 궁병','거란 경기병','거란 궁기병','거란 중기병'];
export const gwijuBossNames:Record<number,string>={10:'거란 선봉장',20:'거란 돌격대장',30:'거란 기병대장',40:'거란 궁기병대장',50:'거란 중기병대장',60:'거란 후위대장',65:'소배압'};
export function gwijuBossName(stage:number,round:number){if(round===65)return stage===10?'소배압':null;return gwijuBossNames[round]??(round>=20&&round%5===0?'거란 장군':null);}
export const gwijuVictory='귀주대첩 대승리! 강감찬과 고려군이 거란군의 침략을 막아냈습니다. 귀주의 기록을 천명도첩에 새겼습니다!';
export const gwijuBossQuotes:Record<string,[string,string]>={
 '거란 선봉장':['길목을 뚫어라! 고려의 방어선을 돌파한다!','매복이다! 흩어지지 말고 대열을 수습하라!'],
 '거란 돌격대장':['방패를 밀어붙여라! 진영을 무너뜨린다!','진격이 막혔다! 부상병을 뒤로 물려라!'],
 '거란 기병대장':['말을 달려라! 적의 측면을 파고든다!','측면까지 막았구나! 말을 돌려라!'],
 '거란 궁기병대장':['거리를 벌리고 화살을 퍼부어라!','추격이 거세다! 대열을 다시 모아라!'],
 '거란 중기병대장':['중기병 전진! 포위망을 뚫어라!','돌파구가 없다! 전열을 정비하라!'],
 '거란 후위대장':['후방을 사수하라! 본대가 빠져나갈 시간을 벌어라!','고려군이 사방에서 밀려온다! 더는 버틸 수 없다!'],
 '거란 장군':['병력을 모아라! 다시 공격한다!','공세를 멈춰라! 병사들을 수습한다!'],
 '소배압':['전군 돌격! 귀주의 포위망을 뚫고 돌아간다!','끝내 고려의 방어선을 넘지 못했구나… 남은 병력을 물린다.'],
};
export function gwijuArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이번 기록은 1018년부터 1019년까지 이어진 거란의 세 번째 고려 침입이다.`},
 {speaker:name,text:'말발굽 소리가 끝없이 들려… 저 기병들이 모두 고려로 향하고 있는 거야?'},
 {speaker:'책의 정령',text:'소배압이 이끄는 거란군이 국경을 넘었다. 강감찬과 고려군은 흥화진에서 시작해 개경의 방어와 귀주의 결전을 준비한다.'},
 {speaker:'강감찬',text:`${name}, 우리와 함께 백성과 이 땅을 지켜 주겠는가? 적의 기세보다 우리의 굳건한 전열이 중요하다.`},
 {speaker:'책의 정령',text:'흥화진, 개경 방어선, 귀주 벌판을 지나 마지막 돌파를 막아라. 대사와 반복 공세는 도첩이 재현한 이야기다. 지도에서 전투를 선택하자.'},
 ][step];}
