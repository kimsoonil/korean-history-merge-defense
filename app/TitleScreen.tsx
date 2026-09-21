'use client';
import {useEffect,useRef} from 'react';
import {ArrowRight,BookOpen,ChevronRight,Coins,Heart,Images,Play,Sparkles,X} from 'lucide-react';
import {byName} from '@/lib/game';
import {canContinue,type GameSave} from '@/lib/save';

type Props={save:GameSave|null;ready:boolean;storageError:boolean;inert:boolean;onNew:()=>void;onContinue:()=>void;onCodex:()=>void;onBook:()=>void};
export default function TitleScreen({save,ready,storageError,inert,onNew,onContinue,onCodex,onBook}:Props){
  const resumable=canContinue(save);
  return <main className="title-screen" inert={inert}>
    <div className="title-landscape" aria-hidden="true"/>
    <div className="title-grain" aria-hidden="true"/>
    <section className="title-content" aria-labelledby="game-title">
      <div className="title-eyebrow"><span/> 역사를 잇는 작은 영웅들</div>
      <h1 id="game-title">한국사<span>조합 디펜스</span></h1>
      <p className="title-intro">작은 병사에서 전설의 영웅으로.<br/>시대를 넘어 모인 영웅들과 우리의 역사를 지켜내세요.</p>
      <div className="title-start-actions">
        <button className="title-new" onClick={onNew} disabled={!ready}><Sparkles size={21}/><span>새로하기<small>지도에서 도전할 스테이지를 선택합니다</small></span><ArrowRight size={23}/></button>
        <button className="title-continue" onClick={onContinue} disabled={!ready||!resumable}><Play size={20}/><span>이어하기<small>{!ready?'저장된 기록 확인 중':resumable?`1-${save.stage} · ${save.round}라운드`:(save?.phase==='won'||save?.phase==='cleared')?'클리어 완료 · 새로운 도전을 시작하세요':save?.phase==='lost'?'방어전 종료 · 다시 도전하세요':'아직 저장된 방어전이 없습니다'}</small></span><ChevronRight size={23}/></button>
      </div>
      {resumable&&<div className="title-save-summary"><span><Heart size={12}/> {save.wall}/10</span><span><Coins size={12}/> {save.gold.toLocaleString()} G</span><span>배치 {save.roster.length}명</span><span>자동 저장됨</span></div>}
      <nav className="title-archives" aria-label="게임 자료">
        <button onClick={onCodex}><Images size={23}/><span><b>영웅 도감</b><small>전설의 영웅 8인의 기록</small></span><ChevronRight size={17}/></button>
        <button onClick={onBook}><BookOpen size={23}/><span><b>조합서</b><small>2–5단계 영웅의 계보</small></span><ChevronRight size={17}/></button>
      </nav>
      <p className={`title-save-note ${storageError?'warning':''}`} role="status">{storageError?'브라우저 저장 공간을 사용할 수 없습니다. 현재 창에서만 이어할 수 있습니다.':'진행 상황은 이 브라우저에 자동 저장됩니다.'}</p>
    </section>
    <aside className="title-heroes" aria-label="시대를 넘어 모인 전설의 영웅들">
      <div className="title-hero-heading"><span>시대를 넘어, 하나의 전장으로</span><b>전설을 조합하다</b></div>
      <div className="title-hero-lineup">{['세종대왕','이순신','광개토대왕'].map((name,index)=>{const sprite=byName[name].atlas!;return <div key={name} className={`title-hero hero-${index}`}><div className="title-hero-sprite"><img src={sprite.src} alt={name} style={{left:`-${sprite.col*100}%`,top:`-${sprite.row*100}%`}}/></div><span>{name}</span></div>})}</div>
      <div className="title-hero-ground" aria-hidden="true"/>
      <p>일곱 병종의 만남이, 새로운 역사가 됩니다.</p>
    </aside>
    <footer className="title-footer"><span>39종의 유닛 <i/> 5단계 조합 <i/> 10개의 스테이지</span><small>한국사에서 영감을 얻은 판타지 디펜스</small></footer>
  </main>;
}

export function NewGameConfirm({onConfirm,onCancel}:{onConfirm:()=>void;onCancel:()=>void}){
  const rootRef=useRef<HTMLDivElement>(null),cancelRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;cancelRef.current?.focus();return()=>{if(previous?.isConnected)previous.focus();};},[]);
  return <div className="new-game-shade" onMouseDown={event=>{if(event.target===event.currentTarget)onCancel();}}><div ref={rootRef} className="new-game-dialog" role="alertdialog" aria-modal="true" aria-labelledby="new-game-title" aria-describedby="new-game-description" onKeyDown={event=>{
    if(event.key==='Escape'){event.stopPropagation();onCancel();}
    if(event.key==='Tab'){const buttons=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);const index=buttons.indexOf(document.activeElement as HTMLButtonElement);event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}
  }}><button className="new-game-close" onClick={onCancel} aria-label="새로하기 취소"><X size={20}/></button><Sparkles size={30}/><small>A NEW CHAPTER</small><h2 id="new-game-title">새로운 방어전을 시작할까요?</h2><p id="new-game-description">저장된 진행 상황이 새 게임으로 바뀝니다.<br/>현재 전투를 계속하려면 이어하기를 선택하세요.</p><div><button ref={cancelRef} onClick={onCancel}>취소</button><button onClick={onConfirm}>새 게임 시작 <ArrowRight size={16}/></button></div></div></div>;
}
