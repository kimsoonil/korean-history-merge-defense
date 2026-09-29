'use client';
import {useEffect,useRef,useState} from 'react';
import {Sparkles,X} from 'lucide-react';
import type {Difficulty} from '@/lib/enemy-stats';
import {maxUpgradeLevel,upgradePercentPerLevel,upgradeOptions,upgradeCost,type Upgrades,type UpgradeKind} from '@/lib/upgrades';
export default function UpgradeDialog({state,gold,difficulty='normal',disabled,onBuy,onClose}:{state:Upgrades;gold:number;difficulty?:Difficulty;disabled:boolean;onBuy:(kind:UpgradeKind,key:string)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),[tab,setTab]=useState<UpgradeKind>('tier'),[message,setMessage]=useState('');
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();return()=>dialog.close();},[]);
 return <dialog ref={ref} className="upgrade-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <header className="upgrade-heading"><div><Sparkles size={25}/><span><small>BATTLE FORGE</small><b>공격력 강화</b></span></div><button className="close-icon-button" onClick={onClose} aria-label="강화 창 닫기"><X size={21}/></button></header>
  <div className="upgrade-content">
   <div className="upgrade-tabs" aria-label="강화 종류">{(['tier','role','hero'] as const).map(kind=><button key={kind} aria-pressed={tab===kind} onClick={()=>{setTab(kind);setMessage('');}}>{{tier:'단계별',role:'직업별',hero:'5단계 영웅'}[kind]}</button>)}</div>
   <div className="upgrade-list">{upgradeOptions[tab].map(option=>{
    const level=state[tab][option.key]??0,cost=upgradeCost(tab,option.key,state,difficulty);
    return <article key={option.key}><div><h3>{option.label} <small>Lv. {level} / {maxUpgradeLevel(tab)}</small></h3><span>공격력 +{level*upgradePercentPerLevel[tab]}%{cost!==null&&` → +${(level+1)*upgradePercentPerLevel[tab]}%`}</span></div><button disabled={disabled||cost===null||gold<cost} onClick={()=>{onBuy(tab,option.key);setMessage(`${option.label} 강화 · 공격력 +${(level+1)*upgradePercentPerLevel[tab]}%`);}}>{cost===null?'최대 강화':gold<cost?`${cost} G · 부족`:`${cost} G · 강화`}</button></article>;
   })}</div>
   {message&&<div className="upgrade-status" role="status">{message}</div>}
  </div>
 </dialog>;
}
