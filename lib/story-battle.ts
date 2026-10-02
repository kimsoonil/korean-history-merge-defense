import type {ChapterId} from './ansi.ts';
import {getStoryCampaign,getStoryStage} from './story-campaigns.ts';

export type StoryBattle={faction:string;enemyNames:readonly [string,string,string,string,string,string];naval?:boolean};

const battles:Record<ChapterId,StoryBattle>={
 1:{faction:'고구려군',enemyNames:['고구려 보병','고구려 창병','고구려 궁병','고구려 기병','고구려 성벽수비대','고구려 친위군']},
 2:{faction:'연합 적군',enemyNames:['백제 수비병','왜군 선봉','가야 철갑병','거란 기병','후연 정예병','동부여 친위군']},
 3:{faction:'수나라군',enemyNames:['수나라 보병','수나라 창병','수나라 궁병','수나라 기병','수나라 공성병','수나라 정예군']},
 4:{faction:'당나라군',enemyNames:['당나라 보병','당나라 창병','당나라 궁병','당나라 기병','당나라 공성병','당나라 정예군']},
 5:{faction:'백제군',enemyNames:['백제 보병','백제 창병','백제 궁병','백제 기병','백제 결사대','백제 친위군']},
 6:{faction:'당나라군',enemyNames:['당군 보병','당군 창병','당군 궁병','당군 기병','당군 수군','당군 정예군']},
 7:{faction:'주나라 추격군',enemyNames:['주나라 보병','주나라 창병','주나라 궁병','주나라 기병','주나라 추격대','주나라 정예군']},
 8:{faction:'거란군',enemyNames:['거란 보병','거란 창병','거란 궁병','거란 기병','거란 공성병','거란 정예군']},
 9:{faction:'몽골군',enemyNames:['몽골 보병','몽골 창병','몽골 궁병','몽골 기병','몽골 공성병','몽골 정예군']},
 10:{faction:'일본군',enemyNames:['일본 보병','일본 창병','일본 궁병','일본 기병','일본 전선','일본 정예선'],naval:true},
};

const salsuBosses:Record<number,string>={10:'수나라 선봉장',20:'수나라 공성대장',30:'우문술',40:'내호아',50:'우중문',60:'우중문 & 우문술'};
export const storyBattle=(chapter:ChapterId)=>battles[chapter];
export const storyEnemyNames=(chapter:ChapterId)=>battles[chapter].enemyNames;
export function storyBossName(chapter:ChapterId,stage:number,round:number){
 const finalRound=20+(stage-1)*5;
 if(round===finalRound)return stage===10?getStoryCampaign(chapter).finalBoss:`${getStoryStage(chapter,stage).title} 지휘관`;
 if(chapter===3&&salsuBosses[round])return salsuBosses[round];
 if(round===10||round>=20&&round%5===0)return `${battles[chapter].faction} 장군`;
 return null;
}
export const allStoryEnemyNames=Object.values(battles).flatMap(battle=>[...battle.enemyNames]);
export const allStoryBossNames=Array.from({length:10},(_,chapterIndex)=>Array.from({length:10},(_,stageIndex)=>{
 const stage=stageIndex+1,total=20+stageIndex*5;
 return Array.from({length:total},(_,roundIndex)=>storyBossName((chapterIndex+1) as ChapterId,stage,roundIndex+1)).filter((name):name is string=>!!name);
}).flat()).flat();

export function storyBossDialogue(chapter:ChapterId,stage:number,name:string,defeated:boolean){
 const story=getStoryCampaign(chapter),stageData=getStoryStage(chapter,stage);
 if(name===story.finalBoss)return defeated?story.epilogue.pages('플레이어')[1].text:`${stageData.title}의 운명은 이 전투에서 결정된다. 전군, 마지막 공세를 시작하라!`;
 return defeated?`${stageData.title}의 방어를 뚫지 못했다. 남은 병력을 수습해 물러난다.`:`${stageData.title}을 돌파하라! ${battles[chapter].faction}의 진격을 멈추지 마라!`;
}
