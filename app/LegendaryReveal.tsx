'use client';
import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';

import {useEffect,useRef,type CSSProperties} from 'react';
import {X} from 'lucide-react';
import {byName} from '@/lib/game';
import type {LegendaryScene} from '@/lib/legendary';

type Props={scene:LegendaryScene;preview:boolean;onClose:()=>void;embedded?:boolean};
export default function LegendaryReveal({scene,preview,onClose,embedded=false}:Props){
  const rootRef=useRef<HTMLDivElement>(null);
  const sprite=byName[scene.name].atlas!;
  useEffect(()=>{
    if(embedded)return;
    const previous=document.activeElement as HTMLElement|null;
    rootRef.current?.focus();
    return()=>{if(previous?.isConnected)previous.focus();else document.querySelector<HTMLButtonElement>('.action-book')?.focus();};
  },[embedded]);
  return <div ref={rootRef} tabIndex={embedded?undefined:-1} className="legendary-reveal" role={embedded?'region':'dialog'} aria-modal={embedded?undefined:true} aria-labelledby="legendary-name" aria-describedby="legendary-quote" style={{'--legendary-accent':scene.accent} as CSSProperties} onKeyDown={embedded?undefined:event=>{
    if(event.key==='Escape'){event.stopPropagation();onClose();}
    if(event.key==='Tab'){
      const controls=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);
      const current=controls.indexOf(document.activeElement as HTMLButtonElement);
      event.preventDefault();controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
    }
  }}>
    <LoadingImage className="legendary-backdrop" src={`/cinematics/${scene.slug}.png`} alt={`${scene.name}의 상징, ${scene.symbol}`}/>
    <div className="legendary-vignette"/>
    <div className="legendary-rays" aria-hidden="true"/>
    {!embedded&&<div className="legendary-toolbar"><span>{preview?'연출 미리보기':'5단계 영웅 조합 성공'} · 전투 일시 정지</span><div><button onClick={onClose} aria-label="등장 연출 건너뛰기">건너뛰기 <X size={15}/></button></div></div>}
    <div className="legendary-heading"><span>★★★★★</span><small>전설의 영웅</small><h2 id="legendary-name">{scene.name}</h2><p>{scene.title}</p></div>
    {scene.slug==='sejong'&&<div className="legendary-letters" aria-hidden="true"><span>훈민정음</span><i>ㄱ</i><i>ㄴ</i><i>ㅁ</i><i>ㅅ</i><i>ㅇ</i></div>}
    <div className="legendary-hero" aria-hidden="true"><div className="legendary-hero-viewport"><LoadingImage src={sprite.src} alt="" style={{left:`-${sprite.col*100}%`,top:`-${sprite.row*100}%`}}/></div></div>
    <div className="legendary-caption"><span className="legendary-symbol">{scene.symbol}</span><blockquote id="legendary-quote">“{scene.quote}”</blockquote><small>{scene.attribution}</small></div>
  </div>;
}
