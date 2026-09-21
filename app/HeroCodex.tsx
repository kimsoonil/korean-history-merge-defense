'use client';
import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';

import {useEffect,useRef} from 'react';
import {ChevronLeft,ChevronRight,Images,X} from 'lucide-react';
import {byName} from '@/lib/game';
import {legendaryScenes,type LegendaryScene} from '@/lib/legendary';
import LegendaryReveal from './LegendaryReveal';
import {heroSkillDescription} from '@/lib/hero-skills';

type Props={scene:LegendaryScene;onSelect:(name:string)=>void;onClose:()=>void};

/** Read-only hero codex using the same artwork as the live summon cinematic. */
export default function HeroCodex({scene,onSelect,onClose}:Props){
  const rootRef=useRef<HTMLElement>(null),closeRef=useRef<HTMLButtonElement>(null);
  const index=legendaryScenes.findIndex(item=>item.name===scene.name);
  const step=(direction:number)=>onSelect(legendaryScenes[(index+direction+legendaryScenes.length)%legendaryScenes.length].name);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    closeRef.current?.focus();
    return()=>{if(previous?.isConnected)previous.focus();else document.querySelector<HTMLButtonElement>('.hero-codex-open')?.focus();};
  },[]);
  return <div className="hero-codex-shade">
    <section ref={rootRef} className="hero-codex-modal" role="dialog" aria-modal="true" aria-labelledby="hero-codex-title" aria-describedby="hero-codex-description" onKeyDown={event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
      if(event.key==='Tab'){
        const controls=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);
        const current=controls.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
      }
    }}>
      <header className="hero-codex-header">
        <div><small><Images size={13}/> 전설의 영웅 · 5단계</small><h2 id="hero-codex-title">영웅 도감</h2></div>
        <button ref={closeRef} className="hero-codex-close" onClick={onClose} aria-label="영웅 도감 닫기"><X size={18}/> 닫기</button>
      </header>
      <p id="hero-codex-description">{heroSkillDescription(scene.name)}<br/>발동 배경: 불투명도 80% · 2초. 도감을 열면 전투가 일시 정지됩니다.</p>
      <div className="hero-codex-body">
        <nav className="hero-codex-heroes" aria-label="도감 영웅 선택">
          {legendaryScenes.map(item=>{
            const sprite=byName[item.name].atlas!;
            return <button key={item.slug} onClick={()=>onSelect(item.name)} className={item.name===scene.name?'active':''} aria-label={`${item.name} 이미지 보기`} aria-pressed={item.name===scene.name}>
              <span className="hero-codex-portrait" aria-hidden="true"><LoadingImage src={sprite.src} alt="" style={{left:`-${sprite.col*100}%`,top:`-${sprite.row*100}%`}}/></span>
              <b>{item.name}</b><small>{item.symbol}</small>
            </button>;
          })}
        </nav>
        <div className="hero-codex-canvas"><div className="hero-codex-stage"><LoadingBackground className="codex-loading-ground" src="/terrain/forest-ground.png"/>
          <LegendaryReveal key={scene.slug} scene={scene} preview embedded onClose={onClose}/>
        </div></div>
      </div>
      <footer className="hero-codex-footer">
        <button onClick={()=>step(-1)} aria-label="이전 영웅 이미지"><ChevronLeft size={17}/> 이전</button>
        <span aria-live="polite"><b>{index+1} / {legendaryScenes.length} · {scene.name}</b><small>상징 · {scene.symbol}</small></span>
        <button onClick={()=>step(1)} aria-label="다음 영웅 이미지">다음 <ChevronRight size={17}/></button>
      </footer>
    </section>
  </div>;
}
