import {units} from './game.ts';
import type {ChapterId} from './ansi.ts';
import {normalizeAccount,type ResearchProgress} from './research.ts';
import {normalizeHeroRecords,type HeroRecords} from './hero-records.ts';

export const PLAYER_KEY='salsu-player-v1';
export type ProfileAvatar={id:string;name:string;tier:number;src:string;x?:number;y?:number;standalone:boolean};

// Hand-tuned face centers for the current high-tier atlases. Any future tier 6/7
// unit registered in game.ts with atlas artwork is added here automatically.
const faceCenters:Record<string,[number,number]>={
 연개소문:[255,185],김춘추:[590,175],대조영:[1005,185],왕건:[1375,180],강감찬:[205,680],권율:[610,690],계백:[1005,690],장보고:[1385,670],
 이순신:[245,220],세종대왕:[590,205],광개토대왕:[1010,220],을지문덕:[1370,230],김유신:[235,715],이성계:[590,715],척준경:[1000,720],정조:[1355,695],
};
export const profileAvatars:ProfileAvatar[]=units.map(unit=>{
 const atlas=unit.atlas,center=faceCenters[unit.name]??(atlas?[atlas.col*384+192,atlas.row*512+190] as [number,number]:undefined);
 return {id:unit.name,name:unit.name,tier:unit.tier,src:atlas?.src??unit.portrait??'',...(center?{x:center[0],y:center[1]}:{}),standalone:!atlas};
});
export const defaultProfileAvatar='시민';
export type HardRewardId=`hard-${ChapterId}`;
export type PlayerProfile={version:1;nickname:string;prologueComplete:boolean;tutorialComplete?:boolean;avatar?:string;unlockedAvatars?:string[];claimedProfileRewards?:string[];hardClearReward?:boolean;unlockedTitles?:HardRewardId[];title?:HardRewardId;level?:number;xp?:number;accountGold?:number;research?:ResearchProgress;recordTickets?:number;heroRecords?:HeroRecords};
export type ProfileReward={avatar:ProfileAvatar;chapter:ChapterId;stage:number};

export const HARD_CLEAR_REWARDS:Record<ChapterId,{id:HardRewardId;story:string;title:string}>={
 1:{id:'hard-1',story:'평양성 전투',title:'평양성의 승리자'},2:{id:'hard-2',story:'고구려의 정복 전쟁',title:'영락의 계승자'},
 3:{id:'hard-3',story:'살수대첩',title:'살수의 지배자'},4:{id:'hard-4',story:'안시성 전투',title:'안시성 수호자'},
 5:{id:'hard-5',story:'황산벌 전투',title:'황산벌의 화랑'},6:{id:'hard-6',story:'나당전쟁',title:'삼국 통일의 수호자'},
 7:{id:'hard-7',story:'천문령 전투',title:'발해의 개척자'},8:{id:'hard-8',story:'고려거란 전쟁',title:'귀주의 명장'},
 9:{id:'hard-9',story:'처인성 전투',title:'처인성 수호자'},10:{id:'hard-10',story:'임진왜란',title:'난중의 영웅'},
};
const hardRewardIds=Object.values(HARD_CLEAR_REWARDS).map(reward=>reward.id);
const validHardReward=(value:unknown):value is HardRewardId=>typeof value==='string'&&hardRewardIds.includes(value as HardRewardId);
export const hardClearRewardForId=(id?:HardRewardId)=>Object.values(HARD_CLEAR_REWARDS).find(reward=>reward.id===id);

