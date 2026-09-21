export type LegendaryScene = {
  name: string;
  slug: string;
  title: string;
  symbol: string;
  quote: string;
  attribution: string;
  accent: string;
  durationMs: number;
};

// Only the two sourced/adapted lines are presented as historical quotations.
// The other lines are explicitly labelled original game dialogue.
export const legendaryScenes: LegendaryScene[] = [
  {name:'이순신',slug:'yi-sunsin',title:'바다를 지키는 불멸의 장군',symbol:'거북선',quote:'신에게는 아직 열두 척의 배가 남아 있습니다.',attribution:'이순신의 장계에서 · 현대어 재구성',accent:'#90e8f4',durationMs:8500},
  {name:'세종대왕',slug:'sejong',title:'백성을 비추는 스물여덟 글자',symbol:'훈민정음',quote:'나라의 말이 중국과 달라 문자와 서로 통하지 아니하니.',attribution:'훈민정음 어제 서문 · 현대어',accent:'#ffdc99',durationMs:10500},
  {name:'광개토대왕',slug:'gwanggaeto',title:'대륙에 새기는 고구려의 기상',symbol:'광개토대왕릉비',quote:'고구려의 깃발 아래, 새로운 하늘을 열어라!',attribution:'게임 창작 대사',accent:'#d3b7ff',durationMs:8000},
  {name:'을지문덕',slug:'eulji',title:'살수에 펼쳐지는 승리의 계책',symbol:'살수의 물결',quote:'살수의 물결이여, 이 땅의 방패가 되어라!',attribution:'게임 창작 대사',accent:'#8ee8dc',durationMs:8000},
  {name:'김유신',slug:'kim-yusin',title:'하나의 뜻으로 모이는 검',symbol:'신라의 보검',quote:'흩어진 뜻을 하나로! 승리의 길을 열겠다!',attribution:'게임 창작 대사',accent:'#ffe3a1',durationMs:8000},
  {name:'이성계',slug:'yi-seonggye',title:'새 시대를 여는 신궁',symbol:'신궁의 활',quote:'이 한 발에, 새 나라의 뜻을 담는다!',attribution:'게임 창작 대사',accent:'#c1efa8',durationMs:8000},
  {name:'척준경',slug:'cheok',title:'전장을 가르는 고려의 검',symbol:'검성의 검',quote:'내 검이 닿는 곳에, 물러섬은 없다!',attribution:'게임 창작 대사',accent:'#c9f0de',durationMs:8000},
  {name:'정조',slug:'jeongjo',title:'화성에 피어나는 개혁의 꿈',symbol:'수원 화성',quote:'백성을 위한 나라, 굳건한 뜻으로 지켜내겠다!',attribution:'게임 창작 대사',accent:'#b7d5ff',durationMs:8000},
];

export function findLegendaryScene(name:string) {
  return legendaryScenes.find(scene=>scene.name===name);
}

export function resumeStageDeadline(deadline:number|null, pausedAt:number, now:number) {
  return deadline===null?null:deadline+Math.max(0,now-pausedAt);
}
