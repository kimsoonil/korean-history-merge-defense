'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {findLegendaryScene,type LegendaryScene} from '@/lib/legendary';

export function useLegendaryReveal(onResume:(pausedAt:number,now:number)=>void) {
  const [active,setActive]=useState<{scene:LegendaryScene;serial:number;preview:boolean;mode:'summon'|'preview'|'codex'}|null>(null);
  const pausedAtRef=useRef<number|null>(null);
  const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const serialRef=useRef(0),resumeRef=useRef(onResume);
  resumeRef.current=onResume;

  const close=useCallback(()=>{
    if(timerRef.current)clearTimeout(timerRef.current);
    timerRef.current=null;
    if(pausedAtRef.current!==null)resumeRef.current(pausedAtRef.current,Date.now());
    pausedAtRef.current=null;
    setActive(null);
  },[]);
  const show=useCallback((name:string,mode:'summon'|'preview'|'codex'='summon')=>{
    const scene=findLegendaryScene(name);if(!scene)return;
    if(timerRef.current)clearTimeout(timerRef.current);
    pausedAtRef.current??=Date.now();
    setActive({scene,serial:++serialRef.current,preview:mode!=='summon',mode});
    // The codex remains open until dismissed, even when switching between heroes.
    timerRef.current=mode==='codex'?null:setTimeout(close,scene.durationMs);
  },[close]);
  useEffect(()=>()=>{if(timerRef.current)clearTimeout(timerRef.current);},[]);
  return {active,pausedAtRef,show,close};
}
