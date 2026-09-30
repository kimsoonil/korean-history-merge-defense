'use client';
import {useEffect,useRef,useState} from 'react';
import {Settings,X,Map,BookOpen,Images,Info,UserRound,LogIn,LogOut} from 'lucide-react';
import BackgroundMusic from './BackgroundMusic';
import type {MusicMood} from '@/lib/music';
type Props={mood:MusicMood;blocked:boolean;accountMode:'login'|'logout';onStage:()=>void;onStory:()=>void;onCodex:()=>void;onHelp:()=>void;onProfile:()=>void;onAccount:()=>void};
export default function BattleSettings({mood,blocked,accountMode,onStage,onStory,onCodex,onHelp,onProfile,onAccount}:Props){
 const dialog=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(false);
 const close=()=>{dialog.current?.close();setOpen(false);};
 const go=(action:()=>void)=>{close();action();};
 useEffect(()=>{if(blocked){dialog.current?.close();setOpen(false);}},[blocked]);
 return <>
  <button className="battle-settings-trigger" disabled={blocked} aria-label="전투 설정 열기" title="설정" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{dialog.current?.showModal();setOpen(true);}}><Settings size={17}/></button>
  <dialog ref={dialog} className="battle-settings-dialog" aria-labelledby="battle-settings-title" onClose={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();}}}>
   <header><h2 id="battle-settings-title">설정</h2><button onClick={close} aria-label="설정 닫기" autoFocus><X size={22}/></button></header>
   <section className="settings-music"><h3>BGM</h3><BackgroundMusic mood={mood}/></section>
   <nav className="settings-links" aria-label="전투 메뉴">
    <button onClick={()=>go(onStage)}><Map size={20}/>스테이지 선택</button>
    <button onClick={()=>go(onStory)}><BookOpen size={20}/>이야기 선택</button>
    <button onClick={()=>go(onCodex)}><Images size={20}/>영웅 도감</button>
    <button onClick={()=>go(onHelp)}><Info size={20}/>게임 정보 · 방법</button>
    <button onClick={()=>go(onProfile)}><UserRound size={20}/>프로필 변경</button>
    <button onClick={()=>go(onAccount)}>{accountMode==='logout'?<LogOut size={20}/>:<LogIn size={20}/>} {accountMode==='logout'?'로그아웃':'SNS 로그인'}</button>
   </nav>
   <p>설정 중에도 전투는 진행됩니다.<br/>선택 화면으로 이동하면 전투가 저장됩니다.</p>
  </dialog>
 </>;
}