// 55 planned rewards: seven tier-one units and eight units in every tier 2–7.
// Tier 6/7 slots stay dormant until matching units are added to the game data.
export const PROFILE_REWARD_PLAN:Readonly<Record<ChapterId,Readonly<Partial<Record<number,number>>>>>= {
 1:{1:1,2:1,3:1,4:1,6:1,8:1,10:1},
 2:{1:2,2:2,4:2,6:2,8:2,10:2},
 3:{1:2,2:2,4:3,6:3,8:3,10:3},
 4:{1:3,2:3,4:3,6:3,8:4,10:4},
 5:{2:4,4:4,6:4,8:4,10:4},
 6:{2:4,4:5,6:5,8:5,10:5},
 7:{2:5,4:5,6:5,8:5,10:6},
 8:{2:6,4:6,6:6,8:6,10:6},
 9:{2:6,4:6,6:7,8:7,10:7},
 10:{2:7,4:7,6:7,8:7,10:7},
};
const validAvatar=(id:unknown):id is string=>typeof id==='string'&&profileAvatars.some(avatar=>avatar.id===id);
export function unlockedProfileIds(profile:Pick<PlayerProfile,'avatar'|'unlockedAvatars'>){
 return new Set([defaultProfileAvatar,...(profile.unlockedAvatars??[]).filter(validAvatar),...(validAvatar(profile.avatar)?[profile.avatar]:[])]);
}
export function profileRewardTier(chapter:ChapterId,stage:number){return PROFILE_REWARD_PLAN[chapter][stage]??null;}
export const profileRewardKey=(chapter:ChapterId,stage:number)=>`${chapter}-${stage}`;
export function awardStageProfile(profile:PlayerProfile,chapter:ChapterId,stage:number,random=Math.random):{profile:PlayerProfile;reward:ProfileReward|null}{
 const tier=profileRewardTier(chapter,stage),key=profileRewardKey(chapter,stage),claimed=new Set(profile.claimedProfileRewards??[]);
 if(!tier||claimed.has(key))return {profile,reward:null};
 const unlocked=unlockedProfileIds(profile),candidates=profileAvatars.filter(avatar=>avatar.tier===tier&&avatar.id!==defaultProfileAvatar&&!unlocked.has(avatar.id));
 if(!candidates.length)return {profile,reward:null};
 const avatar=candidates[Math.min(candidates.length-1,Math.floor(Math.max(0,Math.min(.999999999,random()))*candidates.length))];
 return {profile:{...profile,unlockedAvatars:[...unlocked,avatar.id],claimedProfileRewards:[...claimed,key]},reward:{avatar,chapter,stage}};
}
export function resolveProfileAvatar(id?:string){return profileAvatars.find(a=>a.id===id)??profileAvatars.find(a=>a.id===defaultProfileAvatar)!;}
export const HARD_CLEAR_TITLE=HARD_CLEAR_REWARDS[3].title;
export function awardHardClear(profile:PlayerProfile,chapterOrCleared:ChapterId|number,maybeCleared?:number):PlayerProfile{
 const legacy=maybeCleared===undefined,chapter=(legacy?3:chapterOrCleared) as ChapterId,cleared=legacy?chapterOrCleared:maybeCleared!;
 if(cleared<10)return profile;
 const id=HARD_CLEAR_REWARDS[chapter].id,titles=new Set(profile.unlockedTitles??[]);
 if(titles.has(id))return profile;
 titles.add(id);
 return {...profile,hardClearReward:true,unlockedTitles:[...titles],title:profile.title??id};
}
export function normalizeNickname(value:string){return value.normalize('NFC').trim();}
export function nicknameError(value:string){
 const name=normalizeNickname(value);
 return /^[가-힣a-zA-Z0-9_]{2,12}$/.test(name)?'':'한글·영문·숫자·밑줄로 2~12자를 입력해 주세요.';
}
export function readPlayer(raw:string|null):PlayerProfile|null{
 try{
  const value=JSON.parse(raw??'null');
  if(value?.version!==1||typeof value.nickname!=='string'||nicknameError(value.nickname)||typeof value.prologueComplete!=='boolean')return null;
  const unlocked=unlockedProfileIds({avatar:value.avatar,unlockedAvatars:Array.isArray(value.unlockedAvatars)?value.unlockedAvatars:[]});
  const claimed:string[]=Array.isArray(value.claimedProfileRewards)?value.claimedProfileRewards.filter((key:unknown):key is string=>typeof key==='string'&&/^([1-9]|10)-([1-9]|10)$/.test(key)):[];
  const avatar=validAvatar(value.avatar)&&unlocked.has(value.avatar)?value.avatar:undefined;
  const legacyReward=value.hardClearReward===true||value.title==='salsu'||value.frame==='crimson';
  const titles=new Set<HardRewardId>(Array.isArray(value.unlockedTitles)?value.unlockedTitles.filter(validHardReward):[]);
  if(legacyReward)titles.add('hard-3');
  const title=value.title==='salsu'?'hard-3':validHardReward(value.title)&&titles.has(value.title)?value.title:undefined;
  const account=normalizeAccount(value);
  const recordTickets=Number.isSafeInteger(value.recordTickets)&&value.recordTickets>=0?value.recordTickets:0;
  const heroRecords=normalizeHeroRecords(value.heroRecords);
  return {version:1,nickname:normalizeNickname(value.nickname),prologueComplete:value.prologueComplete,...(value.tutorialComplete===true?{tutorialComplete:true}:{}),...(avatar?{avatar}:{}),...(unlocked.size>1?{unlockedAvatars:[...unlocked]}:{}),...(claimed.length?{claimedProfileRewards:[...new Set(claimed)]}:{}),...(titles.size?{hardClearReward:true,unlockedTitles:[...titles],...(title?{title}:{})}:{}),...account,recordTickets,heroRecords};
 }catch{return null;}
}
export function spiritDialogue(name:string){return `마침내... 천명을 이을 자가 나타났구나. ${name}, 들리느냐? 지금 누군가에 의해 우리의 역사가 지워지고 있다! 이대로 가면 네가 사는 미래도, 네 존재도 흔적 없이 사라질 것이다!`;}
