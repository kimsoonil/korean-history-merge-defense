'use client';
import {LoadingBackground} from './LoadingImage';
import {useEffect,useRef,useState} from 'react';
import {Images,Play,Sparkles,X,Settings,ScrollText,UserRound} from 'lucide-react';
import {canContinue,type GameSave} from '@/lib/save';

type Props={onProfile:()=>void;onPrologue:()=>void;save:GameSave|null;ready:boolean;storageError:boolean;inert:boolean;onNew:()=>void;onContinue:()=>void;onCodex:()=>void};
let splashSeen=false;
export default function TitleScreen({onProfile,onPrologue,save,ready,storageError,inert,onNew,onContinue,onCodex}:Props){
 const [splash,setSplash]=useState(true);
 const [settings,setSettings]=useState(false);
 const settingsRef=useRef<HTMLDivElement>(null);
 const resumable=canContinue(save);
 const enter=()=>{splashSeen=true;setSplash(false);};
 useEffect(()=>{if(splashSeen)setSplash(false);},[]);
 const enterRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!splash)enterRef.current?.focus();},[splash]);
 useEffect(()=>{if(!settings)return;const close=(event:PointerEvent)=>{if(!settingsRef.current?.contains(event.target as Node))setSettings(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[settings]);
 return <main className={`mobile-home ${splash?'is-splash':''}`} inert={inert}>
  <LoadingBackground className="home-keyart" src="/cinematics/home-splash.png"/>
  <div className="home-vignette" aria-hidden="true"/>
  <h1 className="home-title">한국사<span>조합 디펜스</span><i aria-hidden="true">✦</i></h1>
  {splash?<div className="splash-entry"><button onClick={enter} disabled={!ready}>{ready?'게임 시작':'준비 중…'}</button></div>:<>
   <div className="home-settings" ref={settingsRef}><button className="home-settings-toggle" aria-label="설정" aria-expanded={settings} onClick={()=>setSettings(v=>!v)}><Settings size={22}/></button>
   {settings&&<section className="home-settings-panel" aria-label="설정 메뉴"><button onClick={()=>{setSettings(false);onPrologue();}}><ScrollText size={18}/> 프롤로그</button><button onClick={()=>{setSettings(false);onProfile();}}><UserRound size={18}/> 프로필 설정하기</button><button onClick={()=>{setSettings(false);onCodex();}}><Images size={18}/> 영웅 도감</button></section>}</div>
   <section className="home-menu" aria-label="게임 시작">
    <button ref={enterRef} className="home-primary" onClick={resumable?onContinue:onNew} disabled={!ready}><Play size={22} fill="currentColor"/>{resumable?'이어하기':'게임 시작'}</button>
    {resumable&&<button className="home-secondary" onClick={onNew} disabled={!ready}>새로하기</button>}
    {storageError&&<p className="home-storage-warning" role="status">저장이 불가능합니다. 창을 닫으면 진행 기록이 사라질 수 있습니다.</p>}
   </section>
  </>}
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
