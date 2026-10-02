import {storyCampaigns} from './story-campaigns.ts';

export const storyChapters=storyCampaigns.map(chapter=>({id:chapter.id,title:chapter.title,year:chapter.year,image:chapter.coverImage,available:true}));
