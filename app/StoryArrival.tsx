'use client';
import {useEffect,useRef,useState} from 'react';
import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';
import {byName} from '@/lib/game';
import {STORY_KEY,TUTORIAL_RECIPE,TUTORIAL_HERO,freshStory,readStory,storyDialogue,storyRoster,storyGold,advanceStory,recruitTutorial,mergeTutorial,type StoryProgress} from '@/lib/story';
import useBattleAmbience from './useBattleAmbience';
function StoryUnit({name}:{name:string}){
 const unit=byName[name],atlas=unit.atlas,status=useImageStatus(atlas?.src??unit.portrait??'');
 return <span className="story-unit"><span className="story-unit-art">{atlas?<><svg viewBox="0 0 384 512" aria-label={name} role="img" style={{visibility:status==='ready'?'visible':'hidden'}}><svg width="384" height="512" viewBox={`${atlas.col*384} ${atlas.row*512} 384 512`} overflow="hidden"><image href={atlas.src} width="1536" height="1024"/></svg></svg><ImageLoadingIndicator status={status}/></>:<LoadingImage src={unit.portrait} alt={name}/>}</span><b>{name}</b></span>;
}
export default function StoryArrival({nickname,replay,onClose,onBattle}:{nickname:string;replay:boolean;onClose:()=>void;onBattle:(progress:StoryProgress)=>void}){
 const [progress,setProgress]=useState(freshStory),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false),[flash,setFlash]=useState(false),[book,setBook]=useState(false);
 const focus=useRef<HTMLHeadingElement>(null),ambience=useBattleAmbience();
 useEffect(()=>{if(!replay)try{setProgress(readStory(localStorage.getItem(STORY_KEY)));}catch{setStorageError(true);}setReady(true);},[replay]);
 useEffect(()=>{if(!ready||replay)return;try{localStorage.setItem(STORY_KEY,JSON.stringify(progress));}catch{setStorageError(true);}},[ready,replay,progress]);
 useEffect(()=>{focus.current?.focus();},[progress.step]);
 useEffect(()=>{if(!flash)return;const timer=window.setTimeout(()=>setFlash(false),1200);return()=>window.clearTimeout(timer);},[flash]);
 const next=()=>{if(progress.step===0){ambience.start();setFlash(true);}setProgress(advanceStory);};
 const dialogue=storyDialogue(progress.step,nickname),roster=storyRoster(progress);
 const step=progress.step;
 return <main className={`story-arrival ${flash?'story-flash':''}`}>
  <LoadingBackground className="story-backdrop" src="/story/yodong-612.png"/><div className="story-whiteout" aria-hidden="true"/>
  <header><div><small>{step<4?'02 · 첫 전장':'03 · 천명도첩의 각성'}</small><h1>612년 · 요동성</h1></div><div><button aria-pressed={ambience.enabled} onClick={ambience.toggle}>{ambience.enabled?'효과음 끄기':'효과음 켜기'}</button><button onClick={onClose}>나중에 계속</button></div></header>
  <div className="story-content">
   <aside className="story-journal"><small>지금까지의 이야기</small><h2>{step<4?'낯선 시대의 성벽':'역사를 잇는 힘'}</h2><p>{step<4?`${nickname}은 천명도첩에 이끌려 612년 요동성에 도착했다. 수나라의 공세에 고구려의 방어선이 흔들리고 있다.`:`${nickname}은 천명도첩으로 병사들을 소환하고, 영웅을 조합해 고구려군을 돕기로 했다.`}</p><span>1-1 스테이지 · 1라운드 진입 전</span><small>역사에서 영감을 얻은 판타지 연출입니다.</small></aside>
   <section className="story-dialogue" aria-labelledby="story-speaker">
    {(step===3||step===10)&&<div className="story-general"><StoryUnit name="을지문덕"/></div>}
    <h2 id="story-speaker" ref={focus} tabIndex={-1}>{dialogue.speaker}</h2><p className={step===11?'story-system':''}>{dialogue.text}</p>
    {(step===6||step===9)&&<div className="story-training">
     <div className="story-training-top"><strong>보유 골드 {storyGold(progress)} G</strong><span>{step===6?`모집 ${progress.summoned} / 4`:progress.merged?'조합 성공!':'조합 재료 준비 완료'}</span></div>
     <div className="story-roster" aria-label="튜토리얼 보유 유닛">{roster.length?roster.map(unit=><StoryUnit key={unit.id} name={unit.name}/>):<span>병사를 모집하면 이곳에 나타납니다.</span>}</div>
     {step===6&&<><button className="story-primary" disabled={progress.summoned===4} onClick={()=>setProgress(recruitTutorial)}>병사 모집 · 50 G</button><small>이번 안내에서만 창병 → 창병 → 기병 → 포수가 등장합니다. 일반 전투에서는 랜덤 모집입니다.</small></>}
     {step===9&&!progress.merged&&<><button className="story-primary" onClick={()=>setBook(v=>!v)}>조합서 {book?'닫기':'열기'}</button>{book&&<div className="story-recipe"><h3>2단계 · 온달</h3><p>{TUTORIAL_RECIPE.join(' + ')}</p><button className="story-primary" onClick={()=>{setProgress(mergeTutorial);setBook(false);}}>온달 조합하기</button></div>}</>}
     {step===9&&progress.merged&&<p role="status">{TUTORIAL_HERO} 조합 성공! 재료 4명이 영웅 1명으로 합쳐졌습니다.</p>}
    </div>}
    <div className="story-next-row"><span>{step+1} / 13</span>{step===12?<button className="story-primary" onClick={()=>{ambience.stop();onBattle(progress);}}>1라운드 시작 →</button>:<button className="story-primary" disabled={!ready||(step===6&&progress.summoned<4)||(step===9&&!progress.merged)} onClick={next}>{step===0?'빛 너머로 이동':step===6?'조합 배우기':'다음'} →</button>}</div>
    {step===12&&<small>온달과 남은 200골드로 시작합니다. 기존 전투가 있다면 교체 전에 확인합니다.</small>}
    {storageError&&<p role="status">진행 상황을 저장하지 못했습니다. 이 창을 유지해 주세요.</p>}
   </section>
  </div>
 </main>;
}
