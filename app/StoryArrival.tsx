'use client';
import {useEffect,useRef,useState} from 'react';
import {LoadingBackground} from './LoadingImage';
import {nadangArrival} from '@/lib/nadang';
import {hwangsanArrival,HWANGSAN_IMAGE} from '@/lib/hwangsan';
import {ansiArrival,ANSI_IMAGE,type ChapterId} from '@/lib/ansi';
import {storyDialogue} from '@/lib/story';
import useBattleAmbience from './useBattleAmbience';
export default function StoryArrival({nickname,onClose,onComplete,chapter=1}:{chapter?:ChapterId;nickname:string;onClose:()=>void;onComplete:()=>void}){
 const [step,setStep]=useState(0),[flash,setFlash]=useState(false);
 const focus=useRef<HTMLHeadingElement>(null),ambience=useBattleAmbience();
 useEffect(()=>{focus.current?.focus();},[step]);
 useEffect(()=>{if(!flash)return;const timer=window.setTimeout(()=>setFlash(false),1200);return()=>window.clearTimeout(timer);},[flash]);
 const next=()=>{if(step===0){ambience.start();setFlash(true);}setStep(s=>Math.min(4,s+1));};
 const dialogue=chapter===4?nadangArrival(step,nickname):chapter===3?hwangsanArrival(step,nickname):chapter===2?ansiArrival(step,nickname):step<4?storyDialogue(step,nickname):{speaker:'책의 정령',text:`${nickname}, 요동성은 고구려로 향하는 길목이다. 성벽 너머로 수나라 군대가 다가오고 있다. 이제 지켜야 할 전선을 살펴보자.`};
 return <main className={`story-arrival ${flash?'story-flash':''}`}>
  <LoadingBackground className="story-backdrop" src={chapter===4?'/story/chapters/nadang.png':chapter===3?HWANGSAN_IMAGE:chapter===2?ANSI_IMAGE:'/story/yodong-612.png'}/><div className="story-whiteout" aria-hidden="true"/>
  <header><div><small>02 · 첫 전장</small><h1>{chapter===4?'670~676년 · 나당전쟁':chapter===3?'660년 · 황산벌':chapter===2?'645년 · 안시성':'612년 · 요동성'}</h1></div><div><button aria-pressed={ambience.enabled} onClick={ambience.toggle}>{ambience.enabled?'효과음 끄기':'효과음 켜기'}</button><button onClick={()=>{ambience.stop();onClose();}}>닫기</button></div></header>
  <div className="story-content">
   <aside className="story-journal"><small>지금까지의 이야기</small><h2>{chapter===4?'육지와 바다의 항전':chapter===3?'황산벌에 새겨진 이름들':'낯선 시대의 성벽'}</h2><p>{chapter===4?`${nickname}, 신라의 국경에서 매소성과 기벌포까지 이어지는 항전입니다. 육지와 바다의 방어선을 지켜내세요.`:chapter===3?`${nickname}, 김유신의 전선을 따라 황산벌의 기록을 살펴봅니다. 백제군과 계백의 결의를 기억하며 전투에 임하세요.`:chapter===2?`${nickname}, 이번 기록은 안시성의 항전입니다. 성문과 성벽, 토산을 둘러싼 공방을 지나 당군의 마지막 공세를 막아내세요.`:`${nickname}, 천명도첩이 이끈 곳은 612년 요동성입니다. 수나라의 공세에 고구려의 방어선이 흔들리고 있습니다.`}</p></aside>
   <section className="story-dialogue" aria-labelledby="story-speaker">
    <h2 id="story-speaker" ref={focus} tabIndex={-1}>{dialogue.speaker}</h2><p>{dialogue.text}</p>
    <div className="story-next-row"><span>{step+1} / 5</span>{step===4?<button className="story-primary" onClick={()=>{ambience.stop();onComplete();}}>맵 선택 →</button>:<button className="story-primary" onClick={next}>{step===0?'빛 너머로 이동':'다음'} →</button>}</div>
   </section>
  </div>
 </main>;
}
