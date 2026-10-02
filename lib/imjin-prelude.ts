import {hansandoArrival} from './hansando.ts';
import {haengjuArrival} from './haengju.ts';
import {myeongnyangArrival} from './myeongnyang.ts';
import type {StoryDialogue} from './story-campaigns.ts';

export type ImjinPrelude={title:string;year:string;image:string;pages:StoryDialogue[]};

export const IMJIN_PRELUDE_STAGES=[1,4,7,10] as const;
export const isImjinPreludeStage=(stage:number)=>IMJIN_PRELUDE_STAGES.includes(stage as (typeof IMJIN_PRELUDE_STAGES)[number]);

const IMJIN_STORY_IMAGES={
 hansando:'/story/epilogues/hansando-victory.jpg',
 jinju:'/story/arrivals-v2/imjin-war.png',
 haengju:'/story/epilogues/haengju-victory.jpg',
 myeongnyang:'/story/epilogues/myeongnyang-victory.jpg',
} as const;

const withExchange=(arrival:(step:number,name:string)=>StoryDialogue|undefined,name:string,enemy:string,threat:string,reply:string):StoryDialogue[]=>[
 arrival(0,name)!,arrival(1,name)!,arrival(2,name)!,arrival(3,name)!,
 {speaker:enemy,text:threat},
 {speaker:arrival(3,name)!.speaker,text:reply},
 arrival(4,name)!,
];

export function imjinPrelude(stage:number,name:string):ImjinPrelude{
 if(stage<=3)return {title:'한산도 대첩',year:'1592년',image:IMJIN_STORY_IMAGES.hansando,pages:withExchange(hansandoArrival,name,'와키자카 야스하루','조선 수군이 물러난다! 전 선단은 견내량을 빠져나가 끝까지 추격하라!','적이 넓은 바다로 들어왔다. 거북선을 선두에 세우고 학익진의 양 날개를 펼쳐라!')};
 if(stage<=6)return {title:'진주성 대첩',year:'1592년',image:IMJIN_STORY_IMAGES.jinju,pages:[
  {speaker:'책의 정령',text:`${name}, 이번 기록은 1592년 진주성이다. 김시민과 3,800여 명의 군민이 약 2만 명의 일본군을 맞이하고 있다.`},
  {speaker:name,text:'성 아래를 가득 메운 병력이 저렇게 많은데도 모두 자리를 지키고 있어.'},
  {speaker:'책의 정령',text:'진주성이 무너지면 전라도로 향하는 길이 열린다. 화포와 활, 성벽의 지형을 이용해 공세를 견뎌야 한다.'},
  {speaker:'김시민',text:`${name}, 병력의 수만 보지 마라. 성 안의 군사와 백성이 하나로 움직이면 반드시 막을 수 있다.`},
  {speaker:'일본군 공성대장',text:'사다리를 세우고 성문을 부숴라! 수적 우세로 진주성을 단숨에 점령한다!'},
  {speaker:'김시민',text:'화포는 공성대에 집중하고 궁수는 성벽을 지켜라. 적이 한 발도 성안에 들이지 못하게 하라!'},
  {speaker:'책의 정령',text:'성문과 성벽을 지킨 뒤 김시민의 반격으로 진주성의 방어전을 완성하자.'},
 ]};
 if(stage<=9)return {title:'행주대첩',year:'1593년',image:IMJIN_STORY_IMAGES.haengju,pages:withExchange(haengjuArrival,name,'우키타 히데이에','병력을 산 아래에 집중하라! 목책을 무너뜨리고 행주산성의 본진을 점령한다!','승병과 의병, 백성이 함께 이 산성을 지킨다. 화차와 총통을 준비하고 끝까지 자리를 지켜라!')};
 return {title:'명량대첩',year:'1597년',image:IMJIN_STORY_IMAGES.myeongnyang,pages:withExchange(myeongnyangArrival,name,'구루시마 미치후사','조선에는 겨우 열세 척뿐이다! 전 함대가 좁은 해협을 밀어붙여 적의 지휘선을 포위하라!','필사즉생 필생즉사. 울돌목의 물살이 바뀌는 순간 모든 화포를 집중한다!')};
}
