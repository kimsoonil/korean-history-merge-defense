import {PROFILE_REWARD_PLAN,profileAvatars,type PlayerProfile} from './player.ts';

export const ADMIN_COMPLETE_PROGRESS=10;
export const ADMIN_NICKNAME='관리자';
export const ADMIN_CHAPTERS=[1,2,3,4,5,6,7,8,9,10] as const;

export const ADMIN_PROGRESS_KEYS=[
 'salsu-campaign-v1','ansi-campaign-v1','hwangsan-campaign-v1','nadang-campaign-v1','gwiju-campaign-v1','cheoin-campaign-v1','hansando-campaign-v1','haengju-campaign-v1','myeongnyang-campaign-v1','noryang-campaign-v1',
 'salsu-hard-campaign-v1','ansi-hard-campaign-v1','hwangsan-hard-campaign-v1','nadang-hard-campaign-v1','gwiju-hard-campaign-v1','cheoin-hard-campaign-v1','hansando-hard-campaign-v1','haengju-hard-campaign-v1','myeongnyang-hard-campaign-v1','noryang-hard-campaign-v1',
] as const;

const normalizeEmail=(value:string|undefined|null)=>value?.trim().toLowerCase()??'';

export function isAdminAccount(userEmail:string|undefined|null,adminEmail:string|undefined){
 const configured=normalizeEmail(adminEmail);
 return configured.length>0&&normalizeEmail(userEmail)===configured;
}

export function adminPlayerProfile(existing:PlayerProfile|null):PlayerProfile{
 const claimed=Object.entries(PROFILE_REWARD_PLAN).flatMap(([chapter,stages])=>Object.keys(stages).map(stage=>`${chapter}-${stage}`));
 return {...(existing??{}),version:1,nickname:ADMIN_NICKNAME,prologueComplete:true,tutorialComplete:true,unlockedAvatars:profileAvatars.map(avatar=>avatar.id),claimedProfileRewards:claimed};
}

export const adminProgressValue=()=>JSON.stringify({version:1,highestClearedWave:ADMIN_COMPLETE_PROGRESS});
