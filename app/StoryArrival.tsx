'use client';
import {useEffect,useRef,useState} from 'react';
import {Volume2,VolumeX,X} from 'lucide-react';
import {LoadingBackground} from './LoadingImage';
import type {ChapterId} from '@/lib/ansi';
import {getStoryCampaign} from '@/lib/story-campaigns';
import useBattleAmbience from './useBattleAmbience';
export default function StoryArrival({nickname,onClose,onComplete,chapter=1}:{chapter?:ChapterId;nickname:string;onClose:()=>void;onComplete:()=>void}){
 const [step,setStep]=useState(0),[flash,setFlash]=useState(false);
 const campaign=getStoryCampaign(chapter);
 const focus=useRef<HTMLHeadingElement>(null),ambience=useBattleAmbience();
 useEffect(()=>{focus.current?.focus();},[step]);
 useEffect(()=>{if(!flash)return;const timer=window.setTimeout(()=>setFlash(false),1200);return()=>window.clearTimeout(timer);},[flash]);
 const finish=()=>{ambience.stop();onComplete();};
 const next=()=>{if(step===0){ambience.start();setFlash(true);}setStep(s=>Math.min(4,s+1));};
 const dialogue=campaign.arrival(step,nickname);
 return <main className={`story-arrival story-opening ${flash?'story-flash':''}`}>
  <LoadingBackground className="story-backdrop" src={campaign.arrivalImage}/><div className="story-whiteout" aria-hidden="true"/>
  <header><div><small>{campaign.year} · 첫 전장</small><h1>{campaign.title}</h1></div><div><button className="story-audio-button" aria-label={ambience.enabled?'효과음 끄기':'효과음 켜기'} aria-pressed={ambience.enabled} onClick={ambience.toggle}>{ambience.enabled?<Volume2 size={18}/>:<VolumeX size={18}/>}<span>{ambience.enabled?'효과음 끄기':'효과음 켜기'}</span></button><button className="story-skip" onClick={finish} aria-label="스토리 건너뛰고 스테이지 선택">스킵</button><button className="close-icon-button" onClick={()=>{ambience.stop();onClose();}} aria-label="이야기 닫기"><X size={20}/></button></div></header>
  <div className="story-content">
   <aside className="story-journal"><small>지금까지의 이야기</small><h2>{campaign.journalHeading}</h2><p>{campaign.journalSummary(nickname)}</p></aside>
   <section className="story-dialogue" aria-labelledby="story-speaker">
    <h2 id="story-speaker" ref={focus} tabIndex={-1}>{dialogue.speaker}</h2><p>{dialogue.text}</p>
    <div className="story-next-row"><span>{step+1} / 5</span>{step===4?<button className="story-primary" onClick={finish}>스테이지 선택</button>:<button className="story-primary" onClick={next}>{step===0?'빛 너머로 이동':'다음'}</button>}</div>
   </section>
  </div>
 </main>;
}
