export type ChapterId=1|2|3;
export const chapterUnlocked=(chapter:number,salsuCleared:number,ansiCleared=0)=>chapter===1||(chapter===2&&salsuCleared>=10)||(chapter===3&&salsuCleared>=10&&ansiCleared>=10);
export const ANSI_IMAGE='/terrain/ansi-battlefield.png';
export const ansiFronts=[
 {id:'ansi-gate',name:'안시성 성문',first:1,last:3,image:ANSI_IMAGE,intro:'645년 안시성. 당나라 선봉이 성문에 도달했다!',dialogue:'성문을 굳게 지켜라. 백성과 병사가 함께 이 성을 지킬 것이다!'},
 {id:'ansi-siege',name:'안시성 공성전',first:4,last:6,image:ANSI_IMAGE,intro:'충차와 투석기가 다가온다! 성벽의 빈틈을 메워라!',dialogue:'무너진 곳은 다시 쌓고, 다친 병사는 뒤로 물려라. 아직 성은 굳건하다!'},
 {id:'ansi-mound',name:'토산 쟁탈전',first:7,last:9,image:ANSI_IMAGE,intro:'적의 토산이 성벽을 위협한다. 반격의 기회를 잡아라!',dialogue:'틈이 열렸다! 토산을 확보해 적의 공세를 끊어라!'},
 {id:'ansi-final',name:'당 태종 최종전',first:10,last:10,image:ANSI_IMAGE,intro:'당군의 마지막 총공세! 안시성을 끝까지 지켜라!',dialogue:'긴 포위도 우리의 뜻을 꺾지 못했다. 마지막 공격을 막아내라!'},
];
export const ansiEnemyNames=['당나라 보병','당나라 창병','당나라 궁병','당나라 기병','당나라 공성병','당나라 정예군'];
export const ansiBossNames:Record<number,string>={10:'당나라 선봉장',20:'당나라 공성대장',30:'이세적',40:'당나라 투석대장',50:'이도종',60:'토산 돌격대장',65:'당 태종'};
export function ansiBossName(stage:number,round:number){if(round===65)return stage===10?'당 태종':null;return ansiBossNames[round]??(round>=20&&round%5===0?'당나라 장군':null);}
export const ansiVictory='안시성 방어 성공! 고구려의 군민이 당나라의 공세를 막아내고 성을 지켜냈습니다!';
export const ansiBossQuotes:Record<string,[string,string]>={
 '당나라 선봉장':['성을 포위하라! 고구려의 방어선을 뚫겠다!','이 작은 성이 어찌 이토록 굳건하단 말인가!'],
 '당나라 공성대장':['충차를 전진시켜라! 성문을 무너뜨려라!','공성 무기가 멈췄다! 일단 뒤로 물러나 재정비하라!'],
 '이세적':['성벽의 빈틈을 노려라. 쉬지 말고 공세를 이어가라!','방어가 예상보다 치밀하다. 병력을 다시 모아라!'],
 '당나라 투석대장':['돌을 날려라! 성벽 위의 방어군을 제압하라!','성벽을 부숴도 곧바로 다시 메우는구나!'],
 '이도종':['토산을 높여라! 성 안을 내려다보며 압박하겠다!','토산의 방어가 무너졌다! 적의 반격을 막아라!'],
 '토산 돌격대장':['토산을 되찾아라! 이대로 물러설 수는 없다!','토산을 빼앗겼다! 더는 진격할 길이 없다!'],
 '당나라 장군':['전열을 정비하라! 다시 공격한다!','병사들을 수습하라! 공세를 멈춰야 한다!'],
 '당 태종':['전군, 마지막 공세를 펼쳐라! 안시성의 문을 열어라!','끝내 성을 넘지 못했구나. 겨울이 오기 전에 군을 물린다.'],
};
export function ansiArrival(step:number,name:string){
 return [
 {speaker:'책의 정령',text:`${name}, 천명도첩의 다음 장이 열렸다. 이번에는 645년의 안시성이다.`},
 {speaker:name,text:'성벽 너머가 온통 군대야… 저 거대한 공성 무기들은 뭐지?'},
 {speaker:'책의 정령',text:'당나라 군대가 성을 포위하고 있다. 이곳의 군민은 거센 공세에도 성을 지켜내야 한다.'},
 {speaker:'안시성주',text:`낯선 이여, 그대가 ${name}인가. 우리와 함께 성문을 지켜 주겠는가?`},
 {speaker:'책의 정령',text:'성문 방어, 공성전, 토산 쟁탈을 넘어 마지막 공세를 막아라. 전선 지도에서 전투를 선택하자.'},
 ][step];
}
export const progressKey=(chapter:ChapterId,hard=false)=>chapter===1?(hard?'salsu-hard-campaign-v1':'salsu-campaign-v1'):chapter===2?(hard?'ansi-hard-campaign-v1':'ansi-campaign-v1'):(hard?'hwangsan-hard-campaign-v1':'hwangsan-campaign-v1');
