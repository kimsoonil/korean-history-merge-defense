// Fictional defense missions inspired by the siege, not a historical victory claim.
export const NAMHAN_IMAGE='/terrain/namhan-battlefield.png';
export const namhanFronts=[
 {id:'namhan-pass',name:'겨울 산길',first:1,last:3,image:NAMHAN_IMAGE,intro:'1636년 겨울, 남한산성. 포위망이 좁혀진다!',dialogue:'성으로 향하는 사람들을 보호하라. 추위 속에서도 대열을 지켜라!'},
 {id:'namhan-gate',name:'성문 방어선',first:4,last:6,image:NAMHAN_IMAGE,intro:'청군이 성문을 압박한다. 방어선을 유지하라!',dialogue:'성문을 굳게 지켜라. 화살과 식량을 아끼고 부상병을 돌보아라!'},
 {id:'namhan-wall',name:'설원 성벽',first:7,last:9,image:NAMHAN_IMAGE,intro:'1637년, 포위가 길어진다. 성벽의 빈틈을 메워라!',dialogue:'지친 병사들을 교대하라. 서로를 돕고 맡은 자리를 지킨다!'},
 {id:'namhan-final',name:'최후 방어 임무',first:10,last:10,image:NAMHAN_IMAGE,intro:'도첩 속 마지막 공세. 산성의 사람들을 지켜라!',dialogue:'끝까지 사람들을 보호하라. 우리의 임무는 이들의 삶을 지키는 것이다!'},
];
export const namhanEnemyNames=['청군 보병','청군 창병','청군 궁병','청군 기병','청군 공성병','청군 정예병'];
export const namhanBossNames:Record<number,string>={10:'청군 선봉장',20:'청군 공성대장',30:'청군 기병대장',40:'청군 포병대장',50:'청군 돌격대장',60:'청군 정예대장',65:'청군 포위사령관'};
export function namhanBossName(stage:number,round:number){if(round===65)return stage===10?'청군 포위사령관':null;return namhanBossNames[round]??(round>=20&&round%5===0?'청군 장군':null);}
export const namhanVictory='방어 임무 완료. 천명도첩 속 공세를 막고 산성의 사람들을 지켰습니다. 실제 병자호란은 1637년 인조의 항복으로 끝났습니다. 이 결과는 역사적 승리가 아닌 게임 속 임무의 완료입니다.';
export const namhanBossQuotes:Record<string,[string,string]>={
 '청군 선봉장':['산길을 장악하라! 산성을 포위한다!','방어군이 버티고 있다! 대열을 정비하라!'],
 '청군 공성대장':['성문에 접근하라! 공세를 집중한다!','화살이 쏟아진다! 공성대를 물려라!'],
 '청군 기병대장':['산성으로 드는 길을 차단하라!','산길이 좁다! 병력을 다시 모아라!'],
 '청군 포병대장':['성벽을 향해 포격하라!','반격이다! 포대를 보호하라!'],
 '청군 돌격대장':['틈을 향해 진격하라!','돌파가 막혔다! 부상병을 수습하라!'],
 '청군 정예대장':['전열을 집중하라! 방어선을 압박한다!','방어가 굳건하다! 전열을 물려라!'],
 '청군 장군':['포위망을 유지하라! 다시 공격한다!','병력을 정비하고 다음 명령을 기다려라!'],
 '청군 포위사령관':['전군 공세! 산성의 방어선을 압박하라!','이번 공세는 멈춘다. 전열을 정비하라!'],
};
export function namhanArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이곳은 1636년 겨울의 남한산성이다. 병자호란으로 청군이 산성을 에워싸고 있다.`},
 {speaker:name,text:'눈 속에서 사람들이 떨고 있어… 식량도 부족해 보이는데 어떻게 버티지?'},
 {speaker:'책의 정령',text:'이 기록은 승전의 이야기가 아니다. 긴 포위 속에서 병사와 백성이 겪었던 고통을 기억해야 한다.'},
 {speaker:'산성 수비장',text:`${name}, 우리와 함께 사람들을 보호해 주게. 성문의 빈틈을 막고 지친 병사들을 도와주게.`},
 {speaker:'책의 정령',text:'겨울 산길과 성문, 성벽을 지키는 도첩의 방어 임무를 시작하자. 실제 전쟁은 인조의 항복으로 끝났다. 이 임무와 대사는 게임적 재구성이다.'},
 ][step];}
