// Historical setting; dialogue, regional divisions and recurring bosses are game fiction.
export const CHEOIN_IMAGE='/terrain/cheoin-battlefield.png';
export const cheoinFronts=[
 {id:'cheoin-approach',name:'처인부곡 길목',first:1,last:3,image:CHEOIN_IMAGE,intro:'1232년 처인부곡. 몽골군이 다가온다. 주민들을 성으로 대피시켜라!',dialogue:'서로를 도와라. 모두가 안전하게 성에 들어올 때까지 길목을 지킨다!'},
 {id:'cheoin-earthwall',name:'처인성 토성',first:4,last:6,image:CHEOIN_IMAGE,intro:'몽골군이 토성을 포위한다. 무너진 흙벽을 메우고 공세를 막아라!',dialogue:'이 성은 우리의 손으로 지킨다. 돌과 화살을 나누고 빈틈을 메워라!'},
 {id:'cheoin-palisade',name:'목책 방어선',first:7,last:9,image:CHEOIN_IMAGE,intro:'적의 공세가 목책에 집중된다. 주민들과 함께 방어선을 유지하라!',dialogue:'작은 성이라도 우리의 뜻은 꺾이지 않는다. 서로의 자리를 지켜라!'},
 {id:'cheoin-final',name:'살리타 최종전',first:10,last:10,image:CHEOIN_IMAGE,intro:'몽골 지휘관 살리타가 나타났다. 마지막 공세를 막아라!',dialogue:'끝까지 침착하라. 모두의 힘을 모아 처인성을 지켜내자!'},
];
export const cheoinEnemyNames=['몽골 보병','몽골 창병','몽골 궁병','몽골 경기병','몽골 궁기병','몽골 중기병'];
export const cheoinBossNames:Record<number,string>={10:'몽골 선봉장',20:'몽골 공성대장',30:'몽골 기병대장',40:'몽골 궁기병대장',50:'몽골 돌격대장',60:'몽골 친위대장',65:'살리타'};
export function cheoinBossName(stage:number,round:number){if(round===65)return stage===10?'살리타':null;return cheoinBossNames[round]??(round>=20&&round%5===0?'몽골 장군':null);}
export const cheoinVictory='처인성 방어 성공! 김윤후와 주민들이 몽골군의 공세를 막아냈습니다. 처인성의 항전을 천명도첩에 새겼습니다!';
export const cheoinBossQuotes:Record<string,[string,string]>={
 '몽골 선봉장':['길목을 장악하라! 작은 성을 포위한다!','주민들의 저항이 거세다! 병력을 모아라!'],
 '몽골 공성대장':['흙벽을 무너뜨려라! 공성대를 전진시킨다!','돌과 화살이 쏟아진다! 공성대를 뒤로 물려라!'],
 '몽골 기병대장':['측면을 돌아라! 성으로 드는 길을 끊는다!','길목마다 방비가 있다! 대열을 정비하라!'],
 '몽골 궁기병대장':['화살로 성 위를 제압하라!','반격이다! 거리를 벌려라!'],
 '몽골 돌격대장':['목책을 뚫어라! 일제히 돌격한다!','돌파가 막혔다! 부상병을 수습하라!'],
 '몽골 친위대장':['지휘관을 엄호하라! 마지막 공세를 준비한다!','방어선을 넘지 못했다… 지휘관을 지켜라!'],
 '몽골 장군':['전열을 모아라! 다시 공격한다!','공세를 멈추고 병력을 수습하라!'],
 '살리타':['전군 진격! 처인성의 방어선을 무너뜨려라!','이 작은 성에서… 우리의 진격이 멈추다니…'],
};
export function cheoinArrival(step:number,name:string){return [
 {speaker:'책의 정령',text:`${name}, 천명도첩이 가리키는 곳은 1232년 처인성이다. 몽골의 두 번째 고려 침입이 이어지고 있다.`},
 {speaker:name,text:'커다란 성벽도 없는데… 주민들이 직접 흙벽과 목책을 지키고 있어!'},
 {speaker:'책의 정령',text:'승려 김윤후와 처인부곡의 주민들이 함께 맞서고 있다. 작은 토성에 모인 사람들의 항전을 지켜야 한다.'},
 {speaker:'김윤후',text:`${name}, 우리와 함께해 주겠는가? 누구도 홀로 싸우게 두지 마라. 서로 돕는 것이 이 성의 힘이다.`},
 {speaker:'책의 정령',text:'길목에서 주민들을 보호하고 토성과 목책을 지켜 마지막 공세를 막아라. 지도에서 전투를 선택하자. 대사와 반복 공세는 도첩의 재현이다.'},
 ][step];}
