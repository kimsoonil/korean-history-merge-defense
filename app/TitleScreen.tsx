'use client';
import {LoadingBackground} from './LoadingImage';
import {useEffect,useRef,useState} from 'react';
import {Apple,Sparkles,X,UserRound} from 'lucide-react';
import {canContinue,type GameSave} from '@/lib/save';
import {useSocialAuth} from './AuthProvider';

type Props={save:GameSave|null;ready:boolean;storageError:boolean;inert:boolean;onNew:()=>void;onContinue:()=>void};
const START_FLOW_KEY='khmd-start-flow-v1';
let splashSeen=false;
export default function TitleScreen({save,ready,storageError,inert,onNew,onContinue}:Props){
 const [splash,setSplash]=useState(true);
 const auth=useSocialAuth();
 const launchedRef=useRef(false);
 const resumable=canContinue(save);
 const enter=()=>{splashSeen=true;try{sessionStorage.setItem(START_FLOW_KEY,'1');}catch{}setSplash(false);};
 useEffect(()=>{let pending=false;try{pending=sessionStorage.getItem(START_FLOW_KEY)==='1';}catch{}if(splashSeen||pending)setSplash(false);},[]);
 useEffect(()=>{
  if(splash||!ready||launchedRef.current||(auth.status!=='guest'&&auth.status!=='authenticated'))return;
  launchedRef.current=true;try{sessionStorage.removeItem(START_FLOW_KEY);}catch{}
  if(resumable)onContinue();else onNew();
 },[splash,ready,auth.status,resumable,onContinue,onNew]);
 return <main className={`mobile-home ${splash?'is-splash':''}`} inert={inert}>
  <LoadingBackground className="home-keyart" src="/cinematics/home-splash.png"/>
  <div className="home-vignette" aria-hidden="true"/>
  <h1 className="home-title">한국사<span>조합 디펜스</span><i aria-hidden="true">✦</i></h1>
  {splash?<div className="splash-entry"><button onClick={enter} disabled={!ready}>{ready?'게임 시작':'준비 중…'}</button></div>:auth.status==='loading'?<section className="home-auth-panel" aria-live="polite"><h2>로그인 확인 중</h2><p>계정 정보를 불러오고 있습니다.</p></section>:auth.status==='signedOut'?<section className="home-auth-panel" aria-label="로그인"><h2>계정으로 시작하기</h2><p>Google 또는 Apple 계정으로 로그인하세요.</p><button className="auth-google" onClick={()=>void auth.signIn('google')}><i aria-hidden="true">G</i>Google로 계속하기</button><button className="auth-apple" onClick={()=>void auth.signIn('apple')}><Apple size={20} fill="currentColor"/>Apple로 계속하기</button><button className="auth-guest" onClick={auth.continueAsGuest}><UserRound size={19}/>게스트로 시작하기</button>{auth.error&&<p className="auth-error" role="alert">{auth.error}</p>}{!auth.configured&&<p className="auth-config-note">개발 환경의 SNS 연결 설정이 필요합니다. 게스트 플레이는 바로 사용할 수 있습니다.</p>}</section>:<section className="home-auth-panel home-auth-resume" aria-live="polite"><h2>{resumable?'저장된 전투 불러오는 중':'새로운 여정 준비 중'}</h2><p>{resumable?'마지막 진행 지점으로 이동합니다.':'이야기 선택 화면으로 이동합니다.'}</p>{storageError&&<p className="home-storage-warning" role="status">저장이 불가능합니다. 창을 닫으면 진행 기록이 사라질 수 있습니다.</p>}</section>}
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
