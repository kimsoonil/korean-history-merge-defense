import type {ChapterId} from './ansi.ts';
import {getStoryCampaign,getStoryStage,storyCampaigns} from './story-campaigns.ts';
export const FINAL_WAVE=10;
const terrainByChapter:Record<ChapterId,string[]>= {
 1:['/terrain/front-pyongyang-exterior.png'],2:['/terrain/front-yodong-exterior.png'],
 3:['/terrain/front-yodong-exterior.png','/terrain/front-pyongyang-exterior.png','/terrain/front-salsu-selected.png','/terrain/front-emperor-exterior.png'],
 4:['/terrain/ansi-battlefield.png'],5:['/terrain/hwangsan-battlefield.png'],6:['/terrain/nadang-land.png','/terrain/nadang-land.png','/terrain/nadang-coast.png','/terrain/nadang-coast.png'],
 7:['/story/arrivals-v2/cheonmunryeong.png'],8:['/terrain/gwiju-battlefield.png'],9:['/terrain/cheoin-battlefield.png'],10:['/terrain/hansando-battlefield.png','/terrain/namhan-battlefield.png','/terrain/haengju-battlefield.png','/terrain/myeongnyang-battlefield.png'],
 };
export const frontsForChapter=(chapter:ChapterId=1)=>[[1,3],[4,6],[7,9],[10,10]].map(([first,last],index)=>{const campaign=getStoryCampaign(chapter),stage=getStoryStage(chapter,first);return {id:`${campaign.slug}-${index+1}`,name:campaign.frontTitles?.[index]??(index===3?stage.title:`${stage.title} 전선`),first,last,image:terrainByChapter[chapter][index]??terrainByChapter[chapter][0],intro:stage.intro,dialogue:stage.dialogue};});
export const battleFronts=frontsForChapter(3);
export const frontForStage=(stage:number,chapter:ChapterId=1)=>frontsForChapter(chapter).find(front=>stage>=front.first&&stage<=front.last)??frontsForChapter(chapter)[0];
export const CAMPAIGN_STORAGE_KEY='salsu-campaign-v1';
export const MAP_WIDTH=3000;
export const MAP_HEIGHT=720;
export const chapterOneBattles=Array.from({length:FINAL_WAVE},(_,index)=>({
  wave:index+1,code:`1-${index+1}`,name:getStoryStage(1,index+1).title,boss:index+1===FINAL_WAVE,
}));
export const campaignNodes=storyCampaigns.map((story,index)=>({id:story.id,x:200+index*295,y:[382,245,368,530,330,270,530,280,420,530][index],name:story.title,year:story.year,terrain:'historical',setting:story.arrivalTitle,description:story.epilogue.summary,available:index===0}));
export const isChapterOneWave=(wave:number)=>Number.isInteger(wave)&&wave>=1&&wave<=FINAL_WAVE;
export const nextUnlockedWave=(cleared:number)=>Math.min(FINAL_WAVE,cleared+1);
export const isWaveUnlocked=(wave:number,cleared:number)=>isChapterOneWave(wave)&&wave<=nextUnlockedWave(cleared);
export const recordWaveClear=(cleared:number,wave:number)=>isWaveUnlocked(wave,cleared)?Math.max(cleared,wave):cleared;
export function readCampaignProgress(raw:string|null):number{
  try{const value=JSON.parse(raw??'null');return value?.version===1&&Number.isInteger(value.highestClearedWave)&&value.highestClearedWave>=0&&value.highestClearedWave<=FINAL_WAVE?value.highestClearedWave:0;}catch{return 0;}
}
export const waveEnemyCount=(wave:number)=>wave===FINAL_WAVE?23:5+wave*2;
export const waveCombatLevel=(wave:number)=>wave===FINAL_WAVE?10:wave;
export function horizontalWheelDelta(x:number,y:number,mode:number,pageWidth:number){
  const delta=Math.abs(x)>Math.abs(y)?x:y;
  return delta*(mode===1?16:mode===2?pageWidth:1);
}
