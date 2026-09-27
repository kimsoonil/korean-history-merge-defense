// Setting inspired by history; dialogue, repeated bosses and terrain are game fiction.
export const HAENGJU_IMAGE='/terrain/haengju-battlefield.png';
export const haengjuFronts=[
 {id:'haengju-approach',name:'산성 진입로',first:1,last:3,image:HAENGJU_IMAGE,intro:'1593년 행주산성. 적군이 산길을 따라 몰려온다!',dialogue:'높은 곳을 지키고 대열을 흐트러뜨리지 마라. 적의 접근을 막아라!'},
 {id:'haengju-palisade',name:'목책 방어선',first:4,last:6,image:HAENGJU_IMAGE,intro:'적이 목책에 다가온다. 돌과 화살을 나르고 방어선을 지켜라!',dialogue:'무너진 목책을 메워라! 군민이 힘을 합치면 이 산성을 지킬 수 있다!'},
 {id:'haengju-fortress',name:'행주산성 본진',first:7,last:9,image:HAENGJU_IMAGE,intro:'본진을 향한 공세가 거세진다. 화력을 모아 반격하라!',dialogue:'화차와 총통을 준비하라! 적이 다가오면 신호에 맞춰 일제히 쏘아라!'},
 {id:'haengju-final',name:'행주 최종 공세',first:10,last:10,image:HAENGJU_IMAGE,intro:'일본군의 마지막 총공세! 행주산성을 끝까지 지켜라!',dialogue:'마지막까지 서로의 자리를 지켜라. 이 산성에서 적의 기세를 꺾는다!'},
];
export const haengjuEnemyNames=['일본군 보병','일본군 창병','일본군 궁병','일본군 조총병','일본군 공성병','일본군 정예병'];
export const haengjuBossNames:Record<number,string>={10:'일본군 선봉대장',20:'일본군 공성대장',30:'일본군 조총대장',40:'목책 돌격대장',50:'일본군 정예대장',60:'일본군 친위대장',65:'우키타 히데이에'};
export function haengjuBossName(stage:number,round:number){if(round===65)return stage===10?'우키타 히데이에':null;return haengjuBossNames[round]??(round>=20&&round%5===0?'일본군 장군':null);}
export const haengjuVictory='행주대첩 대승리! 권율과 군민이 힘을 합쳐 일본군의 공세를 막아냈습니다. 행주산성을 지켜낸 기록을 천명도첩에 새겼습니다!';
export const haengjuBossQuotes:Record<string,[string,string]>={
 '일본군 선봉대장':['산길을 확보하라! 정상으로 올라간다!','위에서 화살이 쏟아진다! 대열을 추슬러라!'],
 '일본군 공성대장':['목책을 허물어라! 방어선을 뚫는다!','돌과 화살이 끊이지 않는다! 뒤로 물러나라!'],
 '일본군 조총대장':['일제히 사격하라! 목책 위를 제압한다!','적의 반격이 거세다! 엄폐하라!'],
 '목책 돌격대장':['틈을 향해 돌격하라! 산성을 넘는다!','목책 뒤에도 방어군이 있다! 물러나라!'],
 '일본군 정예대장':['병력을 집중하라! 본진을 무너뜨린다!','불화살과 포탄이다! 병력을 수습하라!'],
 '일본군 친위대장':['지휘관을 엄호하라! 마지막 공격을 준비한다!','더는 전진할 수 없다! 지휘관을 지켜라!'],
 '일본군 장군':['전열을 모아라! 다시 공격한다!','방어가 너무 굳건하다! 공세를 멈춰라!'],
 '우키타 히데이에':['전군 진격! 행주산성의 방어선을 돌파하라!','끝내 산성을 넘지 못했구나… 남은 병력을 모아 철수한다!'],
};
export function haengjuArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 천명도첩이 가리키는 곳은 1593년 행주산성이다. 권율의 군대가 이곳에서 일본군에 맞서고 있다.`},
 {speaker:name,text:'산 아래가 온통 적군이야! 이 목책으로 막아낼 수 있을까?'},
 {speaker:'책의 정령',text:'권율과 조경, 승장 처영의 병력과 백성들이 힘을 모으고 있다. 높은 지형을 이용해 방어선을 지켜야 한다.'},
 {speaker:'권율',text:`${name}, 우리와 함께 산성을 지켜라. 돌과 화살을 나르고 목책의 빈틈을 메워라!`},
 {speaker:'책의 정령',text:'산길에서 목책과 본진까지 적의 공세를 막아라. 지도에서 전투를 선택하자. 대사와 반복 공세는 도첩의 재현이다.'},
 ][step];}
