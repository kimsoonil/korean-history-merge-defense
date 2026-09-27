import {progressKey,type ChapterId} from './ansi.ts';

// Reuse scenario-specific names so a replacement chapter gets its own story.
export const storySeenKey=(chapter:ChapterId)=>`${progressKey(chapter)}:story-seen`;
export const hasSeenStory=(raw:string|null)=>raw==='complete';
