'use client';
import {useEffect,useState} from 'react';
import {Coins,Dices,Lock,Sparkles,X} from 'lucide-react';
import type {Difficulty} from '@/lib/enemy-stats';
import {canGamble,gambleAttemptsRemaining,gambleCooldownRemaining,gambleUnlocked,syncGambleState,unitGambles,type GambleState} from '@/lib/gambling';

type Props={gold:number;round:number;difficulty:Difficulty;gambleState:GambleState;discountPercent:number;disabled:boolean;onUnit:(tier:1|2|3|4)=>void;onClose:()=>void};

export default function GamblingDialog({gold,round,difficulty,gambleState,discountPercent,disabled,onUnit,onClose}:Props){
 const [now,setNow]=useState(()=>Date.now());
 const state=syncGambleState(gambleState,round,difficulty),remainingAttempts=gambleAttemptsRemaining(state,round,difficulty),cooldown=gambleCooldownRemaining(state,now),available=canGamble(state,round,difficulty,now);
 useEffect(()=>{if(cooldown<=0)return;const timer=window.setInterval(()=>setNow(Date.now()),100);return()=>window.clearInterval(timer);},[cooldown>0,state.cooldownUntil]);
 const actionLabel=(afford:boolean)=>remainingAttempts===0?'이번 라운드 완료':cooldown>0?`${(cooldown/1000).toFixed(1)}초`:afford?'도박하기':'골드 부족';
 return <div className="gamble-shade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="gamble-modal" role="dialog" aria-modal="true" aria-label="유닛 도박장">
  <header><div><Dices size={25}/><span><small>FORTUNE HOUSE</small><b>유닛 도박</b></span></div><div className="gamble-balance"><Coins size={16}/>{gold.toLocaleString()}G</div><button onClick={onClose} aria-label="유닛 도박장 닫기"><X size={21}/></button></header>
  <div className="gamble-status"><b>{difficulty==='hard'?'하드':'일반'} · 남은 도박 {remainingAttempts}회</b><span>쿨타임 1초{cooldown>0?` · ${(cooldown/1000).toFixed(1)}초 남음`:''}</span></div>
  <div className="gamble-scroll">
   <section><h3>유닛 도박</h3><p>도박 시 해당 단계 유닛을 반드시 획득합니다. 라운드마다 최대 5회 이용할 수 있습니다.</p><div className="gamble-grid">{unitGambles.map(option=>{const unlocked=gambleUnlocked(round,option.unlockRound),cost=Math.round(option.cost*(1-discountPercent/100)),afford=gold>=cost;return <article key={option.tier} className={!unlocked?'locked':''}><Sparkles size={24}/><b>{option.tier}단계 유닛 · {cost.toLocaleString()}G</b><span>확정 획득</span><button disabled={disabled||!unlocked||!afford||!available} onClick={()=>onUnit(option.tier)}>{!unlocked?<><Lock size={14}/>{option.unlockRound}라운드</>:actionLabel(afford)}</button></article>})}</div></section>
  </div>
 </section></div>;
}
