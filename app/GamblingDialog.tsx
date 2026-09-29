'use client';
import {Coins,Dices,Lock,Sparkles,X} from 'lucide-react';
import {gambleUnlocked,goldGambles,unitGambles,unitGamblesRemaining,UNIT_GAMBLE_LIMITS,type UnitGambleUsage} from '@/lib/gambling';

export default function GamblingDialog({gold,round,unitUsage,disabled,onGold,onUnit,onClose}:{gold:number;round:number;unitUsage:UnitGambleUsage;disabled:boolean;onGold:(id:string)=>void;onUnit:(tier:1|2|3)=>void;onClose:()=>void}){
 return <div className="gamble-shade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="gamble-modal" role="dialog" aria-modal="true" aria-label="도박장">
  <header><div><Dices size={25}/><span><small>FORTUNE HOUSE</small><b>전장 도박장</b></span></div><div className="gamble-balance"><Coins size={16}/>{gold.toLocaleString()}G</div><button onClick={onClose} aria-label="도박장 닫기"><X size={21}/></button></header>
  <div className="gamble-scroll">
   <section><h3>골드 도박</h3><p>지불한 골드를 포함한 최종 손익 범위입니다.</p><div className="gamble-grid">{goldGambles.map(option=>{const unlocked=gambleUnlocked(round,option.unlockRound),afford=gold>=option.cost;return <article key={option.id} className={!unlocked?'locked':''}><Coins size={24}/><b>{option.cost.toLocaleString()}G 도박</b><span>손익 -{option.cost.toLocaleString()}G ~ +{(option.maxReward-option.cost).toLocaleString()}G</span><button disabled={disabled||!unlocked||!afford} onClick={()=>onGold(option.id)}>{!unlocked?<><Lock size={14}/>{option.unlockRound}라운드 해방</>:afford?'도전하기':'골드 부족'}</button></article>})}</div></section>
   <section><h3>유닛 도박</h3><p>10라운드마다 성공 횟수가 초기화되며, 실패는 횟수를 차감하지 않습니다.</p><div className="gamble-grid">{unitGambles.map(option=>{const unlocked=gambleUnlocked(round,option.unlockRound),afford=gold>=option.cost,remaining=unitGamblesRemaining(option.tier,round,unitUsage);return <article key={option.tier} className={!unlocked?'locked':''}><Sparkles size={24}/><b>{option.tier}단계 유닛 · {option.cost.toLocaleString()}G</b><span>실패 {option.failureChance*100}% · 환급 {option.refund}G · 남은 성공 {remaining}/{UNIT_GAMBLE_LIMITS[option.tier]}</span><button disabled={disabled||!unlocked||!afford||remaining===0} onClick={()=>onUnit(option.tier)}>{!unlocked?<><Lock size={14}/>{option.unlockRound}라운드 해방</>:remaining===0?'이번 구간 완료':afford?'도전하기':'골드 부족'}</button></article>})}</div></section>
  </div>
 </section></div>;
}
