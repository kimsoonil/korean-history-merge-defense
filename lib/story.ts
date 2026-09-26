import {byName,type Soldier} from './game.ts';
export const STORY_KEY='salsu-yodong-tutorial-v1';
export const TUTORIAL_HERO='온달';
export const TUTORIAL_RECIPE=byName[TUTORIAL_HERO].recipe!;
export type StoryProgress={step:number;summoned:number;merged:boolean};
export const freshStory=():StoryProgress=>({step:0,summoned:0,merged:false});
export function storyRoster(progress:StoryProgress):Soldier[]{
 return progress.merged?[{id:5,name:TUTORIAL_HERO,slot:8}]:TUTORIAL_RECIPE.slice(0,progress.summoned).map((name,index)=>({id:index+1,name,slot:17+index}));
}
export const storyGold=(progress:StoryProgress)=>400-progress.summoned*50;
export function advanceStory(progress:StoryProgress):StoryProgress{
 if(progress.step===6&&progress.summoned<TUTORIAL_RECIPE.length||progress.step===9&&!progress.merged)return progress;
 return {...progress,step:Math.min(12,progress.step+1)};
}
export function recruitTutorial(progress:StoryProgress):StoryProgress{
 if(progress.step!==6||progress.summoned>=TUTORIAL_RECIPE.length)return progress;
 return {...progress,summoned:progress.summoned+1};
}
export function mergeTutorial(progress:StoryProgress):StoryProgress{
 if(progress.step!==9||progress.summoned!==TUTORIAL_RECIPE.length||progress.merged)return progress;
 return {...progress,merged:true};
}
export function readStory(raw:string|null):StoryProgress{
 try{
  const p=JSON.parse(raw??'null');
  if(!p||!Number.isInteger(p.step)||p.step<0||p.step>12||!Number.isInteger(p.summoned)||p.summoned<0||p.summoned>TUTORIAL_RECIPE.length||typeof p.merged!=='boolean')return freshStory();
  if(p.step<6&&p.summoned!==0||p.step>6&&p.summoned!==TUTORIAL_RECIPE.length||p.step<9&&p.merged||p.step>9&&!p.merged)return freshStory();
  return {step:p.step,summoned:p.summoned,merged:p.merged};
 }catch{return freshStory();}
}
export function storyDialogue(step:number,name:string){
 const dialogue=[
  ['시공간의 균열','서책의 빛 너머에서, 바람과 전장의 함성이 들려옵니다.'],
  [`플레이어 · ${name}`,'(바닥에 구르며) 아야야... 여긴 어디지? 저 거대한 성벽은 뭐고, 저 아래 몰려오는 수많은 군대는 또 뭐야?!'],
  ['책의 정령','여기는 서기 612년 고구려의 요동성이다! 원래대로라면 고구려군이 수나라의 113만 대군을 단단히 막아내야 하거늘... 시공간의 균열로 방어선이 무너지고 있다!'],
  ['을지문덕 장군','(숨을 몰아쉬며 부하들에게) 적들의 공세가 심상치 않다! 병사들이 밀리고 있구나. 정녕 요동성이 이대로 함락되는 것인가...!'],
  ['책의 정령',`${name}! 네 손에 쥔 유물 '천명도첩'의 힘을 써라! 역사의 균열을 막기 위해 시대를 초월한 위인들의 영혼을 소환하는 거다!`],
  [`플레이어 · ${name}`,'서, 서책이 빛나고 있어...! 어떻게 하는 건데? 일단 소환!! 얍!!'],
  ['천명도첩 · 병사 모집','병사 모집을 네 번 눌러 온달의 조합 재료를 모으세요. 튜토리얼에서만 재료가 정해진 순서로 등장합니다.'],
  ['책의 정령',"잘했다! 하지만 기본 병사들만으로는 저 무지막지한 수나라 대군을 막을 수 없다. '천명도첩'의 진정한 능력은 [영웅 조합]이다! 같은 기운을 가진 병사들을 하나로 합쳐 상위 등급의 영웅으로 진화시켜라!"],
  [`플레이어 · ${name}`,'좋아, 밑져야 본전이다! 병사들을 하나로 융합한다! 나와라, 영웅들이여!!'],
  ['천명도첩 · 영웅 조합','조합서를 열어 창병 2명, 기병 1명, 포수 1명을 온달로 조합하세요. 이후 전투에서도 같은 조합식을 사용합니다.'],
  ['을지문덕 장군','(플레이어 쪽을 보며 경악하며) 저 자는 누구인가...? 미래의 복식을 한 자가 시대를 알 수 없는 기이하고 강력한 영웅들을 소환해 아군을 돕고 있구나! 천우신조로다!'],
  ['중앙 시스템 메시지','[Stage 1: 수나라 침공 — 살수대첩] 1라운드가 시작됩니다! 수나라 군사다! 막아라!'],
  [`플레이어 · ${name}`,`좋아, 가보자고! 내 이름은 ${name}, 대한민국의 역사는 내가 지킨다!`],
 ];
 return {speaker:dialogue[step][0],text:dialogue[step][1]};
}
