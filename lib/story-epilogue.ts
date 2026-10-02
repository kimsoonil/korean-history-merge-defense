import type {ChapterId} from './ansi.ts';
import {getStoryCampaign} from './story-campaigns.ts';

export const SALSU_EPILOGUE_IMAGE='/story/salsu-victory.png';
export const EPILOGUE_RETURN_IMAGE='/story/history-return.png';
export type EpiloguePage={speaker:string;text:string};
export type EpilogueMeta={title:string;year:string;heading:string;summary:string;image:string};
export const STORY_EPILOGUE_IMAGES=Array.from({length:10},(_,index)=>getStoryCampaign((index+1) as ChapterId).epilogue.image);
export function storyEpilogueMeta(chapter:ChapterId):EpilogueMeta{const campaign=getStoryCampaign(chapter);return {title:campaign.title,year:campaign.year,heading:campaign.epilogue.heading,summary:campaign.epilogue.summary,image:campaign.epilogue.image};}
export function storyEpilogue(chapter:ChapterId,nickname:string):EpiloguePage[]{return getStoryCampaign(chapter).epilogue.pages(nickname);}
