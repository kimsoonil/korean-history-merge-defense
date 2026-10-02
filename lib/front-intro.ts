import type {ChapterId} from './ansi.ts';
import {getStoryStage} from './story-campaigns.ts';

export function frontIntro(stage:number,chapter:ChapterId=1){
 const storyStage=getStoryStage(chapter,stage);
 return {title:`${storyStage.year} · ${storyStage.title}`,lines:[storyStage.intro],speaker:storyStage.guide,text:storyStage.dialogue};
}
