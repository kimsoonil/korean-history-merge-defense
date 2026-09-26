export const PLAYER_KEY='salsu-player-v1';
// Face centers on the 1536×1024 hero atlases; crop each hero individually.
export const profileAvatars=[
 {id:'연개소문',name:'연개소문',tier:4,x:255,y:185},
 {id:'김춘추',name:'김춘추',tier:4,x:590,y:175},
 {id:'대조영',name:'대조영',tier:4,x:1005,y:185},
 {id:'왕건',name:'왕건',tier:4,x:1375,y:180},
 {id:'강감찬',name:'강감찬',tier:4,x:205,y:680},
 {id:'권율',name:'권율',tier:4,x:610,y:690},
 {id:'계백',name:'계백',tier:4,x:1005,y:690},
 {id:'장보고',name:'장보고',tier:4,x:1385,y:670},
 {id:'이순신',name:'이순신',tier:5,x:245,y:220},
 {id:'세종대왕',name:'세종대왕',tier:5,x:590,y:205},
 {id:'광개토대왕',name:'광개토대왕',tier:5,x:1010,y:220},
 {id:'을지문덕',name:'을지문덕',tier:5,x:1370,y:230},
 {id:'김유신',name:'김유신',tier:5,x:235,y:715},
 {id:'이성계',name:'이성계',tier:5,x:590,y:715},
 {id:'척준경',name:'척준경',tier:5,x:1000,y:720},
 {id:'정조',name:'정조',tier:5,x:1355,y:695}
];
export const defaultProfileAvatar='이순신';
export function resolveProfileAvatar(id?:string){return profileAvatars.find(a=>a.id===id)??profileAvatars.find(a=>a.id===defaultProfileAvatar)!;}
export type PlayerProfile={version:1;nickname:string;prologueComplete:boolean;tutorialComplete?:boolean;avatar?:string;hardClearReward?:boolean;title?:'salsu';frame?:'crimson'};
export const HARD_CLEAR_TITLE='살수의 지배자';
export function awardHardClear(profile:PlayerProfile,cleared:number):PlayerProfile{
 return cleared>=10&&!profile.hardClearReward?{...profile,hardClearReward:true,title:'salsu',frame:'crimson'}:profile;
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
  return {version:1,nickname:normalizeNickname(value.nickname),prologueComplete:value.prologueComplete,...(value.tutorialComplete===true?{tutorialComplete:true}:{}),...(profileAvatars.some(a=>a.id===value.avatar)?{avatar:value.avatar}:{}),...(value.hardClearReward===true?{hardClearReward:true,...(value.title==='salsu'?{title:'salsu' as const}:{}),...(value.frame==='crimson'?{frame:'crimson' as const}:{})}:{})};
 }catch{return null;}
}
export function spiritDialogue(name:string){return `마침내... 천명을 이을 자가 나타났구나. ${name}, 들리느냐? 지금 누군가에 의해 우리의 역사가 지워지고 있다! 이대로 가면 네가 사는 미래도, 네 존재도 흔적 없이 사라질 것이다!`;}
