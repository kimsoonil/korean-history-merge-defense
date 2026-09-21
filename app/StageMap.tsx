'use client';
import {memo,useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronLeft,ChevronRight,Compass,Flag,Lock,Map,Mouse,Shield,Swords,X} from 'lucide-react';
import {stageRoundCount} from '@/lib/rounds';
import {campaignNodes,chapterOneBattles,horizontalWheelDelta,isWaveUnlocked,nextUnlockedWave,MAP_HEIGHT,MAP_WIDTH} from '@/lib/campaign';

const routePath=campaignNodes.reduce((path,node,i)=>{
  if(i===0)return `M${node.x} ${node.y}`;
  const previous=campaignNodes[i-1],middle=(previous.x+node.x)/2;
  return `${path} C${middle} ${previous.y} ${middle} ${node.y} ${node.x} ${node.y}`;
},'');
const MapTerrain=memo(function MapTerrain(){
  const coast='M-30 85 Q100 38 220 90 T440 100 Q580 55 685 174 Q780 250 900 185 Q1030 110 1180 138 Q1320 65 1450 114 Q1570 168 1720 104 Q1880 30 2020 155 Q2140 246 2270 144 Q2400 70 2560 113 Q2740 34 2890 117 L3030 78 L3030 610 Q2900 661 2810 550 Q2650 474 2530 549 Q2390 653 2290 568 Q2180 528 2250 459 Q2280 383 2160 366 Q2070 423 1940 350 Q1840 297 1760 419 Q1680 510 1570 450 Q1490 419 1450 507 Q1350 610 1240 578 Q1120 660 993 576 Q893 630 790 552 Q680 480 620 581 Q510 689 376 603 Q262 700 153 595 Q49 570 -30 645 Z';
  const trees=Array.from({length:240},(_,i)=>({x:30+(i*137)%2940,y:155+(i*59)%350,scale:.45+(i%5)*.08})).filter(tree=>campaignNodes.every(node=>Math.hypot(tree.x-node.x,(tree.y-node.y)*.8)>(node.terrain==='plain'?145:90)));
  const hills=Array.from({length:18},(_,i)=>({x:80+i*171,y:220+(i*97)%260}));
  return <svg className="map-terrain" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="map-sea" x2="0" y2="1"><stop stopColor="#68aaa9"/><stop offset="1" stopColor="#326c80"/></linearGradient>
      <linearGradient id="map-grass" x2="0" y2="1"><stop stopColor="#c2c98a"/><stop offset=".6" stopColor="#a3b877"/><stop offset="1" stopColor="#75995c"/></linearGradient>
      <pattern id="map-waves" width="118" height="65" patternUnits="userSpaceOnUse"><path d="M8 28q12 8 24 0m34 26q14 7 28-1" stroke="#c2e6d3" strokeWidth="2" fill="none" opacity=".24"/></pattern>
      <clipPath id="map-land-clip"><path d={coast}/></clipPath>
      <g id="map-tree"><ellipse cy="18" rx="21" ry="9" fill="#284b31" opacity=".25"/><path d="M-4 0h8v23h-8z" fill="#645742"/><path d="M0-42C-15-41-17-26-21-20C-35-13-26 9-15 11C-8 26 20 17 25 6C37-4 26-24 17-24C19-35 10-43 0-42" fill="#315b3b" stroke="#244c35" strokeWidth="2"/><path d="M-16-15Q-20-34-3-34Q12-38 15-24Q29-8 12 0Q-5 11-19-3" fill="#597c46"/><path d="M-12-24Q-2-35 9-25" fill="none" stroke="#88a25a" strokeWidth="5" strokeLinecap="round"/></g>
      <g id="map-pine"><path d="M-3 6h6v22h-6" fill="#64533a"/><path d="M0-54L-18-22H-11L-28 1H-16L-35 21H35L17 1H28L11-22H18Z" fill="#356143" stroke="#294c38" strokeWidth="2"/><path d="M0-44L-11-23H0L-15 0H0L-20 17H1" fill="#719457"/></g>
      <g id="map-mountain"><path d="M-67 44L-18-47Q0-70 15-39L68 44Z" fill="#778771" stroke="#4a6654" strokeWidth="3"/><path d="M-18-47L-9 45H-65Z" fill="#9fac86"/><path d="M-18-47L-36-18L-19-26L-6-13L6-28Z" fill="#ede7c3"/><path d="M15-18L51 36" stroke="#536e59" strokeWidth="5" fill="none"/></g>
      <g id="map-boat"><path d="M-34 8Q0 47 36 8Z" fill="#725740" stroke="#263f47" strokeWidth="3"/><path d="M0-54V20" stroke="#ead7a2" strokeWidth="4"/><path d="M5-50L5 2L35-2Z" fill="#ebd4a0"/><path d="M-5-42L-5 0L-27-3Z" fill="#c7b587"/><path d="M-45 33Q-25 38-6 34M14 36Q34 41 47 34" stroke="#b3d6c8" strokeWidth="3" fill="none" opacity=".5"/></g>
    </defs>
    <path fill="url(#map-sea)" d={`M0 0H${MAP_WIDTH}V${MAP_HEIGHT}H0Z`}/><path fill="url(#map-waves)" d={`M0 0H${MAP_WIDTH}V${MAP_HEIGHT}H0Z`}/>
    <path d={coast} fill="none" stroke="#93cdc1" strokeWidth="55" opacity=".28"/>
    <path d={coast} transform="translate(0 16)" fill="#264e4c" stroke="#76afb0" strokeWidth="30" opacity=".6"/>
    <path d={coast} fill="url(#map-grass)" stroke="#d3c487" strokeWidth="20" strokeLinejoin="round"/>
    <path d={coast} fill="none" stroke="#f4df9d" strokeWidth="3" opacity=".65"/>
    <g clipPath="url(#map-land-clip)">
      {hills.map((hill,i)=><g key={i} transform={`translate(${hill.x} ${hill.y})`}><ellipse rx="105" ry="55" fill={i%2?'#658d53':'#d5d69b'} opacity=".17"/><path d="M-65 5Q-12-45 48-12" fill="none" stroke="#e0dfa8" strokeWidth="3" opacity=".22"/></g>)}
      {Array.from({length:110},(_,i)=><path key={i} d={`M${20+i*29} ${185+(i*83)%330}l4-7m3 8l3-5`} stroke="#5d854e" strokeWidth="1.5" opacity=".3" strokeLinecap="round"/>)}
      <path d="M-40 380Q300 110 540 220T1000 250T1500 260T2050 210T2730 230L3080 300" stroke="#d6d499" strokeWidth="78" fill="none" opacity=".14"/>
      <path d="M270 80C175 205 342 270 290 365S315 490 245 640" stroke="#628c76" strokeWidth="44" fill="none"/>
      <path d="M270 80C175 205 342 270 290 365S315 490 245 640" stroke="#88b8b0" strokeWidth="29" fill="none"/>
      {trees.map((tree,i)=><use key={i} href={i%4===0?'#map-pine':'#map-tree'} transform={`translate(${tree.x} ${tree.y}) scale(${tree.scale})`}/>)}
      {[365,475,590,2740,2850,2960].map((x,i)=><use key={x} href="#map-mountain" transform={`translate(${x} ${155+(i%3)*15}) scale(${.75+(i%3)*.1})`}/>)}
      {[{x:1680,y:270},{x:2280,y:280}].map(hill=><g key={hill.x} transform={`translate(${hill.x} ${hill.y})`}><ellipse cy="24" rx="130" ry="64" fill="#537b46" opacity=".32"/><path d="M-128 25Q-55-95 24-53Q90-57 130 25Q30 76-128 25Z" fill="#8fa867" stroke="#6f8d55" strokeWidth="3"/><path d="M-86-4Q-20-64 56-24" fill="none" stroke="#c5cb89" strokeWidth="5" opacity=".7"/></g>)}
      <path d="M2160 344Q2255 330 2320 365T2470 375" fill="none" stroke="#678f7f" strokeWidth="30"/>
      <path d="M2160 344Q2255 330 2320 365T2470 375" fill="none" stroke="#91c6bb" strokeWidth="20"/>
      
    </g>
    {/* Offshore islands leave stage 7 on open water, not on an island. */}
    <g fill="#91a863" stroke="#d7c585" strokeWidth="10">
      <path d="M1820 490Q1850 457 1880 486Q1900 526 1855 545Q1802 535 1820 490Z"/>
      <path d="M2085 590Q2120 558 2154 589Q2180 620 2130 642Q2080 632 2085 590Z"/>
      <path d="M1920 650Q1950 631 1970 652Q1985 678 1940 683Z"/>
    </g>
    <use href="#map-tree" transform="translate(1850 505) scale(.65)"/>
    <use href="#map-pine" transform="translate(2125 600) scale(.65)"/>
    {/* The channel cuts all land layers so stage 9 lies between two coasts. */}
    <g clipPath="url(#map-land-clip)">
    <path d="M2540 50C2500 180 2660 250 2590 420S2530 555 2600 700" fill="none" stroke="#d3c487" strokeWidth="116"/>
    <path d="M2540 50C2500 180 2660 250 2590 420S2530 555 2600 700" fill="none" stroke="#8abbb6" strokeWidth="96"/>
    <path d="M2540 50C2500 180 2660 250 2590 420S2530 555 2600 700" fill="none" stroke="#467f91" strokeWidth="68"/>
    </g>
    <g fill="none" stroke="#c1e6de" strokeWidth="2" opacity=".55"><path d="M2567 360q25-15 32-42M2574 468q-19 26-15 48M2600 376q23-21 25-46"/></g>
    <use href="#map-boat" transform="translate(1920 440) scale(.65)"/><use href="#map-boat" transform="translate(2050 570) scale(.55)"/>
    <use href="#map-boat" transform="translate(2620 290) scale(.5)"/>
    <g transform="translate(84 613)" fill="none" stroke="#dce4c0" opacity=".65"><circle r="30"/><path d="M0-45L9-9L45 0L9 9L0 45L-9 9L-45 0L-9-9Z"/><path d="M0-45V45M-45 0H45"/><text y="-54" textAnchor="middle" fill="#e6e9cc" stroke="none" fontSize="13">N</text></g>
  </svg>;
});

function MapDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const rootRef=useRef<HTMLElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>{if(previous?.isConnected)previous.focus();};},[]);
  return <div className="stage-map-shade" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={rootRef} className="stage-map-dialog" role="dialog" aria-modal="true" aria-label={title} onKeyDown={event=>{
    if(event.key==='Escape'){event.stopPropagation();onClose();}
    if(event.key==='Tab'){const controls=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]);const index=controls.indexOf(document.activeElement as HTMLButtonElement);event.preventDefault();controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}
  }}>{children}</section></div>;
}

export default function StageMap({onBack,onStart,blocked,onModalChange,highestClearedWave}:{onBack:()=>void;onStart:(wave:number)=>void;blocked:boolean;onModalChange:(open:boolean)=>void;highestClearedWave:number}){
  const viewRef=useRef<HTMLDivElement>(null),dragRef=useRef<{id:number;x:number;left:number}|null>(null);
  const [chapter,setChapter]=useState<number|null>(null),[wave,setWave]=useState(1),[scroll,setScroll]=useState({left:0,max:1,width:1}),[dragging,setDragging]=useState(false);
  const close=()=>{setChapter(null);onModalChange(false);};
  const choose=(id:number)=>{setChapter(id);setWave(nextUnlockedWave(highestClearedWave));onModalChange(true);};
  useEffect(()=>{
    const view=viewRef.current;if(!view)return;
    const update=()=>setScroll({left:view.scrollLeft,max:Math.max(0,view.scrollWidth-view.clientWidth),width:view.clientWidth});
    const wheel=(event:WheelEvent)=>{if(event.ctrlKey)return;const delta=horizontalWheelDelta(event.deltaX,event.deltaY,event.deltaMode,view.clientWidth);if(delta){event.preventDefault();view.scrollLeft+=delta;}};
    view.addEventListener('wheel',wheel,{passive:false});view.addEventListener('scroll',update,{passive:true});
    const observer=new ResizeObserver(update);observer.observe(view);update();
    return()=>{view.removeEventListener('wheel',wheel);view.removeEventListener('scroll',update);observer.disconnect();};
  },[]);
  const scrollMap=(direction:number)=>{const view=viewRef.current;if(view)view.scrollBy({left:direction*view.clientWidth*.75,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  const active=chapterOneBattles[wave-1];
  return <main className="stage-map-screen" inert={blocked}>
    <div className="stage-map-shell" inert={chapter!==null}>
      <header className="stage-map-heading"><button onClick={onBack} className="map-back" aria-label="초기 화면으로 돌아가기"><ArrowLeft size={17}/><span>초기 화면</span></button><div><small>CHOOSE YOUR BATTLE</small><h1>스테이지 선택</h1></div><span className="map-chapter-count"><Flag size={14}/> 1 / 10 개방</span></header>
      <div className="map-intro"><span><Compass size={16}/> 역사 속 전장을 선택하세요. 지형은 게임용으로 재구성했습니다.</span><small><span className="map-legend-dot"/> 도전 가능 <span className="map-legend-dot locked"/> 준비 중</small></div>
      <div ref={viewRef} className={`stage-map-viewport ${dragging?'dragging':''}`} tabIndex={0} role="region" aria-label="좌우로 탐색하는 스테이지 지도" onKeyDown={event=>{
        if(event.target!==event.currentTarget)return;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();scrollMap(event.key==='ArrowRight'?1:-1);}
        if(event.key==='Home'||event.key==='End'){event.preventDefault();event.currentTarget.scrollLeft=event.key==='Home'?0:event.currentTarget.scrollWidth;}
      }} onPointerDown={event=>{
        if(event.pointerType!=='mouse'||event.button!==0||(event.target as Element).closest('button'))return;
        dragRef.current={id:event.pointerId,x:event.clientX,left:event.currentTarget.scrollLeft};event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
      }} onPointerMove={event=>{const drag=dragRef.current;if(drag&&drag.id===event.pointerId)event.currentTarget.scrollLeft=drag.left+drag.x-event.clientX;}} onPointerUp={event=>{if(dragRef.current?.id===event.pointerId){dragRef.current=null;setDragging(false);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}} onPointerCancel={()=>{dragRef.current=null;setDragging(false);}}>
        <div className="stage-map-world">
          <MapTerrain/>
          <svg className="map-route" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true"><path className="map-route-shadow" d={routePath}/><path className="map-route-dots" d={routePath}/></svg>
          {campaignNodes.map(node=><button key={node.id} className={`map-node terrain-${node.terrain} ${node.available?'available':'upcoming'}`} style={{left:`${node.x/MAP_WIDTH*100}%`,top:`${node.y/MAP_HEIGHT*100}%`}} onClick={()=>choose(node.id)} aria-label={`스테이지 ${String(node.id).padStart(2,'0')}${node.available?'':' 준비 중'}`}><span className="map-node-number">{node.available&&<Flag size={15}/>}<b>{node.id}</b>{!node.available&&<Lock size={11}/>}</span><span className="map-node-label"><strong>스테이지 {String(node.id).padStart(2,'0')}</strong></span></button>)}
        </div>
      </div>
      <footer className="map-navigation"><button onClick={()=>scrollMap(-1)} disabled={scroll.left<=1} aria-label="지도 왼쪽으로 이동"><ChevronLeft size={20}/></button><div className="map-navigation-center"><p><Mouse size={13}/><span>휠 · 드래그 · 좌우 화살표로 지도 이동</span></p><div className="map-scroll-track"><i style={{width:`${scroll.width/(scroll.width+scroll.max)*100}%`,left:`${scroll.left/(scroll.width+scroll.max)*100}%`}}/></div></div><button onClick={()=>scrollMap(1)} disabled={scroll.left>=scroll.max-1} aria-label="지도 오른쪽으로 이동"><ChevronRight size={20}/></button></footer>
    </div>
    {chapter===1&&<MapDialog title="1 스테이지 전투 선택" onClose={close}>
      <header className="map-dialog-header"><span className="map-dialog-emblem"><Shield size={24}/></span><div><small>전투 선택 · 여덟 번의 방어전</small><h2>스테이지 01</h2></div><button onClick={close} aria-label="스테이지 선택 팝업 닫기"><X size={20}/></button></header>
      <p className="map-dialog-description">이전 전투를 클리어하면 다음 전투가 열립니다. <b>{highestClearedWave}/8 클리어</b></p>
      <div className="map-battle-list" role="group" aria-label="1-1부터 1-8까지 전투 목록">{chapterOneBattles.map(battle=>{const unlocked=isWaveUnlocked(battle.wave,highestClearedWave),cleared=battle.wave<=highestClearedWave;return <button key={battle.wave} className={`map-battle-row ${battle.boss?'final':''} ${wave===battle.wave?'selected':''} ${cleared?'completed':''}`} aria-label={`${battle.code} ${battle.name}${!unlocked?' · 이전 전투 클리어 필요':''}`} aria-pressed={wave===battle.wave} disabled={!unlocked} title={!unlocked?`1-${battle.wave-1} 클리어 후 활성화`:cleared?'클리어한 전투 · 다시 도전 가능':'도전 가능'} onClick={()=>setWave(battle.wave)}><span className="map-battle-code">{battle.code}</span><b>{battle.name}<small className="battle-round-count">{stageRoundCount(battle.wave)}라운드</small></b><span className="map-battle-kind">{!unlocked?<><Lock size={12}/> 잠김</>:cleared?<><Check size={13}/> 클리어</>:battle.boss?<><Swords size={13}/> 보스전</>:'도전 가능'}</span><ChevronRight size={15}/></button>;})}</div>
      <footer className="map-dialog-footer"><p>{active.boss?'55라운드 최종 보스 수양제':'10·20라운드, 이후 5라운드마다 수나라 장군 출현'}</p><button disabled={!isWaveUnlocked(wave,highestClearedWave)} onClick={()=>onStart(wave)}>{active.code} 전투 준비 <ArrowRight size={18}/></button><small>새로 시작해도 스테이지 개방 기록은 유지됩니다.</small></footer>
    </MapDialog>}
    {chapter!==null&&chapter!==1&&<MapDialog title={`${chapter} 스테이지 준비 중`} onClose={close}><button className="map-coming-close" onClick={close} aria-label="준비 중 안내 닫기"><X size={20}/></button><div className="map-coming"><span><Map size={34}/></span><h2>스테이지 {String(chapter).padStart(2,'0')}</h2><b className="map-coming-status">준비 중입니다</b><p>{chapter===2&&highestClearedWave===8?'1 스테이지 클리어 완료 · 다음 전장을 기다려주세요.':`${chapter-1} 스테이지를 클리어한 뒤 도전할 수 있습니다.`}</p><button onClick={close}>지도로 돌아가기</button></div></MapDialog>}
  </main>;
}
