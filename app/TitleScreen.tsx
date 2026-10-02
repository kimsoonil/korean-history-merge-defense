'use client';
import {LoadingBackground} from './LoadingImage';
import {useEffect,useRef,useState} from 'react';
import {Apple,BookOpen,Combine,FlaskConical,House,Images,Play,Sparkles,Swords,UserRound,X} from 'lucide-react';
import {canContinue,type GameSave} from '@/lib/save';
import {isIosDevice} from '@/lib/platform';
import {useSocialAuth} from './AuthProvider';
import type {PlayerProfile} from '@/lib/player';
import {getStoryCampaign,getStoryStage} from '@/lib/story-campaigns';
import type {ChapterId} from '@/lib/ansi';

type Props={profile?:PlayerProfile|null;save:GameSave|null;ready:boolean;storageError:boolean;inert:boolean;chapter?:ChapterId;clearedStage?:number;onNew:()=>void;onContinue:()=>void;onStory?:()=>void;onCombination?:()=>void;onCodex?:()=>void;onProfile?:()=>void;onResearch?:()=>void};
const START_FLOW_KEY='khmd-start-flow-v1';
let splashSeen=false;
export default function TitleScreen({profile,save,ready,storageError,inert,chapter=1,clearedStage=0,onNew,onContinue,onStory=onNew,onCombination,onCodex,onProfile,onResearch}:Props){
 const [splash,setSplash]=useState(true);
 const [isIos,setIsIos]=useState(false),[appleNotice,setAppleNotice]=useState(false);
 const auth=useSocialAuth();
 const resumable=canContinue(save);
 const enter=()=>{splashSeen=true;try{sessionStorage.setItem(START_FLOW_KEY,'1');}catch{}setSplash(false);};
 useEffect(()=>{let pending=false;try{pending=sessionStorage.getItem(START_FLOW_KEY)==='1';}catch{}if(splashSeen||pending)setSplash(false);},[]);
 useEffect(()=>{setIsIos(isIosDevice(navigator.userAgent,navigator.platform,navigator.maxTouchPoints));},[]);
 useEffect(()=>{if(!appleNotice)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setAppleNotice(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[appleNotice]);
 const lobby=!splash&&(auth.status==='guest'||auth.status==='authenticated');
 const start=()=>{if(resumable)onContinue();else onNew();};
 const shownChapter=(resumable?(save?.chapter??1):chapter) as ChapterId;
 const shownStage=resumable?(save?.stage??1):clearedStage;
 const chapterTitle=getStoryCampaign(shownChapter).title;
 const stageTitle=shownStage>0?getStoryStage(shownChapter,shownStage).title:'첫 전장을 선택하세요';
 const activateSplash=()=>{if(splash&&ready)enter();};
 return <main className={`mobile-home ${splash?'is-splash':''} ${lobby?'is-lobby':''}`} inert={inert} role={splash?'button':undefined} tabIndex={splash?0:undefined} aria-label={splash?'화면을 터치하여 게임 시작':undefined} onClick={activateSplash} onKeyDown={event=>{if(splash&&(event.key==='Enter'||event.key===' ')){event.preventDefault();activateSplash();}}}>
  <LoadingBackground className="home-keyart" src="/cinematics/home-splash.png"/>
  <div className="home-vignette" aria-hidden="true"/>
  {!lobby&&<h1 className="home-title">한국사<span>조합 디펜스</span><i aria-hidden="true">✦</i></h1>}
  {splash?<div className="splash-entry" aria-live="polite"><p>{ready?'화면을 터치하여 시작':'게임을 준비하고 있습니다…'}</p></div>:auth.status==='loading'?<section className="home-auth-panel" aria-live="polite"><h2>로그인 확인 중</h2><p>계정 정보를 불러오고 있습니다.</p></section>:auth.status==='signedOut'?<section className="home-auth-panel" aria-label="로그인"><h2>계정으로 시작하기</h2><p>{isIos?'Google 또는 Apple 계정으로 로그인하세요.':'Google 계정으로 로그인하거나 게스트로 시작하세요.'}</p><button className="auth-google" onClick={()=>void auth.signIn('google')}><i aria-hidden="true">G</i>Google로 계속하기</button>{isIos&&<button className="auth-apple" onClick={()=>setAppleNotice(true)}><Apple size={20} fill="currentColor"/>Apple로 계속하기</button>}<button className="auth-guest" onClick={auth.continueAsGuest}><UserRound size={19}/>게스트로 시작하기</button>{auth.error&&<p className="auth-error" role="alert">{auth.error}</p>}{!auth.configured&&<p className="auth-config-note">개발 환경의 SNS 연결 설정이 필요합니다. 게스트 플레이는 바로 사용할 수 있습니다.</p>}</section>:<section className="lobby-shell" aria-label="게임 로비">
   <div className="lobby-stage-overview" aria-label="선택한 전장">
    <div className="lobby-stage-mark"><Swords/><span>{resumable?'진행 중인 전투':clearedStage>0?'클리어한 스테이지':'첫 전장'}</span>{resumable&&save?.difficulty==='hard'&&<em>하드</em>}</div>
    <div className="lobby-stage-heading"><span>{chapterTitle}</span><strong>{`${shownChapter}-${shownStage>0?shownStage:1}`}</strong></div>
    <span className="lobby-stage-title">{stageTitle}</span>
   </div>
   <nav className="lobby-side-actions" aria-label="빠른 메뉴">
    <button onClick={onStory}><BookOpen/><span>이야기</span></button>
    <button onClick={onCombination}><Combine/><span>조합서</span></button>
    <button onClick={onCodex}><Images/><span>도감</span></button>
    <button onClick={onResearch}><FlaskConical/><span>연구소</span></button>
   </nav>
   <section className="lobby-battle-card">
    {resumable&&<p>{save?.round??1}라운드부터 이어서 진행합니다.</p>}
    <button className="lobby-start" onClick={start} disabled={!ready}><Play fill="currentColor"/>게임하기</button>
   </section>
   {storageError&&<p className="home-storage-warning" role="status">저장 동기화를 확인하지 못했습니다. 이 기기에는 기록되지만 다른 기기에는 반영되지 않을 수 있습니다.</p>}
   <nav className="lobby-bottom-nav has-research" aria-label="로비 메뉴">
    <button className="active" aria-current="page"><House/><span>로비</span></button>
    <button onClick={onStory}><BookOpen/><span>이야기</span></button>
    <button onClick={onCombination}><Combine/><span>조합서</span></button>
    <button onClick={onCodex}><Images/><span>도감</span></button>
    <button onClick={onResearch}><FlaskConical/><span>연구소</span></button>
    <button onClick={onProfile}><UserRound/><span>프로필</span></button>
   </nav>
  </section>}
  {appleNotice&&<div className="auth-notice-shade" onMouseDown={event=>{if(event.target===event.currentTarget)setAppleNotice(false);}}><section className="auth-notice" role="alertdialog" aria-modal="true" aria-labelledby="apple-notice-title"><Apple size={28} fill="currentColor"/><h2 id="apple-notice-title">Apple 로그인</h2><p>준비 중입니다.</p><button autoFocus onClick={()=>setAppleNotice(false)}>확인</button></section></div>}
 </main>;
}

export function NewGameConfirm({onConfirm,onCancel}:{onConfirm:()=>void;onCancel:()=>void}){
  const rootRef=useRef<HTMLDivElement>(null),cancelRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;cancelRef.current?.focus();return()=>{if(previous?.isConnected)previous.focus();};},[]);
  return <div className="new-game-shade" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel();}}><div ref={rootRef} className="new-game-dialog" role="alertdialog" aria-modal="true" aria-labelledby="new-game-title" aria-describedby="new-game-description" onKeyDown={event=>{
    if(event.key==='Escape'){event.stopPropagation();onCancel();}
    if(event.key==='Tab'){const buttons=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);const index=buttons.indexOf(document.activeElement as HTMLButtonElement);event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}
  }}><button className="new-game-close" onClick={onCancel} aria-label="새로하기 취소"><X size={20}/></button><Sparkles size={30}/><small>A NEW CHAPTER</small><h2 id="new-game-title">새로운 방어전을 시작할까요?</h2><p id="new-game-description">저장된 진행 상황이 새 게임으로 바뀝니다.<br/>현재 전투를 계속하려면 이어하기를 선택하세요.</p><div><button ref={cancelRef} onClick={onCancel}>취소</button><button onClick={onConfirm}>새 게임 시작</button></div></div></div>;
}
