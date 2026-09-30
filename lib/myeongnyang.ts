// Historical setting; dialogue and repeated encounters are game dramatization.
export const MYEONGNYANG_IMAGE='/terrain/myeongnyang-battlefield.png';
export const myeongnyangFronts=[
 {id:'myeongnyang-watch',name:'울돌목 감시선',first:1,last:3,image:MYEONGNYANG_IMAGE,intro:'1597년 울돌목. 거센 물살 너머로 일본 수군이 다가온다!',dialogue:'물길을 먼저 읽어라. 적을 좁은 해협으로 끌어들여 전열을 무너뜨린다!'},
 {id:'myeongnyang-current',name:'회오리 물살',first:4,last:6,image:MYEONGNYANG_IMAGE,intro:'조류가 바뀌기 시작한다. 물살을 이용해 적의 선두를 끊어라!',dialogue:'두려워하지 마라. 우리에게는 아직 열두 척의 배와 물길을 아는 장수들이 있다!'},
 {id:'myeongnyang-strait',name:'명량 해협',first:7,last:9,image:MYEONGNYANG_IMAGE,intro:'수백 척의 적선이 좁은 해협에 엉켰다. 화력을 집중하라!',dialogue:'일자진을 유지하라! 적선이 서로 부딪히는 순간 총통을 일제히 발사한다!'},
 {id:'myeongnyang-final',name:'구루시마 최종전',first:10,last:10,image:MYEONGNYANG_IMAGE,intro:'적 지휘선이 돌파를 시도한다. 명량의 마지막 공세를 막아라!',dialogue:'필사즉생 필생즉사. 한 사람의 용기가 온 바다의 전세를 바꿀 것이다!'},
];
export const myeongnyangEnemyNames=['일본 정찰선','일본 돌격선','일본 궁병선','일본 조총선','일본 대형 전선','일본 정예 전선'];
export const myeongnyangBossNames:Record<number,string>={10:'명량 선봉 함장',20:'일본 돌격선단장',30:'일본 조총선단장',40:'울돌목 돌파대장',50:'일본 중앙선단장',60:'구루시마 친위함장',65:'구루시마 미치후사'};
export function myeongnyangBossName(stage:number,round:number){if(round===65)return stage===10?'구루시마 미치후사':null;return myeongnyangBossNames[round]??(round>=20&&round%5===0?'명량 일본 함장':null);}
export const myeongnyangVictory='명량대첩 대승리! 이순신과 조선 수군이 열세를 이겨내고 울돌목의 거센 물살 속에서 일본 함대를 격퇴했습니다!';
export const myeongnyangBossQuotes:Record<string,[string,string]>={
 '명량 선봉 함장':['조선의 배는 얼마 남지 않았다! 단숨에 해협을 돌파하라!','적은 수의 배가 어찌 이토록 전열을 지킨단 말인가!'],
 '일본 돌격선단장':['배를 붙여라! 조선의 지휘선을 포위한다!','물살이 배를 밀어낸다! 대열을 다시 세워라!'],
 '일본 조총선단장':['사거리를 좁혀 갑판을 향해 사격하라!','조선의 함포가 먼저 닿는다! 뒤로 물러나라!'],
 '울돌목 돌파대장':['조류가 바뀌기 전에 좁은 물길을 빠져나간다!','배들이 암초와 서로에게 부딪힌다! 진격을 멈춰라!'],
 '일본 중앙선단장':['중앙에 함선을 모아 일자진을 깨뜨려라!','선두가 막혀 뒤의 함선까지 움직일 수 없다!'],
 '구루시마 친위함장':['지휘선을 엄호하라! 남은 함선을 모두 투입한다!','기함이 고립됐다! 퇴로를 확보하라!'],
 '명량 일본 함장':['노를 저어라! 수적으로 밀어붙인다!','거센 조류에 대열이 흩어진다!'],
 '구루시마 미치후사':['전 함대 돌격! 조선 수군을 이 바다에서 끝장내라!','겨우 열두 척을 넘지 못하다니… 명량의 물살이 우리를 삼키는구나!'],
};
export function myeongnyangArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이번 기록은 1597년 명량 해협이다. 조선 수군은 불과 열두 척의 전선으로 거대한 일본 함대를 맞이하고 있다.`},
 {speaker:name,text:'저 좁은 바다를 적선이 가득 메우고 있어… 저 숫자를 정말 막을 수 있는 거야?'},
 {speaker:'책의 정령',text:'울돌목은 조류가 빠르고 방향이 자주 바뀌는 곳이다. 이순신은 수적 열세를 물길과 화포로 뒤집으려 한다.'},
 {speaker:'이순신',text:`${name}, 아직 우리에게는 열두 척의 배가 남아 있다. 물러서지 말고 이 바다를 함께 지켜 주게.`},
 {speaker:'책의 정령',text:'감시선에서 회오리 물살과 명량 해협을 지나 적 지휘선을 격파하라. 이제 전선 지도에서 전투를 선택하자.'},
 ][step];}
