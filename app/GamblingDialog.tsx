'use client';
import {useEffect,useState} from 'react';
import {Coins,Dices,Lock,Sparkles,X} from 'lucide-react';
import type {Difficulty} from '@/lib/enemy-stats';
import {GAMBLE_GUARANTEE_AFTER,GAMBLE_PITY_STEP,UNIT_GAMBLE_LIMITS,canGamble,gambleAttemptsRemaining,gambleCooldownRemaining,gambleUnlocked,goldGambles,goldSuccessChance,syncGambleState,unitGambles,unitGamblesRemaining,unitSuccessChance,type GambleState,type UnitGambleUsage} from '@/lib/gambling';

type Props={gold:number;round:number;difficulty:Difficulty;gambleState:GambleState;unitUsage:UnitGambleUsage;disabled:boolean;onGold:(id:string)=>void;onUnit:(tier:1|2|3)=>void;onClose:()=>void};
const percent=(value:number)=>`${Math.round(value*100)}%`;

export default function GamblingDialog({gold,round,difficulty,gambleState,unitUsage,disabled,onGold,onUnit,onClose}:Props){
 const [now,setNow]=useState(()=>Date.now());
 const state=syncGambleState(gambleState,round,difficulty),remainingAttempts=gambleAttemptsRemaining(state,round,difficulty),cooldown=gambleCooldownRemaining(state,now),available=canGamble(state,round,difficulty,now);
 useEffect(()=>{if(cooldown<=0)return;const timer=window.setInterval(()=>setNow(Date.now()),100);return()=>window.clearInterval(timer);},[cooldown>0,state.cooldownUntil]);
 const actionLabel=(unlocked:boolean,afford:boolean,complete=false)=>!unlocked?'해방 전':complete?'이번 구간 완료':remainingAttempts===0?'이번 라운드 완료':cooldown>0?`${(cooldown/1000).toFixed(1)}초`:afford?'도박하기':'골드 부족';
 return <div className="gamble-shade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="gamble-modal" role="dialog" aria-modal="true" aria-label="도박장">
  <header><div><Dices size={25}/><span><small>FORTUNE HOUSE</small><b>전장 도박장</b></span></div><div className="gamble-balance"><Coins size={16}/>{gold.toLocaleString()}G</div><button onClick={onClose} aria-label="도박장 닫기"><X size={21}/></button></header>
  <div className="gamble-status"><b>{difficulty==='hard'?'하드':'일반'} · 남은 도박 {remainingAttempts}회</b><span>공통 쿨타임 3초{cooldown>0?` · ${(cooldown/1000).toFixed(1)}초 남음`:''}</span></div>
  <div className="gamble-scroll">
   <section><h3>골드 도박</h3><p>실패할 때마다 다음 성공 확률이 {Math.round(GAMBLE_PITY_STEP[difficulty]*100)}% 상승합니다.</p><div className="gamble-grid">{goldGambles.map(option=>{const unlocked=gambleUnlocked(round,option.unlockRound),afford=gold>=option.cost,failures=state.goldFailures[option.id],guaranteed=failures>=GAMBLE_GUARANTEE_AFTER[difficulty],success=goldSuccessChance(difficulty,failures),maxReward=option.cost*(difficulty==='hard'?7:6);return <article key={option.id} className={!unlocked?'locked':''}><Coins size={24}/><b>{option.cost.toLocaleString()}G 도박</b><span>성공 {percent(success)}{failures>0?` · 천장 ${failures}/${GAMBLE_GUARANTEE_AFTER[difficulty]}`:''} · 최대 +{(maxReward-option.cost).toLocaleString()}G</span><button disabled={disabled||!unlocked||!afford||!available} onClick={()=>onGold(option.id)}>{!unlocked?<><Lock size={14}/>{option.unlockRound}라운드</>:guaranteed?'확정 성공':actionLabel(unlocked,afford)}</button></article>})}</div></section>
   <section><h3>유닛 도박</h3><p>실패는 성공 횟수를 차감하지 않으며 다음 성공 확률을 올립니다.</p><div className="gamble-grid">{unitGambles.map(option=>{const unlocked=gambleUnlocked(round,option.unlockRound),afford=gold>=option.cost,remaining=unitGamblesRemaining(option.tier,round,unitUsage),failures=state.unitFailures[option.tier],success=unitSuccessChance(option,difficulty,failures);return <article key={option.tier} className={!unlocked?'locked':''}><Sparkles size={24}/><b>{option.tier}단계 유닛 · {option.cost.toLocaleString()}G</b><span>성공 {percent(success)} · 남은 성공 {remaining}/{UNIT_GAMBLE_LIMITS[option.tier]}{failures>0?` · 천장 ${failures}/${GAMBLE_GUARANTEE_AFTER[difficulty]}`:''}</span><button disabled={disabled||!unlocked||!afford||remaining===0||!available} onClick={()=>onUnit(option.tier)}>{!unlocked?<><Lock size={14}/>{option.unlockRound}라운드</>:actionLabel(unlocked,afford,remaining===0)}</button></article>})}</div></section>
  </div>
 </section></div>;
}
