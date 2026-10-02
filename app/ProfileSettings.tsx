'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Lock,X} from 'lucide-react';
import {hardClearRewardForId,profileAvatars,resolveProfileAvatar,unlockedProfileIds,nicknameError,normalizeNickname,type HardRewardId,type PlayerProfile} from '@/lib/player';
import LoadingImage from './LoadingImage';

export function ProfileAvatar({avatar}:{avatar?:string}){
 const hero=resolveProfileAvatar(avatar),crop=240;
 const style=hero.standalone?{width:'190%',height:'190%',left:'-45%',top:'-12%',objectFit:'contain' as const}:{width:`${1536/crop*100}%`,height:`${1024/crop*100}%`,left:`${50-(hero.x??768)/crop*100}%`,top:`${50-(hero.y??512)/crop*100}%`};
 return <span className="profile-face"><LoadingImage src={hero.src} alt={`${hero.name} 프로필 이미지`} style={style}/></span>;
}

export default function ProfileSettings({profile,onSave,onClose}:{profile:PlayerProfile;onSave:(profile:PlayerProfile)=>void;onClose:()=>void}){
 const unlockedTitles=profile.unlockedTitles??[];
 const [title,setTitle]=useState<HardRewardId|undefined>(profile.title&&unlockedTitles.includes(profile.title)?profile.title:undefined);
 const [tab,setTab]=useState<'profile'|'title'>('profile');
 const root=useRef<HTMLDialogElement>(null),unlocked=unlockedProfileIds(profile);
 const initial=unlocked.has(resolveProfileAvatar(profile.avatar).id)?resolveProfileAvatar(profile.avatar).id:'시민';
 const [name,setName]=useState(profile.nickname),[avatar,setAvatar]=useState(initial),[error,setError]=useState('');
 useEffect(()=>{const el=root.current;el?.showModal();return()=>el?.close();},[]);
 const selectedTitle=hardClearRewardForId(title);
 const rewardDescription=(reward:ReturnType<typeof hardClearRewardForId>)=>reward?`${reward.story} 하드 최초 클리어 보상`:'';
 return <dialog ref={root} className="profile-settings" onCancel={event=>{event.preventDefault();onClose();}} aria-labelledby="profile-title">
  <header><h2 id="profile-title">프로필 설정하기</h2><button type="button" onClick={onClose} aria-label="프로필 설정 닫기"><X size={20}/></button></header>
  <nav className="profile-tabs" role="tablist" aria-label="프로필 설정 분류">
   <button type="button" role="tab" id="profile-tab" aria-controls="profile-panel" aria-selected={tab==='profile'} className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}>프로필</button>
   <button type="button" role="tab" id="title-tab" aria-controls="title-panel" aria-selected={tab==='title'} className={tab==='title'?'active':''} onClick={()=>setTab('title')}>칭호</button>
  </nav>
  <form onSubmit={event=>{event.preventDefault();const message=nicknameError(name);setError(message);if(!message){onSave({...profile,nickname:normalizeNickname(name),avatar,title});onClose();}}}>
   <div className="profile-tab-panels">
    {tab==='profile'&&<section id="profile-panel" className="profile-tab-panel profile-main-panel" role="tabpanel" aria-labelledby="profile-tab">
     <div className="profile-preview"><div><ProfileAvatar avatar={avatar}/><span className="profile-preview-identity">{selectedTitle&&<small className="reward-title">{selectedTitle.title}</small>}<strong>{normalizeNickname(name)||profile.nickname}</strong></span></div></div>
     <label htmlFor="profile-name">이름</label><input id="profile-name" value={name} maxLength={12} autoComplete="off" onChange={event=>{setName(event.target.value);setError('');}} aria-invalid={!!error} aria-describedby={error?'profile-error':undefined}/>
     {error&&<p id="profile-error" role="alert">{error}</p>}
     <fieldset className="profile-avatar-fieldset"><legend>프로필 이미지 · {unlocked.size}/{profileAvatars.length}</legend><div className="profile-avatar-scroll"><div className="profile-options">{profileAvatars.map(option=>{const available=unlocked.has(option.id);return <button type="button" key={option.id} className={available?'':'locked'} disabled={!available} aria-label={`${option.name} 프로필 ${available?'선택':'잠김'}`} aria-pressed={avatar===option.id} onClick={()=>setAvatar(option.id)}><ProfileAvatar avatar={option.id}/>{!available&&<Lock className="profile-lock" size={15}/>}<small>{available?option.name:'잠김'}</small></button>})}</div></div></fieldset>
    </section>}
    {tab==='title'&&<section id="title-panel" className="profile-tab-panel profile-collection-panel" role="tabpanel" aria-labelledby="title-tab"><h3>칭호</h3>{unlockedTitles.length?<><div className="profile-reward-list"><button type="button" className={!title?'selected':''} onClick={()=>setTitle(undefined)}><span>사용 안 함</span>{!title&&<Check size={17}/>}</button>{unlockedTitles.map(id=>{const reward=hardClearRewardForId(id);return reward&&<button type="button" key={id} className={title===id?'selected':''} onClick={()=>setTitle(id)}><span>{reward.title}</span>{title===id&&<Check size={17}/>}</button>})}</div><p className="profile-reward-description">{rewardDescription(selectedTitle)}</p></>:<div className="profile-empty"><Lock size={24}/><b>보유한 칭호가 없습니다.</b></div>}</section>}
   </div>
   <footer><button type="button" onClick={onClose}>취소</button><button type="submit">저장</button></footer>
  </form>
 </dialog>;
}
