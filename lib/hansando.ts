// Historical setting; dialogue, island deployment and recurring bosses are game fiction.
export const HANSANDO_IMAGE='/terrain/hansando-battlefield.png';
export const hansandoFronts=[
 {id:'hansando-lure',name:'견내량 유인전',first:1,last:3,image:HANSANDO_IMAGE,intro:'1592년 견내량. 좁은 물길의 적선을 넓은 바다로 유인하라!',dialogue:'서두르지 마라. 적이 따라오도록 거리를 유지하고 넓은 바다로 나아간다!'},
 {id:'hansando-sea',name:'한산도 앞바다',first:4,last:6,image:HANSANDO_IMAGE,intro:'적 선단이 한산도 앞바다로 들어온다. 전열을 갖춰라!',dialogue:'각 함선은 간격을 지켜라. 신호에 맞춰 포문을 연다!'},
 {id:'hansando-wings',name:'학익진 포위망',first:7,last:9,image:HANSANDO_IMAGE,intro:'학의 날개처럼 진을 펼쳐 적 선단을 포위하라!',dialogue:'좌우의 전선을 펼쳐라! 적이 빠져나가지 못하도록 화력을 집중한다!'},
 {id:'hansando-final',name:'와키자카 최종전',first:10,last:10,image:HANSANDO_IMAGE,intro:'적 지휘 선단이 돌파를 시도한다. 마지막 공세를 막아라!',dialogue:'끝까지 대열을 지켜라. 이 바다를 지키는 것이 우리의 임무다!'},
];
export const hansandoEnemyNames=['일본 정찰선','일본 소형 전선','일본 돌격선','일본 조총선','일본 대형 전선','일본 정예 전선'];
export const hansandoBossNames:Record<number,string>={10:'일본 수군 선봉장',20:'돌격선단장',30:'조총선단장',40:'대선 지휘관',50:'중앙 선단장',60:'호위 선단장',65:'와키자카 야스하루'};
export function hansandoBossName(stage:number,round:number){if(round===65)return stage===10?'와키자카 야스하루':null;return hansandoBossNames[round]??(round>=20&&round%5===0?'일본 수군장':null);}
export const hansandoVictory='한산도대첩 대승리! 이순신과 조선 수군이 학익진으로 적 선단을 격퇴했습니다. 바다를 지켜낸 기록을 천명도첩에 새겼습니다!';
export const hansandoBossQuotes:Record<string,[string,string]>={
 '일본 수군 선봉장':['조선의 배가 물러난다! 뒤를 쫓아라!','넓은 바다에 적이 기다리고 있었다!'],
 '돌격선단장':['배를 붙여라! 적선에 올라탄다!','포격이 거세다! 가까이 갈 수 없다!'],
 '조총선단장':['사거리를 좁혀라! 갑판을 제압한다!','포탄이 날아온다! 선체를 보호하라!'],
 '대선 지휘관':['큰 배를 앞세워 전열을 뚫어라!','우리 대선이 움직일 틈이 없다!'],
 '중앙 선단장':['중앙을 돌파한다! 전선을 모아라!','양옆에서 조선의 배가 다가온다!'],
 '호위 선단장':['지휘선을 지켜라! 퇴로를 확보한다!','포위망이 좁혀진다! 지휘선을 물려라!'],
 '일본 수군장':['노를 저어라! 적의 전열을 뚫는다!','배들을 수습하라! 더는 전진할 수 없다!'],
 '와키자카 야스하루':['전선을 집중하라! 포위망을 돌파한다!','이대로는 선단을 잃는다… 남은 배를 모아 후퇴하라!'],
};
export function hansandoArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이번 기록은 1592년 한산도 앞바다다. 조선 수군이 일본의 선단에 맞서고 있다.`},
 {speaker:name,text:'수평선까지 배들이 가득해! 좁은 물길에서 싸우는 거야?'},
 {speaker:'책의 정령',text:'이순신은 적을 견내량에서 넓은 바다로 유인하려 한다. 이억기와 원균의 수군도 함께하고 있다.'},
 {speaker:'이순신',text:`${name}, 신호에 맞춰 전선을 펼쳐라. 학의 날개처럼 적을 에워싸고 화력을 집중한다!`},
 {speaker:'책의 정령',text:'견내량의 유인전에서 학익진의 포위망까지 바다를 지켜라. 지도에서 전투를 선택하자. 대사와 반복 공세는 도첩의 재현이다.'},
 ][step];}
