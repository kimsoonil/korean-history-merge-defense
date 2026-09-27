// Historical setting; dialogue and repeated encounters are fictional game scenes.
export const nadangYear=(stage:number)=>stage<=3?'670~674년':stage<=6?'675년':'676년';
export const nadangGuide=(stage:number)=>stage<=3?'문무왕':stage<=6?'김원술':'시득';
export const nadangFronts=[
 {id:'nadang-border',name:'신라 국경',first:1,last:3,image:'/terrain/nadang-land.png',intro:'당군의 진격이 국경을 위협한다. 신라의 방어선을 지켜라!',dialogue:'우리의 땅과 백성을 지킨다. 서로의 진영을 굳게 연결하라!'},
 {id:'nadang-maeso',name:'매소성',first:4,last:6,image:'/terrain/nadang-land.png',intro:'675년 매소성. 당군의 공세를 막고 반격의 기회를 잡아라!',dialogue:'전열을 지켜라! 적의 진격을 끊고 함께 나아간다!'},
 {id:'nadang-gibeol',name:'기벌포',first:7,last:9,image:'/terrain/nadang-coast.png',intro:'676년 기벌포. 당군의 함대가 다가온다. 강어귀를 지켜라!',dialogue:'물길을 살펴라! 육지와 배가 서로 호응해 적을 막는다!'},
 {id:'nadang-final',name:'설인귀 최종전',first:10,last:10,image:'/terrain/nadang-coast.png',intro:'기벌포의 마지막 공세. 설인귀의 선단을 막아라!',dialogue:'끝까지 흐트러지지 마라. 이 바다에서 전쟁을 끝낸다!'},
];
export const nadangEnemyNames=['당군 보병','당군 창병','당군 궁병','당군 기병','당군 수병','당군 정예병'];
export const nadangBossNames:Record<number,string>={10:'당군 선봉장',20:'당군 공성대장',30:'당군 기병대장',40:'이근행',50:'당군 수군대장',60:'기벌포 선단장',65:'설인귀'};
export function nadangBossName(stage:number,round:number){if(round===65)return stage===10?'설인귀':null;return nadangBossNames[round]??(round>=20&&round%5===0?'당군 장군':null);}
export const nadangVictory='나당전쟁 승리! 신라가 육지와 바다에서 당군의 공세를 막아냈습니다. 매소성과 기벌포의 기록을 천명도첩에 새겼습니다.';
export const nadangBossQuotes:Record<string,[string,string]>={
 '당군 선봉장':['진군하라! 신라의 방어선을 뚫어라!','방어가 굳건하다! 병력을 다시 모아라!'],
 '당군 공성대장':['공성대를 전진시켜라! 진영의 문을 열겠다!','공성대가 고립됐다! 후퇴하라!'],
 '당군 기병대장':['측면을 돌아 적의 대열을 끊어라!','길목이 막혔다! 전열을 수습하라!'],
 '이근행':['매소성의 길을 확보하라! 전군 진격!','공세가 꺾였구나… 남은 병력을 물려라!'],
 '당군 수군대장':['강어귀로 전진하라! 물길을 장악한다!','신라 수군의 반격이다! 배들을 돌려라!'],
 '기벌포 선단장':['선단을 모아라! 기벌포를 돌파한다!','대열이 무너졌다! 남은 배를 지켜라!'],
 '당군 장군':['전열을 가다듬어라! 다시 공격한다!','공세를 멈추고 병사들을 수습하라!'],
 '설인귀':['전 선단 진격! 신라의 방어선을 돌파하라!','끝내 물길을 열지 못했구나… 남은 선단을 물린다.'],
};
export function nadangArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이번 장은 670년부터 676년까지 이어진 나당전쟁이다.`},
 {speaker:name,text:'이번에는 신라가 당나라와 맞서는 거야? 육지뿐 아니라 바다에서도 싸우고 있네.'},
 {speaker:'책의 정령',text:'백제와 고구려가 무너진 뒤 당의 지배 시도에 맞서 신라가 싸우고 있다. 매소성과 기벌포의 기록을 따라가자.'},
 {speaker:'문무왕',text:`${name}, 우리와 함께 백성을 지켜 주겠는가? 국경에서 시작해 육지와 바다의 방어선을 이어야 한다.`},
 {speaker:'책의 정령',text:'지도에서 전투를 선택하자. 장군들의 대사와 반복되는 공세는 천명도첩이 재현한 전투 이야기다.'},
 ][step];}
