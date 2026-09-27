// The dialogue and round-by-round encounters are fictionalized game scenarios.
export const HWANGSAN_IMAGE='/terrain/hwangsan-battlefield.png';
export const hwangsanFronts=[
 {id:'hwangsan-field',name:'황산벌 들판',first:1,last:3,image:HWANGSAN_IMAGE,intro:'660년 황산벌. 백제군과 신라군이 들판에서 맞선다.',dialogue:'대열을 흐트러뜨리지 마라. 병사들을 지키며 전선을 유지하라!'},
 {id:'hwangsan-camp',name:'백제 진영',first:4,last:6,image:HWANGSAN_IMAGE,intro:'백제의 진영이 길목을 지킨다. 거듭되는 반격에 대비하라!',dialogue:'상대의 결의를 가볍게 보지 마라. 전열을 정비하고 함께 나아가라!'},
 {id:'hwangsan-braves',name:'결사대 전선',first:7,last:9,image:HWANGSAN_IMAGE,intro:'계백의 결사대가 전선을 압박한다. 끝까지 진형을 지켜라!',dialogue:'맞서는 이들 또한 이 땅의 용사다. 흔들리지 말고 맡은 자리를 지켜라!'},
 {id:'hwangsan-final',name:'계백 최종전',first:10,last:10,image:HWANGSAN_IMAGE,intro:'황산벌의 마지막 격전. 계백이 직접 군을 이끈다.',dialogue:'이 싸움의 무게를 잊지 마라. 마지막까지 병사들과 함께하라!'},
];
export const hwangsanEnemyNames=['백제 보병','백제 창병','백제 궁병','백제 기병','백제 방패병','백제 결사대'];
export const hwangsanBossNames:Record<number,string>={10:'백제 선봉장',20:'백제 방패대장',30:'충상',40:'백제 기병대장',50:'상영',60:'결사대 대장',65:'계백'};
export function hwangsanBossName(stage:number,round:number){if(round===65)return stage===10?'계백':null;return hwangsanBossNames[round]??(round>=20&&round%5===0?'백제 장군':null);}
export const hwangsanVictory='황산벌 전투 완료. 치열했던 양측 용사들의 기록을 천명도첩에 새겼습니다.';
export const hwangsanBossQuotes:Record<string,[string,string]>={
 '백제 선봉장':['길목을 지켜라! 한 걸음도 물러서지 마라!','전열을 다시 모아라… 아직 싸움은 끝나지 않았다!'],
 '백제 방패대장':['방패를 맞대라! 진영을 굳게 지켜라!','방패진에 틈이 났다! 병사들을 뒤로 물려라!'],
 '충상':['각 진영은 서로 호응하라! 황산벌의 길을 지킨다!','진영이 갈라졌다… 남은 병사들을 수습하라!'],
 '백제 기병대장':['측면을 돌아라! 적의 대열을 흔들어라!','돌파가 막혔다! 말을 돌려 전열을 정비하라!'],
 '상영':['흩어지지 마라! 서로의 등을 지켜라!','끝까지 버텼건만… 이들의 이름을 잊지 마라.'],
 '결사대 대장':['우리 뒤에는 지켜야 할 땅이 있다! 끝까지 버텨라!','우리가 지키려 했던 뜻만은… 남겨 다오.'],
 '백제 장군':['전열을 가다듬어라! 다시 맞선다!','병사들을 지켜라! 진영으로 물러난다!'],
 '계백':['백제의 용사들이여, 나와 함께 이 들판을 지킨다!','이 들판에서 끝까지 맞섰던 이들을… 잊지 말아 다오.'],
};
export function hwangsanArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 이번 기록은 660년 황산벌이다. 신라와 백제의 운명이 이 들판에서 맞부딪친다.`},
 {speaker:name,text:'양쪽 모두 이 땅을 지키려는 사람들이잖아… 이번에는 누구와 함께해야 하지?'},
 {speaker:'책의 정령',text:'이번 장에서는 김유신의 전선을 따라간다. 상대인 계백과 백제군의 결의 또한 잊지 말아라. 대사와 전투 구성은 도첩이 재현한 이야기다.'},
 {speaker:'김유신',text:`${name}, 병사들이 거듭된 싸움에 지쳐 있다. 우리와 함께 대열을 지켜 주겠는가?`},
 {speaker:'책의 정령',text:'들판에서 시작해 백제 진영과 결사대 전선을 지나 계백과의 마지막 전투로 향하자. 지도에서 전투를 선택해라.'},
 ][step];}
