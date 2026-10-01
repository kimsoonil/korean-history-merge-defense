'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {X,ArrowDownToLine,ArrowUpFromLine,Check} from 'lucide-react';
import {units,type UnitDef,type Soldier} from '@/lib/game';
import {type Bag,DEPLOY_LIMIT} from '@/lib/inventory';
import {salePrice} from '@/lib/selling';
import {STORABLE_UNIT_TIERS} from '@/lib/unit-tiers';
export default function UnitBag({bag,roster,autoStoreBasic,onAutoStoreBasic,onClose,onStore,onDeploy,onSell,portrait}:{bag:Bag;roster:Soldier[];autoStoreBasic:boolean;onAutoStoreBasic:(enabled:boolean)=>void;onClose:()=>void;onStore:(tier:number)=>void;onDeploy:(tier:number,name?:string)=>void;onSell:(name:string,all:boolean)=>void;portrait:(u:UnitDef)=>ReactNode}){
 const [tier,setTier]=useState(1),[selected,setSelected]=useState<string|null>(null);
 const root=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=root.current;el?.showModal();return()=>el?.close();},[]);
 const unit=units.find(u=>u.name===selected),count=selected?(bag[selected]??0):0;
 return <dialog ref={root} className="unit-bag" onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="bag-title">
  <header><h2 id="bag-title">유닛 가방</h2><span>배치 {roster.length}/{DEPLOY_LIMIT}</span><button onClick={onClose} aria-label="가방 닫기"><X size={22}/></button></header>
  <label className="bag-auto-store"><input type="checkbox" checked={autoStoreBasic} onChange={e=>onAutoStoreBasic(e.target.checked)}/><span className="bag-auto-check" aria-hidden="true"><Check size={14}/></span><span>1단계 자동 넣기</span></label>
  <div className="bag-tabs" aria-label="유닛 단계">{STORABLE_UNIT_TIERS.map(t=><button key={t} aria-pressed={tier===t} onClick={()=>{setTier(t);setSelected(null);}}>{t}단계</button>)}</div>
  <div className="bag-transfer"><button disabled={!roster.some(u=>units.find(v=>v.name===u.name)?.tier===tier)} onClick={()=>onStore(tier)}><ArrowDownToLine size={17}/>{tier}단계 모두 넣기</button><button disabled={roster.length>=DEPLOY_LIMIT||!units.some(u=>u.tier===tier&&(bag[u.name]??0)>0)} onClick={()=>onDeploy(tier)}><ArrowUpFromLine size={17}/>모두 꺼내기</button></div>
  <div className="bag-grid">{units.filter(u=>u.tier===tier).map(u=><button key={u.name} className={selected===u.name?'selected':''} onClick={()=>setSelected(u.name)} aria-pressed={selected===u.name}>{portrait(u)}<b>{u.name}</b><span>×{bag[u.name]??0}</span></button>)}</div>
  {unit&&<section className="bag-selection"><b>{unit.name} · ×{count}</b><div><button disabled={!count||roster.length>=DEPLOY_LIMIT} onClick={()=>onDeploy(tier,unit.name)}>1명 배치</button><button disabled={!count} onClick={()=>onSell(unit.name,false)}>1명 판매 +{salePrice(unit)}G</button><button disabled={!count} onClick={()=>{if(window.confirm(`가방의 ${unit.name} ${count}명을 모두 판매할까요?`))onSell(unit.name,true);}}>모두 판매 +{(salePrice(unit)??0)*count}G</button></div></section>}
 </dialog>;
}
