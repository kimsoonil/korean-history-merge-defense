'use client';
import {useEffect,useRef,useState} from 'react';
import {LoadingBackground} from './LoadingImage';
import type {ChapterId} from '@/lib/ansi';
import type {ProfileReward} from '@/lib/player';
import {EPILOGUE_RETURN_IMAGE,storyEpilogue,storyEpilogueMeta} from '@/lib/story-epilogue';

export default function StoryEpilogue({chapter,nickname,onComplete,profileReward}:{chapter:ChapterId;nickname:string;profileReward?:ProfileReward|null;onComplete:()=>void}){
 const [step,setStep]=useState(0),focus=useRef<HTMLHeadingElement>(null),pages=storyEpilogue(chapter,nickname),page=pages[step],meta=storyEpilogueMeta(chapter);
 useEffect(()=>{focus.current?.focus();},[step]);
 const last=step===pages.length-1;
 return <main className="story-arrival story-epilogue story-cinematic" aria-label={`${meta.title} 에필로그`}>
  <LoadingBackground className="story-backdrop" src={step>=8?EPILOGUE_RETURN_IMAGE:meta.image}/>
  <header aria-hidden="true"/>
  <div className="story-content">
   <aside className="story-journal"><small>{meta.year} · 에필로그</small><h1>{meta.title}</h1><h2>{meta.heading}</h2><p>{meta.summary}</p>{profileReward&&<strong className="profile-reward-copy">새 프로필 획득<br/>{profileReward.avatar.tier}단계 · {profileReward.avatar.name}</strong>}<span>이야기 완료 · 10장</span></aside>
   <section className="story-dialogue" aria-labelledby="epilogue-speaker">
    <h2 id="epilogue-speaker" ref={focus} tabIndex={-1}>{page.speaker}</h2><p>{page.text}</p>
    <div className="story-next-row"><span>{step+1} / {pages.length}</span>{last?<button className="story-primary" onClick={onComplete}>메인 화면으로</button>:<button className="story-primary" onClick={()=>setStep(value=>value+1)}>다음</button>}</div>
   </section>
  </div>
 </main>;
}
