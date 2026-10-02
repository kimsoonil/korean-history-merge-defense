'use client';
import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {LoadingBackground} from './LoadingImage';
import {imjinPrelude} from '@/lib/imjin-prelude';

export default function BattlePrelude({stage,nickname,onClose,onComplete}:{stage:number;nickname:string;onClose:()=>void;onComplete:()=>void}){
 const [step,setStep]=useState(0),focus=useRef<HTMLHeadingElement>(null),prelude=imjinPrelude(stage,nickname),dialogue=prelude.pages[step];
 useEffect(()=>{focus.current?.focus();},[step]);
 return <main className="story-arrival battle-prelude">
  <LoadingBackground className="story-backdrop" src={prelude.image}/>
  <header><div><small>임진왜란 · 스테이지 {stage}</small><h1>{prelude.year} · {prelude.title}</h1></div><div><button className="story-skip" onClick={onComplete} aria-label="전투 이야기 건너뛰기">스킵</button><button className="close-icon-button" onClick={onClose} aria-label="전투 이야기 닫기"><X size={20}/></button></div></header>
  <div className="story-content">
   <aside className="story-journal"><small>전투 기록</small><h2>{prelude.title}</h2><p>{dialogue.text}</p></aside>
   <section className="story-dialogue" aria-labelledby="battle-prelude-speaker">
    <h2 id="battle-prelude-speaker" ref={focus} tabIndex={-1}>{dialogue.speaker}</h2><p>{dialogue.text}</p>
    <div className="story-next-row"><span>{step+1} / {prelude.pages.length}</span>{step===prelude.pages.length-1?<button className="story-primary" onClick={onComplete}>전투 준비</button>:<button className="story-primary" onClick={()=>setStep(value=>value+1)}>다음</button>}</div>
   </section>
  </div>
 </main>;
}
