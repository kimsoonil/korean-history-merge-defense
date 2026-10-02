'use client';
import {useMemo,useState} from 'react';
import {FlaskConical,Gauge,Lock,Sparkles,Swords,UserRound,X} from 'lucide-react';
import {accountFromProfile,researchAvailable,researchNodes,researched,xpForNextLevel,type ResearchNode,type ResearchTab} from '@/lib/research';
import type {PlayerProfile} from '@/lib/player';
import {ProfileAvatar} from './ProfileSettings';

const roleIconPosition:Record<string,string>={전열:'0% 0%',수군:'50% 0%',지원:'100% 0%',화포:'0% 50%',기동:'50% 50%',책략:'100% 50%',수성:'0% 100%',군주:'50% 100%',궁사:'100% 100%'};

function ResearchIcon({node}:{node:ResearchNode}){
 if(node.portrait)return <span className="research-hero-face"><ProfileAvatar avatar={node.portrait}/></span>;
 if(node.kind==='tier')return <span className="research-tier-icon"><small>Lv</small><b>{node.targetTier}</b></span>;
 if(node.kind==='role')return <span className="research-role-icon" style={{backgroundPosition:roleIconPosition[node.targets?.[0]??'']}}/>;
 if(node.kind==='speed')return <Gauge/>;
 if(node.kind==='hero')return <UserRound/>;
 if(node.tab==='support'&&node.iconIndex!==undefined){const column=node.iconIndex%5,row=Math.floor(node.iconIndex/5);return <span className="research-support-icon" style={{backgroundPosition:`${column*25}% ${row*25}%`}}/>;}
 if(node.tab==='support')return <Sparkles/>;
 return <Swords/>;
}

export default function ResearchLab({profile,onUpgrade,onClose}:{profile:PlayerProfile;onUpgrade:(id:string)=>void;onClose:()=>void}){
 const [tab,setTab]=useState<ResearchTab>('stats');
 const tabNodes=researchNodes.filter(node=>node.tab===tab);
 const [selectedId,setSelectedId]=useState('attack-1');
 const account=accountFromProfile(profile);
 const selected=tabNodes.find(node=>node.id===selectedId)??tabNodes[0];
 const rows=useMemo(()=>{
  const grouped=new Map<number,ResearchNode[]>();
  for(const node of tabNodes)grouped.set(node.unlockLevel,[...(grouped.get(node.unlockLevel)??[]),node]);
  return [...grouped].map(([level,nodes])=>({level,nodes})).sort((a,b)=>a.level-b.level);
 },[tabNodes]);
 const done=researched(account.research,selected.id),available=researchAvailable(selected,account),afford=account.accountGold>=selected.cost;
 const changeTab=(next:ResearchTab)=>{setTab(next);setSelectedId(researchNodes.find(node=>node.tab===next)?.id??'');};
 return <div className="research-shade" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
  <section className="research-lab" role="dialog" aria-modal="true" aria-label="연구소">
   <header><div><FlaskConical/><span><small>ROYAL RESEARCH</small><b>천명 연구소</b></span></div><strong><FlaskConical size={15}/>연구금 {account.accountGold.toLocaleString()}</strong><button onClick={onClose} aria-label="연구소 닫기"><X/></button></header>
   <div className="research-workspace">
    <div className="research-controls">
     <div className="research-level-panel"><span>내 레벨</span><b>Lv {account.level}</b><small>EXP {account.xp}/{xpForNextLevel(account.level)}</small><div><i style={{width:`${Math.min(100,account.xp/xpForNextLevel(account.level)*100)}%`}}/></div></div>
     <nav className="research-tabs"><button className={tab==='stats'?'active':''} onClick={()=>changeTab('stats')}><Swords/>스탯 증가</button><button className={tab==='support'?'active':''} onClick={()=>changeTab('support')}><Sparkles/>지원</button></nav>
    </div>
    <div className={`research-tree ${tab}`}>{rows.map(row=><section className="research-row" key={row.level}><div className={`research-level ${account.level>=row.level?'reached':''}`}><small>Lv</small><b>{row.level}</b></div><div className={`research-row-nodes ${row.nodes.length>1?'branched':''}`}>{row.nodes.map(node=>{const nodeDone=researched(account.research,node.id),nodeAvailable=researchAvailable(node,account);return <button key={node.id} aria-label={node.title} aria-pressed={selected.id===node.id} className={`research-node ${nodeDone?'done':''} ${nodeAvailable?'available':'locked'} ${selected.id===node.id?'selected':''}`} onClick={()=>setSelectedId(node.id)}><ResearchIcon node={node}/>{!nodeAvailable&&!nodeDone&&<Lock className="node-lock"/>}{nodeDone&&<span className="node-done">✓</span>}</button>;})}</div></section>)}</div>
   </div>
   <footer className="research-detail"><div className="research-detail-icon"><ResearchIcon node={selected}/></div><div><small>LEVEL {selected.unlockLevel}</small><b>{selected.title}</b><p>{selected.description}</p>{!available&&!done&&<span>필요 레벨과 선행 연구를 완료하세요.</span>}</div><button disabled={done||!available||!afford} onClick={()=>onUpgrade(selected.id)}>{done?'연구 완료':!afford?`연구금 ${selected.cost.toLocaleString()} 필요`:<><FlaskConical size={15}/>연구금 {selected.cost.toLocaleString()} · 연구하기</>}</button></footer>
  </section>
 </div>;
}
