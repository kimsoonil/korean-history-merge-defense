export const PLAYER_KEY='salsu-player-v1';
export type PlayerProfile={version:1;nickname:string;prologueComplete:boolean;tutorialComplete?:boolean};
export function normalizeNickname(value:string){return value.normalize('NFC').trim();}
export function nicknameError(value:string){
 const name=normalizeNickname(value);
 return /^[가-힣a-zA-Z0-9_]{2,12}$/.test(name)?'':'한글·영문·숫자·밑줄로 2~12자를 입력해 주세요.';
}
export function readPlayer(raw:string|null):PlayerProfile|null{
 try{
  const value=JSON.parse(raw??'null');
  if(value?.version!==1||typeof value.nickname!=='string'||nicknameError(value.nickname)||typeof value.prologueComplete!=='boolean')return null;
  return {version:1,nickname:normalizeNickname(value.nickname),prologueComplete:value.prologueComplete,...(value.tutorialComplete===true?{tutorialComplete:true}:{})};
 }catch{return null;}
}
export function spiritDialogue(name:string){return `마침내... 천명을 이을 자가 나타났구나. ${name}, 들리느냐? 지금 누군가에 의해 우리의 역사가 지워지고 있다! 이대로 가면 네가 사는 미래도, 네 존재도 흔적 없이 사라질 것이다!`;}
