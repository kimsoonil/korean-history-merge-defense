import {HARD_CLEAR_REWARDS,PROFILE_REWARD_PLAN,profileAvatars,type PlayerProfile} from './player.ts';
import {progressKey,type ChapterId} from './ansi.ts';
import {researchNodes} from './research.ts';

export const ADMIN_COMPLETE_PROGRESS=10;
export const ADMIN_NICKNAME='관리자';
export const ADMIN_CHAPTERS=[1,2,3,4,5,6,7,8,9,10] as const;

export const ADMIN_PROGRESS_KEYS=ADMIN_CHAPTERS.flatMap(chapter=>[
 progressKey(chapter as ChapterId),progressKey(chapter as ChapterId,true),
]);

const normalizeEmail=(value:string|undefined|null)=>value?.trim().toLowerCase()??'';

export function isAdminAccount(userEmail:string|undefined|null,adminEmail:string|undefined){
 const configured=normalizeEmail(adminEmail);
 return configured.length>0&&normalizeEmail(userEmail)===configured;
}

export function adminPlayerProfile(existing:PlayerProfile|null):PlayerProfile{
 const claimed=Object.entries(PROFILE_REWARD_PLAN).flatMap(([chapter,stages])=>Object.keys(stages).map(stage=>`${chapter}-${stage}`));
 const rewards=Object.values(HARD_CLEAR_REWARDS).map(reward=>reward.id);
 const base={...(existing??{})} as PlayerProfile&{unlockedFrames?:unknown;frame?:unknown};
 delete base.unlockedFrames;delete base.frame;
 return {...base,version:1,nickname:ADMIN_NICKNAME,prologueComplete:true,tutorialComplete:true,level:70,xp:0,accountGold:Math.max(existing?.accountGold??0,100000),research:Object.fromEntries(researchNodes.map(node=>[node.id,1])),unlockedAvatars:profileAvatars.map(avatar=>avatar.id),claimedProfileRewards:claimed,hardClearReward:true,unlockedTitles:rewards,title:existing?.title??rewards[0]};
}

export const adminProgressValue=()=>JSON.stringify({version:1,highestClearedWave:ADMIN_COMPLETE_PROGRESS});
