'use client';
import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import type {Difficulty} from '@/lib/enemy-stats';
import {maxUpgradeLevel,upgradePercentPerLevel,upgradeOptions,upgradeCost,type Upgrades,type UpgradeKind} from '@/lib/upgrades';
export default function UpgradeDialog({state,gold,difficulty='normal',disabled,onBuy,onClose}:{state:Upgrades;gold:number;difficulty?:Difficulty;disabled:boolean;onBuy:(kind:UpgradeKind,key:string)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),[tab,setTab]=useState<UpgradeKind>('tier'),[message,setMessage]=useState('');
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
 return <dialog ref={ref} className="upgrade-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="upgrade-heading"><div><h2>공격력 강화</h2><span>보유 골드 {gold.toLocaleString()} G</span></div><button className="close-icon-button" onClick={onClose} aria-label="강화 창 닫기"><X size={20}/></button></div>
  <p>단계 강화: 레벨당 +1% (최대 +20%) · 직업 강화: 레벨당 +3% (최대 +30%) · 개별 영웅 강화: 레벨당 +5% (최대 +50%)<br/>단계·직업·영웅 강화는 합산됩니다. 이후 모집·조합한 유닛에도 적용됩니다.</p>
  <div className="upgrade-tabs" aria-label="강화 종류">{(['tier','role','hero'] as const).map(kind=><button key={kind} aria-pressed={tab===kind} onClick={()=>{setTab(kind);setMessage('');}}>{{tier:'단계별',role:'직업별',hero:'5단계 영웅'}[kind]}</button>)}</div>
  <div className="upgrade-list">{upgradeOptions[tab].map(option=>{
   const level=state[tab][option.key]??0,cost=upgradeCost(tab,option.key,state,difficulty);
   return <article key={option.key}><div><h3>{option.label} <small>Lv. {level} / {maxUpgradeLevel(tab)}</small></h3><span>공격력 +{level*upgradePercentPerLevel[tab]}%{cost!==null&&` → +${(level+1)*upgradePercentPerLevel[tab]}%`}</span></div><button disabled={disabled||cost===null||gold<cost} onClick={()=>{onBuy(tab,option.key);setMessage(`${option.label} 강화 · 공격력 +${(level+1)*upgradePercentPerLevel[tab]}%`);}}>{cost===null?'최대 강화':gold<cost?`${cost} G · 부족`:`${cost} G · 강화`}</button></article>;
  })}</div>
  <div className="upgrade-status" role="status">{message||'공격속도·사거리·특수 효과는 변하지 않습니다.'}</div>
  <small>새 게임·새 스테이지 시작 시 초기화 · 이어하기 시 유지</small>
 </dialog>;
}
