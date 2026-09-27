// Historical setting; dialogue and the ten defense missions are game dramatization.
export const NORYANG_IMAGE='/terrain/noryang-battlefield.png';
export const noryangFronts=[
 {id:'noryang-strait',name:'노량 해협',first:1,last:3,image:NORYANG_IMAGE,intro:'1598년 노량. 퇴각하는 일본 수군을 막아라!',dialogue:'해협의 길목을 지켜라. 함대의 간격을 유지하고 포격을 준비하라!'},
 {id:'noryang-alliance',name:'조명 연합전선',first:4,last:6,image:NORYANG_IMAGE,intro:'조선과 명의 연합함대가 적선을 맞이한다!',dialogue:'연합함대와 호응하라. 서로의 빈틈을 지키며 적의 돌파를 막는다!'},
 {id:'noryang-gwaneumpo',name:'관음포 격전',first:7,last:9,image:NORYANG_IMAGE,intro:'관음포로 몰린 적 함대. 마지막까지 전열을 지켜라!',dialogue:'물길을 살피고 포화를 집중하라. 흩어진 아군 함선을 보호하라!'},
 {id:'noryang-final',name:'노량 최종전',first:10,last:10,image:NORYANG_IMAGE,intro:'긴 전쟁의 마지막 바다. 시마즈 함대의 돌파를 저지하라!',dialogue:'끝까지 대열을 지켜라. 이 바다에서 우리의 백성과 동료들을 지킨다!'},
];
export const noryangEnemyNames=['노량 일본 정찰선','노량 일본 수송선','노량 일본 궁병선','노량 일본 조총선','노량 일본 전투선','노량 일본 정예선'];
export const noryangBossNames:Record<number,string>={10:'노량 선봉 함장',20:'노량 돌격 함장',30:'노량 조총선 지휘관',40:'노량 구원함대 지휘관',50:'관음포 돌파대장',60:'노량 정예함대 지휘관',65:'시마즈 요시히로'};
export function noryangBossName(stage:number,round:number){if(round===65)return stage===10?'시마즈 요시히로':null;return noryangBossNames[round]??(round>=20&&round%5===0?'노량 일본 함장':null);}
export const noryangVictory='노량해전 승리! 조명 연합함대가 일본 수군을 격파했습니다. 마지막 바다에서 전사한 이순신과 장병들의 희생을 기억합니다. 이 전투와 대사는 역사에 바탕을 둔 게임적 재구성입니다.';
export const noryangBossQuotes:Record<string,[string,string]>={
 '노량 선봉 함장':['해협을 열어라! 앞을 가로막는 함선을 밀어내라!','포화가 거세다! 선두를 물려라!'],
 '노량 돌격 함장':['간격을 좁혀라! 적의 전열을 뚫는다!','돌파가 막혔다! 함선을 돌려라!'],
 '노량 조총선 지휘관':['가까이 붙어라! 갑판을 향해 일제 사격!','적의 함포 사거리에서 벗어나라!'],
 '노량 구원함대 지휘관':['퇴각로를 확보하라! 아군 함대를 구한다!','연합함대가 길목을 막았다! 물러나라!'],
 '관음포 돌파대장':['포구에 갇힐 수 없다! 바깥 물길로 돌파하라!','길이 막혔다! 남은 함선을 모아라!'],
 '노량 정예함대 지휘관':['마지막 전열이다! 퇴로를 사수하라!','함대가 흩어진다! 후퇴 신호를 올려라!'],
 '노량 일본 함장':['전진하라! 해협을 빠져나간다!','전열을 수습하라! 더는 버틸 수 없다!'],
 '시마즈 요시히로':['모든 함선은 돌파에 집중하라! 이 해협을 벗어나야 한다!','남은 함선을 이끌고 퇴각한다! 더 이상의 희생을 막아라!'],
};
export function noryangArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이곳은 1598년 노량 해협이다. 긴 전쟁의 끝에서 조선과 명의 연합함대가 일본 수군을 맞이하고 있다.`},
 {speaker:name,text:'어둠 속에 함선들이 가득해… 저 포성과 불빛 너머에서 마지막 싸움이 시작되는 거야?'},
 {speaker:'책의 정령',text:'이순신과 진린의 함대가 힘을 모았다. 일본 함대의 돌파에 맞서 해협과 관음포의 물길을 지켜야 한다.'},
 {speaker:'이순신',text:`${name}, 아군의 대열을 지켜 주게. 물길을 살피고 서로를 도우며 끝까지 싸워야 하네.`},
 {speaker:'책의 정령',text:'노량해전은 승리로 끝났지만 이순신과 많은 장병이 전사했다. 그 희생을 기억하자. 이제 해협의 전선을 선택하자. 임무와 대사는 게임적 재구성이다.'},
 ][step];}
