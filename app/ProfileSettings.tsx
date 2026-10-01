'use client';
import {useEffect,useRef,useState} from 'react';
import {Lock,X} from 'lucide-react';
import {HARD_CLEAR_TITLE,profileAvatars,resolveProfileAvatar,unlockedProfileIds,nicknameError,normalizeNickname,type PlayerProfile} from '@/lib/player';
import LoadingImage from './LoadingImage';
export function ProfileAvatar({avatar,frame}:{avatar?:string;frame?:'crimson'}){
 const hero=resolveProfileAvatar(avatar),crop=240;
 const style=hero.standalone?{width:'190%',height:'190%',left:'-45%',top:'-12%',objectFit:'contain' as const}:{width:`${1536/crop*100}%`,height:`${1024/crop*100}%`,left:`${50-(hero.x??768)/crop*100}%`,top:`${50-(hero.y??512)/crop*100}%`};
 return <span className={`profile-face ${frame==='crimson'?'profile-frame-crimson':''}`}><LoadingImage src={hero.src} alt={`${hero.name} 프로필 이미지`} style={style}/></span>;
}
export default function ProfileSettings({profile,onSave,onClose}:{profile:PlayerProfile;onSave:(profile:PlayerProfile)=>void;onClose:()=>void}){
 const [title,setTitle]=useState(profile.title==='salsu'),[frame,setFrame]=useState(profile.frame==='crimson');
 const root=useRef<HTMLDialogElement>(null);
 const unlocked=unlockedProfileIds(profile);
 const initial=unlocked.has(resolveProfileAvatar(profile.avatar).id)?resolveProfileAvatar(profile.avatar).id:'시민';
 const [name,setName]=useState(profile.nickname),[avatar,setAvatar]=useState(initial),[error,setError]=useState('');
 useEffect(()=>{const el=root.current;el?.showModal();return()=>el?.close();},[]);
 return <dialog ref={root} className="profile-settings" onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="profile-title">
  <header><h2 id="profile-title">프로필 설정하기</h2><button type="button" onClick={onClose} aria-label="프로필 설정 닫기"><X size={20}/></button></header>
  <form onSubmit={e=>{e.preventDefault();const message=nicknameError(name);setError(message);if(!message){onSave({...profile,nickname:normalizeNickname(name),avatar,title:profile.hardClearReward&&title?'salsu':undefined,frame:profile.hardClearReward&&frame?'crimson':undefined});onClose();}}}>
   <div className="profile-scroll-content">
   <div className="profile-preview"><ProfileAvatar avatar={avatar} frame={profile.hardClearReward&&frame?'crimson':undefined}/>{profile.hardClearReward&&title&&<strong className="reward-title">{HARD_CLEAR_TITLE}</strong>}</div>
   <label htmlFor="profile-name">이름</label><input id="profile-name" value={name} maxLength={12} autoComplete="off" onChange={e=>{setName(e.target.value);setError('');}} aria-invalid={!!error} aria-describedby={error?'profile-error':undefined}/>
   {error&&<p id="profile-error" role="alert">{error}</p>}
   <fieldset><legend>프로필 이미지 · {unlocked.size}/{profileAvatars.length}</legend><div className="profile-options">{profileAvatars.map(a=>{const available=unlocked.has(a.id);return <button type="button" key={a.id} className={available?'':'locked'} disabled={!available} aria-label={`${a.name} 프로필 ${available?'선택':'잠김'}`} aria-pressed={avatar===a.id} onClick={()=>setAvatar(a.id)}><ProfileAvatar avatar={a.id}/>{!available&&<Lock className="profile-lock" size={15}/>}<small>{available?a.name:'잠김'}</small></button>})}</div></fieldset>
   <fieldset className="profile-rewards"><legend>하드 최초 클리어 보상</legend>{profile.hardClearReward?<><label><input type="checkbox" checked={title} onChange={e=>setTitle(e.target.checked)}/> {HARD_CLEAR_TITLE} 칭호</label><label><input type="checkbox" checked={frame} onChange={e=>setFrame(e.target.checked)}/> 붉은 정복자 테두리</label></>:<p>잠김 · 살수대첩 하드 10스테이지 클리어 시 획득</p>}</fieldset>
   </div>
   <footer><button type="button" onClick={onClose}>취소</button><button type="submit">저장</button></footer>
  </form>
 </dialog>;
}
