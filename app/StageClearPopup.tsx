'use client';
import {useEffect,useRef} from 'react';
export default function StageClearPopup({stage,rounds,onMap,onHome}:{stage:number;rounds:number;onMap:()=>void;onHome:()=>void}){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{root.current?.querySelector('button')?.focus();},[]);
 return <div className="overlay-shade result-shade"><section ref={root} className="result-modal won" role="dialog" aria-modal="true" aria-labelledby="stage-clear-title" onKeyDown={event=>{
  if(event.key!=='Tab')return;
  const buttons=Array.from(root.current?.querySelectorAll('button')??[]),index=buttons.indexOf(document.activeElement as HTMLButtonElement);
  event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
 }}><div className="result-emblem">✦</div><small>STAGE CLEAR</small><h2 id="stage-clear-title">1-{stage} 스테이지 클리어!</h2><p>1–{rounds}라운드를 모두 방어했습니다.<br/><strong>1-{stage+1} 스테이지가 개방되었습니다.</strong><br/>지역 지도에서 다음 스테이지를 선택하세요.</p><button onClick={onMap}>스테이지 선택</button><button className="result-home" onClick={onHome}>이야기 선택</button></section></div>;
}
