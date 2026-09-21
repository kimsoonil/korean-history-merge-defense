'use client';
import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';

import {useEffect,useRef,useState} from 'react';
import {BookOpen,ChevronRight,Clock3,Coins,Heart,Home,Images,Info,RotateCcw,ShoppingBag,SkipForward,Sparkles,Play,X} from 'lucide-react';
import {basics,byName,createRoundInvader,enemyPortraits,pathAt,recipeStatus,recipes,waveNames,type Enemy,type Soldier,type UnitDef} from '@/lib/game';

import LegendaryReveal from './LegendaryReveal';
import HeroCodex from './HeroCodex';
import BackgroundMusic from './BackgroundMusic';
import {getMusicMood} from '@/lib/music';
import {useLegendaryReveal} from './useLegendaryReveal';
import {legendaryScenes,resumeStageDeadline} from '@/lib/legendary';
import {canSkipStage,stageClearGold,canAutoAdvanceRound,canCompleteStage} from '@/lib/stage-flow';
import TitleScreen,{NewGameConfirm} from './TitleScreen';
import {moveOrSwap} from '@/lib/placement';
import StageClearPopup from './StageClearPopup';
import StageMap from './StageMap';
import BattleRoad from './BattleRoad';
import {combatStep,movementSpeed,roleDescription,attackRate} from '@/lib/combat';
import {heroSkillStep,heroSkillDescription} from '@/lib/hero-skills';
import HeroSkillFlash,{type SkillFlash} from './HeroSkillFlash';
import AttackRange from './AttackRange';
import {stageRoundCount,roundBossName,roundEnemyCount,roundKey,isStageComplete,isCampaignComplete,nextRound} from '@/lib/rounds';
import {CAMPAIGN_STORAGE_KEY,FINAL_WAVE,isWaveUnlocked,readCampaignProgress,recordWaveClear} from '@/lib/campaign';
import {SAVE_KEY,canContinue,makeGameSave,readGameSave,remainingStageMs,restoredCounters,type GameSave} from '@/lib/save';

type Phase='ready'|'battle'|'cleared'|'lost'|'won';
type Overlay='book'|'help'|null;
type AttackEffect={id:number;fromX:number;fromY:number;toX:number;toY:number;color:string};
const MAX_UNITS=40, SUMMON_COST=50, START_GOLD=400, SELL_GOLD=35, STAGE_SECONDS=30;
function Portrait({u,size='normal'}:{u:UnitDef;size?:'tiny'|'normal'|'large'}){
 const atlas=u.atlas,src=atlas?.src??u.portrait??'',status=useImageStatus(src);
 return <span className={`unit-portrait ${size} ${status==='ready'?'is-loaded':''}`} style={{'--unit-color':u.color} as React.CSSProperties}>
 {atlas?<svg className="atlas-viewport" viewBox="0 0 384 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{visibility:status==='ready'?'visible':'hidden'}}><svg width="384" height="512" viewBox={`${atlas.col*384} ${atlas.row*512} 384 512`} overflow="hidden"><image href={src} width="1536" height="1024"/></svg></svg>:<img src={src} alt="" style={{visibility:status==='ready'?'visible':'hidden'}}/>}
 <ImageLoadingIndicator status={status}/></span>;
}
function Hearts({remaining}:{remaining:number}){return <div className="heart-row" role="img" aria-label={`남은 하트 ${remaining}개`}>{Array.from({length:10},(_,i)=><Heart key={i} size={15} fill={i<remaining?'#e86557':'transparent'} color={i<remaining?'#f7aa78':'#78846a'} strokeWidth={2}/>)}</div>}
function AttackOverlay({effects}:{effects:AttackEffect[]}){return <svg className="battle-effects" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{effects.map(fx=><g key={fx.id} style={{'--fx-color':fx.color} as React.CSSProperties}><line className="attack-glow" x1={fx.fromX} y1={fx.fromY} x2={fx.toX} y2={fx.toY}/><line className="attack-streak" x1={fx.fromX} y1={fx.fromY} x2={fx.toX} y2={fx.toY} pathLength="100"/><circle className="attack-origin" cx={fx.fromX} cy={fx.fromY} r=".8"/><circle className="attack-impact" cx={fx.toX} cy={fx.toY} r="1.2"/></g>)}</svg>}

export default function Game(){
 const [home,setHome]=useState(true),[saved,setSaved]=useState<GameSave|null>(null),[saveReady,setSaveReady]=useState(false),[storageError,setStorageError]=useState(false),[confirmNew,setConfirmNew]=useState(false);
 const [mapOpen,setMapOpen]=useState(false),[mapModalOpen,setMapModalOpen]=useState(false),[pendingStage,setPendingStage]=useState(1),[highestClearedWave,setHighestClearedWave]=useState(0);
 const clearedWaveRef=useRef(0),homeRef=useRef(true);
 const markWaveCleared=(wave:number)=>{
  const next=recordWaveClear(clearedWaveRef.current,wave);if(next===clearedWaveRef.current)return;
  clearedWaveRef.current=next;setHighestClearedWave(next);
  try{window.localStorage.setItem(CAMPAIGN_STORAGE_KEY,JSON.stringify({version:1,highestClearedWave:next}));}catch{setStorageError(true);}
 };
 const [roster,setRoster]=useState<Soldier[]>([]),[gold,setGold]=useState(START_GOLD),[wall,setWall]=useState(10),[stage,setStage]=useState(1),[round,setRound]=useState(1),[phase,setPhase]=useState<Phase>('ready'),[timeLeft,setTimeLeft]=useState(STAGE_SECONDS),[enemies,setEnemies]=useState<Enemy[]>([]),[attackFx,setAttackFx]=useState<AttackEffect[]>([]),[selected,setSelected]=useState<number|null>(null),[overlay,setOverlay]=useState<Overlay>(null),[tier,setTier]=useState(2),[speed,setSpeed]=useState(1),[spawned,setSpawned]=useState(0),[notice,setNotice]=useState('병사를 모집하고 전투를 준비하세요.');
 const heroTimers=useRef(new Map<number,number>()),flashQueue=useRef<string[]>([]),flashSerial=useRef(0);
 const [skillFlash,setSkillFlash]=useState<SkillFlash|null>(null);
 const [mergeSuccess,setMergeSuccess]=useState<{id:number;unit:UnitDef}|null>(null);
 useEffect(()=>{if(!mergeSuccess)return;const timer=window.setTimeout(()=>setMergeSuccess(null),4000);return()=>window.clearTimeout(timer);},[mergeSuccess]);
 useEffect(()=>{if(home)setMergeSuccess(null);},[home]);
 useEffect(()=>{if(!skillFlash)return;const timer=window.setTimeout(()=>setSkillFlash(null),Math.max(0,skillFlash.expiresAt-Date.now()));return()=>window.clearTimeout(timer);},[skillFlash]);
 const idRef=useRef(1),deadlineRef=useRef<number|null>(null),completedStageRef=useRef(0),stateRef=useRef({roster,enemies,stage,round,spawned,phase,speed});stateRef.current={roster,enemies,stage,round,spawned,phase,speed};
 const legendary=useLegendaryReveal((pausedAt,now)=>{if(!homeRef.current&&stateRef.current.phase==='battle')deadlineRef.current=resumeStageDeadline(deadlineRef.current,pausedAt,now)});
 const previewLegendary=(name:string)=>{if(home){openCodex(name);return;}setOverlay(null);setSelected(null);setAttackFx([]);legendary.show(name,'preview')};
 const codexHeroRef=useRef(legendaryScenes[0].name);
 const openCodex=(name=codexHeroRef.current)=>{codexHeroRef.current=name;setOverlay(null);setAttackFx([]);legendary.show(name,'codex')};
 const progressRef=useRef({roster,enemies,gold,wall,stage,round,phase,spawned,speed});
 progressRef.current={roster,enemies,gold,wall,stage,round,phase,spawned,speed};
 const persistGame=()=>{
  if(homeRef.current)return;
  const current=progressRef.current;
  const snapshot=makeGameSave({...current,heroCooldowns:[...heroTimers.current].filter(([id])=>current.roster.some(s=>s.id===id&&byName[s.name].tier===5)),remainingMs:remainingStageMs(deadlineRef.current,current.phase,Date.now(),legendary.pausedAtRef.current)});
  setSaved(snapshot);
  try{window.localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));setStorageError(false);}catch{setStorageError(true);}
 };
 const returnHome=()=>{persistGame();flashQueue.current=[];setSkillFlash(null);homeRef.current=true;legendary.close();deadlineRef.current=null;setHome(true);setMapOpen(false);setMapModalOpen(false);setOverlay(null);setSelected(null);setAttackFx([]);};
 const continueGame=()=>{
  if(!canContinue(saved)||!saveReady)return;
  const counters=restoredCounters(saved);heroTimers.current=new Map(saved.heroCooldowns??[]);flashQueue.current=[];setSkillFlash(null);
  idRef.current=counters.nextId;completedStageRef.current=counters.completedStage;deadlineRef.current=counters.deadline;
  setRoster(saved.roster);setEnemies(saved.enemies);setGold(saved.gold);setWall(saved.wall);setStage(saved.stage);setRound(saved.round);setPhase(saved.phase);setSpawned(saved.spawned);setSpeed(saved.speed);setTimeLeft(Math.ceil(saved.remainingMs/1000));setAttackFx([]);setSelected(null);setOverlay(null);setNotice('저장된 방어전을 이어갑니다.');homeRef.current=false;setHome(false);
 };
 useEffect(()=>{
  try{
   const restored=readGameSave(window.localStorage.getItem(SAVE_KEY));setSaved(restored);
   const recorded=readCampaignProgress(window.localStorage.getItem(CAMPAIGN_STORAGE_KEY));
   const fromSave=restored?((restored.phase==='cleared'||restored.phase==='won')&&isStageComplete(restored.stage,restored.round)?restored.stage:restored.stage-1):0;
   const cleared=Math.max(recorded,fromSave);clearedWaveRef.current=cleared;setHighestClearedWave(cleared);
   if(cleared>recorded)window.localStorage.setItem(CAMPAIGN_STORAGE_KEY,JSON.stringify({version:1,highestClearedWave:cleared}));
  }catch{setStorageError(true);}setSaveReady(true);
 },[]);
 useEffect(()=>{
  if(home)return;
  persistGame();
  const timer=window.setInterval(persistGame,1000);
  const onHide=()=>{if(document.visibilityState==='hidden')persistGame();};
  window.addEventListener('pagehide',persistGame);document.addEventListener('visibilitychange',onHide);
  return()=>{window.clearInterval(timer);window.removeEventListener('pagehide',persistGame);document.removeEventListener('visibilitychange',onHide);};
 },[home,roster,gold,wall,stage,round,phase,spawned,speed]);
 const totalRounds=stageRoundCount(stage),finalRound=isCampaignComplete(stage,round),stageEnd=isStageComplete(stage,round),maxSpawn=roundEnemyCount(stage,round),bossEnemy=enemies.find(e=>e.boss),sel=roster.find(s=>s.id===selected),selDef=sel?byName[sel.name]:null,available=recipes.filter(u=>recipeStatus(u.recipe!,roster).every(Boolean));
 const stageCleared=phase==='cleared'&&stageEnd;
 const openStageSelection=()=>{returnHome();setMapOpen(true);};
 const skipReady=canSkipStage({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active});
 const summon=()=>{if(phase==='lost'||phase==='won')return;if(gold<SUMMON_COST){setNotice('골드가 부족합니다.');return}if(roster.length>=MAX_UNITS){setNotice('배치 공간이 가득 찼습니다.');return}const occupied=new Set(roster.map(s=>s.slot)),slot=Array.from({length:MAX_UNITS},(_,i)=>i).find(i=>!occupied.has(i));if(slot===undefined)return;const unit=basics[Math.floor(Math.random()*basics.length)],id=idRef.current++;setGold(g=>g-SUMMON_COST);setRoster(r=>[...r,{id,name:unit.name,slot}]);setNotice(`${unit.name} 모집! 조합서에서 재료를 확인하세요.`)};
 const merge=(u:UnitDef)=>{if(home||!u.recipe||phase==='lost'||phase==='won')return;const pool=[...roster],used:Soldier[]=[];for(const name of u.recipe){const i=pool.findIndex(s=>s.name===name);if(i<0){setNotice('조합 재료가 부족합니다.');return}used.push(pool.splice(i,1)[0])}const id=idRef.current++;setRoster(r=>[...r.filter(s=>!used.some(v=>v.id===s.id)),{id,name:u.name,slot:used[0].slot}]);setSelected(id);setOverlay(null);setMergeSuccess({id,unit:u});setNotice(`${u.name} 조합 성공!`);if(u.tier===5){setAttackFx([]);legendary.show(u.name)}};
 const sell=()=>{if(!sel||!selDef)return;const value=SELL_GOLD;setRoster(r=>r.filter(s=>s.id!==sel.id));setGold(g=>g+value);setSelected(null);setNotice(`${selDef.name} 판매 · ${value} 골드 획득`)};
 const move=(id:number,slot:number)=>{
  if(home||stageCleared||phase==='lost'||phase==='won'||legendary.active)return;
  const moving=roster.find(s=>s.id===id),other=roster.find(s=>s.slot===slot);
  if(!moving)return;
  setRoster(r=>moveOrSwap(r,id,slot));setSelected(null);
  setNotice(other?`${moving.name} ↔ ${other.name} 자리 교환 완료`:`${moving.name} 이동 완료`);
 };
 const selectSlot=(slot:number)=>{
  if(home||stageCleared||phase==='lost'||phase==='won'||legendary.active)return;
  const soldier=roster.find(s=>s.slot===slot);
  if(sel){if(soldier?.id===sel.id)setSelected(null);else move(sel.id,slot);}
  else if(soldier)setSelected(soldier.id);
 };
 const start=()=>{if(phase==='ready')beginRound(stage,round);};
 const beginRound=(nextStage:number,nextRoundNumber:number)=>{
  const boss=roundBossName(nextStage,nextRoundNumber);
  deadlineRef.current=Date.now()+STAGE_SECONDS*1000;completedStageRef.current=0;
  setTimeLeft(STAGE_SECONDS);setEnemies(boss?[createRoundInvader(nextStage,nextRoundNumber,0,idRef.current++)]:[]);
  setAttackFx([]);setStage(nextStage);setRound(nextRoundNumber);setPhase('battle');setSpawned(boss?1:0);setOverlay(null);
  setNotice(boss?`${boss} 출현! 1-${nextStage} · ${nextRoundNumber}라운드`:`1-${nextStage} · ${nextRoundNumber}라운드 시작`);
 };
 const advance=()=>{if(phase!=='cleared'||stageEnd||timeLeft>0||enemies.length>0)return;const next=nextRound(stage,round);if(next)beginRound(next.stage,next.round);};
 const finishRound=(skipTime=false)=>{
  if(completedStageRef.current===roundKey(stage,round))return;
  completedStageRef.current=roundKey(stage,round);deadlineRef.current=null;setTimeLeft(0);
  if(stageEnd){markWaveCleared(stage);setSelected(null);setOverlay(null);setAttackFx([]);setSkillFlash(null);flashQueue.current=[];}
  if(finalRound){setPhase('won');setNotice('살수대첩 승리!');return;}
  setGold(g=>g+(stageEnd?stageClearGold(stage):30+stage*5));
  if(stageEnd){setPhase('cleared');setNotice(`1-${stage} 클리어! 1-${stage+1} 스테이지가 개방되었습니다.`);return;}
  if(skipTime){const next=nextRound(stage,round);if(next)beginRound(next.stage,next.round);}
  else{setPhase('cleared');setNotice(stageEnd?`1-${stage} 클리어! 다음 스테이지가 열렸습니다.`:`${round}라운드 방어 성공! 다음 라운드를 진행하세요.`);}
 };
 const skip=()=>{if(skipReady)finishRound(true);};
 const prepareStage=(nextStage:number)=>{
  if(!isWaveUnlocked(nextStage,clearedWaveRef.current))return;
  legendary.close();heroTimers.current.clear();flashQueue.current=[];setSkillFlash(null);deadlineRef.current=null;completedStageRef.current=0;idRef.current=1;setConfirmNew(false);homeRef.current=false;setHome(false);setMapOpen(false);setMapModalOpen(false);setRoster([]);setGold(START_GOLD);setWall(10);setStage(nextStage);setRound(1);setTimeLeft(STAGE_SECONDS);setPhase('ready');setEnemies([]);setAttackFx([]);setSelected(null);setSpawned(0);setSpeed(1);setOverlay(null);setNotice(`1-${nextStage} · 병사를 모집하고 전투를 준비하세요.`);
 };
 const reset=()=>prepareStage(1);
 const newGame=()=>{if(!saveReady)return;setMapOpen(true);setMapModalOpen(false);};
 const chooseBattle=(wave:number)=>{if(!isWaveUnlocked(wave,clearedWaveRef.current))return;setPendingStage(wave);if(canContinue(saved))setConfirmNew(true);else prepareStage(wave);};
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOverlay(null);setSelected(null);}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 useEffect(()=>{
  if(!overlay)return;
  const previous=document.activeElement as HTMLElement|null;
  const dialog=document.querySelector<HTMLElement>(overlay==='book'?'.book-modal':'.help-modal');
  dialog?.querySelector<HTMLButtonElement>('button')?.focus();
  const onTab=(event:KeyboardEvent)=>{
   if(event.key!=='Tab'||!dialog)return;
   const controls=Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
   const index=controls.indexOf(document.activeElement as HTMLButtonElement);
   event.preventDefault();controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
  };
  dialog?.addEventListener('keydown',onTab);
  return()=>{dialog?.removeEventListener('keydown',onTab);if(previous?.isConnected&&!previous.closest('[inert]'))previous.focus();};
 },[overlay]);
 useEffect(()=>{if(home||phase==='lost'||phase==='won')return;
  let spawnClock=0,visualCooldown=0,effectLife=0,fxSerial=0,lastSecond=STAGE_SECONDS;
  const cooldowns=new Map<number,number>();
  const timer=window.setInterval(()=>{
   if(homeRef.current||legendary.pausedAtRef.current!==null)return;
   const s=stateRef.current,dt=.1*s.speed,limit=roundEnemyCount(s.stage,s.round);
   visualCooldown=Math.max(0,visualCooldown-.1);
   if(effectLife>0){effectLife-=.1;if(effectLife<=0)setAttackFx([])}
   if(s.phase==='battle'){
    const seconds=Math.max(0,Math.ceil(((deadlineRef.current??Date.now())-Date.now())/1000));
    if(seconds!==lastSecond){lastSecond=seconds;setTimeLeft(seconds);if(seconds===0)setNotice('30초 종료 · 남은 적을 모두 처치하면 다음 라운드가 자동 시작됩니다.')}
    spawnClock+=dt;
    if(spawnClock>=.72&&s.spawned<limit){spawnClock=0;const invader=createRoundInvader(s.stage,s.round,s.spawned,idRef.current++);setEnemies(old=>[...old,invader]);setSpawned(n=>n+1)}
   }
   const {hits,shots}=combatStep(s.roster,s.enemies,dt,s.stage,cooldowns);
   if(s.phase==='battle'){
    const skill=heroSkillStep(s.roster,s.enemies,.1,s.stage,heroTimers.current);
    for(const [id,damage] of skill.hits)hits.set(id,(hits.get(id)??0)+damage);
    if(skill.gold)setGold(g=>g+skill.gold);
    if(skill.hearts)setWall(h=>Math.min(10,h+skill.hearts));
    flashQueue.current=[...new Set([...flashQueue.current,...skill.casts])];
    // Each hero gets its own two-second image, even when multiple skills fire together.
    if(flashQueue.current.length&&Date.now()>=flashSerial.current){
     const name=flashQueue.current.shift()!;flashSerial.current=Date.now()+2000;
     setSkillFlash({names:[name],serial:flashSerial.current,expiresAt:flashSerial.current});
    }
   }
   if(shots.length&&visualCooldown<=0){setAttackFx(shots.map(shot=>({id:++fxSerial,fromX:shot.from.x,fromY:shot.from.y,toX:shot.to.x,toY:shot.to.y,color:shot.color})));visualCooldown=.1;effectLife=.36;}
   const killGold=s.enemies.filter(e=>e.hp<=(hits.get(e.id)??0)).reduce((total,e)=>total+e.reward,0);
   if(killGold)setGold(g=>g+killGold);
   setEnemies(old=>{
    if(!old.length)return old;
    let next=old.map(e=>({...e,progress:(e.progress+movementSpeed(e,s.roster)*dt)%1,hp:e.hp-(hits.get(e.id)||0)}));
    next=next.filter(e=>e.hp>0);
    return next;
   });
  },100);
  return()=>clearInterval(timer)
 },[home,phase,stage,round]);
 useEffect(()=>{if(home||legendary.active||phase==='lost'||phase==='won')return;if(wall<=0){setPhase('lost');setNotice('방어선이 무너졌습니다. 다시 도전하세요.');return}if(!canCompleteStage({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active},stage,round)&&!canAutoAdvanceRound({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active}))return;finishRound(true);},[home,wall,timeLeft,spawned,enemies.length,phase,stage,round,maxSpawn,legendary.active]);
 const phaseText={ready:'전투 준비',battle:'전투 중',cleared:'방어 성공',lost:'게임 오버',won:'최종 승리'}[phase],timeLabel=`00:${String(timeLeft).padStart(2,'0')}`;
 return <div className={`game-root ${home?'on-title':''} ${legendary.active?'cinematic-active':''}`}>
  <header className="game-header" inert={stageCleared||!!legendary.active||confirmNew||mapModalOpen||(home&&!!overlay)}><div className="game-brand game-brand-logo" title="한국사 조합 디펜스"><LoadingImage src="/game-logo.svg" alt="한국사 조합 디펜스 로고" width={42} height={42}/></div><div className="header-tools"><BackgroundMusic mood={home?'silent':getMusicMood(phase,enemies)}/>{!home&&<button className="home-return" onClick={returnHome} aria-label="저장 후 초기 화면으로" title="자동 저장 후 초기 화면"><Home size={16}/><span>메인</span></button>}<button className="hero-codex-open" onClick={()=>openCodex()} aria-label="영웅 도감 열기" title="5단계 영웅 도감"><Images size={16}/><span>도감</span></button><button className="icon-button" onClick={()=>setOverlay('help')} aria-label="게임 방법"><Info size={19}/></button></div></header>
  {home&&!mapOpen&&<TitleScreen save={saved} ready={saveReady} storageError={storageError} inert={stageCleared||!!legendary.active||!!overlay||confirmNew} onNew={newGame} onContinue={continueGame} onCodex={()=>openCodex()} onBook={()=>{setTier(2);setOverlay('book');}}/>}
  {home&&mapOpen&&<StageMap highestClearedWave={highestClearedWave} blocked={confirmNew||!!legendary.active||!!overlay} onModalChange={setMapModalOpen} onBack={()=>{setMapOpen(false);setMapModalOpen(false);}} onStart={chooseBattle}/>}
  {!home&&<>
  <div className="game-status" inert={stageCleared||!!legendary.active}><div className="status-stage"><small>STAGE</small><b>1-{String(stage).padStart(2,'0')}</b><span>라운드 {round} / {totalRounds}</span></div><div className="status-wall"><div><span><Heart size={14}/> 성벽</span><b>{wall}/10</b></div><Hearts remaining={wall}/></div><div className="status-enemy"><small>남은 적군</small><b>{enemies.length} <span>명</span></b></div><div className="status-gold"><small>보유 골드</small><b><Coins size={18}/>{gold}</b></div><div className="status-speed"><small>속도</small><div>{[1,2,3].map(n=><button className={speed===n?'on':''} key={n} aria-label={`전투 속도 ${n}배`} aria-pressed={speed===n} onClick={()=>setSpeed(n)}>{n}×</button>)}</div></div></div>
  <main className="game-main"><aside className="stage-panel" inert={stageCleared||!!legendary.active}><div className="panel-kicker">BATTLE STATUS · 전황</div><div className="hud-stage"><small>현재 스테이지</small><strong>1-{String(stage).padStart(2,'0')} <span>/ 1-{FINAL_WAVE}</span></strong><b>라운드 {round} / {totalRounds}{roundBossName(stage,round)?' · 보스전':''}</b></div><div className={`hud-stat hud-timer ${timeLeft===0?'overtime':''}`}><div><small>남은 시간</small><strong><Clock3 size={17}/>{timeLabel}</strong></div><p>{skipReady?'적군 전멸 · 스킵으로 바로 진행 가능':timeLeft>0?'적군 전멸 시 남은 시간 스킵 가능':enemies.length?`연장전 · 남은 적 ${enemies.length}명`:'적군 전멸 · 다음 단계 준비 완료'}</p></div><div className="hud-stat hud-enemies"><div><small>전장에 남은 적군</small><strong>{enemies.length}<span>명</span></strong></div><p>이번 라운드 출현 {spawned} / {maxSpawn}<br/>전멸 시 다음 단계가 열립니다.</p></div><div className="hud-stat"><div><small>성벽 생명력</small><strong>{wall}<span>/ 10</span></strong></div><Hearts remaining={wall}/></div><div className="hud-stat"><div><small>보유 골드</small><strong><Coins size={18}/>{gold}</strong></div></div><div className="hud-speed"><small>진행 속도</small><div>{[1,2,3].map(n=><button className={speed===n?'on':''} key={n} aria-label={`전투 속도 ${n}배`} aria-pressed={speed===n} onClick={()=>setSpeed(n)}>{n}×</button>)}</div></div><p className="hud-rule">10·20라운드, 이후 5라운드마다 보스가 등장합니다. 적군 전멸 시 남은 시간을 스킵할 수 있습니다.</p></aside>
  <section className="center-panel"><div className="arena-heading" inert={stageCleared||!!legendary.active}><div><small>TACTICAL FIELD · 사각 순환 전장</small><h1>{finalRound?'살수대첩':`1-${stage} · ${round}라운드`}</h1></div><div className={`phase-label ${phase}`}>{phaseText}{phase==='battle'||phase==='cleared'?` · ${timeLabel}`:''}</div></div><div className="arena-stage"><div className="arena-board"><div className="battle-world" inert={stageCleared||!!legendary.active}><LoadingBackground className="board-surface" src="/terrain/forest-ground.png"/><BattleRoad/><div className={`unit-grid ${sel?'has-selection':''}`}>{Array.from({length:MAX_UNITS},(_,i)=>{const soldier=roster.find(s=>s.slot===i),u=soldier?byName[soldier.name]:null;return <button key={i} className={`board-slot ${u?`filled tier-${u.tier}`:''} ${selected===soldier?.id?'selected':''}`} onClick={()=>selectSlot(i)} aria-pressed={!!soldier&&selected===soldier.id} aria-label={u?`${u.name} ${u.tier}단계`:`빈 칸 ${i+1}`} title={sel?(soldier?.id===sel.id?'다시 눌러 선택 취소':soldier?`${sel.name} ↔ ${soldier.name} 자리 교환`:'선택한 유닛을 이 칸으로 이동'):u?`${u.name} 선택 · 다른 유닛을 누르면 자리 교환`:'유닛을 먼저 선택하세요'}>{u?<><Portrait u={u} size="tiny"/><span>{u.name}</span></>:<span className="slot-plus">+</span>}</button>})}</div>{enemies.map(e=>{const p=pathAt(e.progress),art=enemyPortraits[e.name];return <div key={e.id} className={`invader ${e.boss?'boss':''} ${phase==='lost'||phase==='won'?'':'is-moving'}`} style={{left:`${p.x}%`,top:`${p.y}%`}} title={`${e.name} · ${Math.ceil(e.hp)} HP`}><span className="invader-hp"><i style={{width:`${Math.max(0,e.hp/e.maxHp*100)}%`}}/></span><span className="enemy-sprite-viewport" style={{'--step-delay':`-${(e.id%5)*.09}s`} as React.CSSProperties}><LoadingImage src={art.src} alt="" style={{width:'400%',height:'200%',left:`-${art.col*100}%`,top:`-${art.row*100}%`,maxWidth:'none'}}/></span>{e.boss&&<span className="boss-name">{e.name}</span>}</div>})}{sel&&selDef&&<AttackRange soldier={sel} unit={selDef}/>}<AttackOverlay effects={attackFx}/>{bossEnemy&&<div className="boss-banner"><b>♛ {bossEnemy.name}</b><span>{Math.ceil(bossEnemy.hp).toLocaleString()} / {bossEnemy.maxHp.toLocaleString()}</span><i><span style={{width:`${Math.max(0,bossEnemy.hp/bossEnemy.maxHp*100)}%`}}/></i></div>}<div className="board-count">배치 {roster.length} / {MAX_UNITS}</div></div>{skillFlash&&!legendary.active&&<HeroSkillFlash key={skillFlash.serial} flash={skillFlash}/>} {legendary.active&&legendary.active.mode!=='codex'&&<LegendaryReveal key={legendary.active.serial} scene={legendary.active.scene} preview={legendary.active.preview} onClose={legendary.close}/>}</div></div><div className="arena-foot" inert={stageCleared||!!legendary.active}><div className="arena-message">✧ {sel?`${sel.name} 선택 · 다른 유닛: 자리 교환 / 빈 칸: 이동 / 다시 클릭: 취소`:skipReady?'적군 전멸! 남은 시간을 스킵할 수 있습니다.':notice}</div><div className="wave-action"><span>{phase==='battle'?`${timeLeft>0?'진행':'연장전'} ${spawned}/${maxSpawn} · 남은 적 ${enemies.length}`:`라운드 ${round} / ${totalRounds}`}</span>{phase==='ready'?<button onClick={start}>전투 시작 <ChevronRight size={17}/></button>:phase==='battle'?<button className="wave-skip" onClick={skip} disabled={!skipReady} title={skipReady?'남은 시간을 건너뛰고 바로 진행합니다.':'이번 라운드의 적이 모두 출현하고 전멸하면 활성화됩니다.'}><SkipForward size={16}/>{finalRound?'스킵 · 결과 보기':stageEnd?'스킵 · 결과 보기':'스킵 · 다음 라운드'}</button>:phase==='cleared'?<button onClick={advance}>{stageEnd?'다음 스테이지':'다음 라운드'} <ChevronRight size={17}/></button>:<button onClick={reset}><RotateCcw size={16}/> 다시 시작</button>}</div></div></section>
  <aside className="detail-side" inert={stageCleared||!!legendary.active}><div className="panel-kicker">UNIT INTELLIGENCE</div><h3>전장 정보</h3>{selDef?<><div className="selected-top"><Portrait u={selDef} size="large"/><div><span>{'★'.repeat(selDef.tier)} · {selDef.role}</span><h2>{selDef.name}</h2></div></div><p className="selected-skill">{selDef.skill}<br/><strong>{roleDescription(selDef)}</strong>{selDef.tier===5&&<span className="hero-extra-skill">{heroSkillDescription(selDef.name)}</span>}</p><div className="selected-stats"><span>공격력 <b>{selDef.damage}</b></span><span>사거리 <b>{selDef.range}</b></span><span>공격 속도 <b>{sel?attackRate(sel,roster).toFixed(2):selDef.rate}</b></span></div><button className="side-sell" onClick={sell}><ShoppingBag size={16}/> 판매 · +{SELL_GOLD} 골드</button></>:<div className="detail-placeholder"><span>✦</span>유닛을 클릭하면 초상화와<br/>스탯·스킬이 표시됩니다.</div>}<div className="side-help"><BookOpen size={18}/><div><b>조합 가능한 영웅 {available.length}명</b><span>책을 열어 영웅의 계보를 확인하세요.</span></div></div><button className="side-book" onClick={()=>{setTier(2);setOverlay('book')}}><BookOpen size={19}/> 조합서 열기 <ChevronRight size={16}/></button></aside></main>
  <footer className="game-actions" inert={stageCleared||!!legendary.active}><div className="action-gold"><Coins size={25}/><b>{gold}</b><small>GOLD</small></div><button className="action-summon" onClick={summon} disabled={gold<SUMMON_COST||roster.length>=MAX_UNITS||phase==='lost'||phase==='won'}><Sparkles size={23}/><span><b>병사 모집</b><small>랜덤 1단계 · {SUMMON_COST} 골드</small></span></button><button className="action-book" onClick={()=>{setTier(2);setOverlay('book')}}><BookOpen size={24}/><span><b>조합서</b><small>{available.length}개 조합 가능</small></span></button><button className="action-sell" onClick={sell} disabled={!selDef}><ShoppingBag size={22}/><span><b>선택 유닛 판매</b><small>{selDef?`+${SELL_GOLD} 골드`:'유닛 선택 필요'}</small></span></button><button className="action-help" onClick={()=>setOverlay('help')}><Info size={19}/><span>게임 방법</span></button></footer>
  </>}
  {overlay==='book'&&<div className="overlay-shade" onMouseDown={e=>{if(e.target===e.currentTarget)setOverlay(null)}}><section className="book-modal" role="dialog" aria-modal="true" aria-label="조합서"><header><div><BookOpen size={24}/><span><small>THE HERO ARCHIVE</small><b>영웅 조합서</b></span></div><button onClick={()=>setOverlay(null)} aria-label="조합서 닫기"><X size={21}/></button></header><div className="book-tabs">{[2,3,4,5].map(n=><button key={n} className={tier===n?'active':''} onClick={()=>setTier(n)}>{n}단계 <span>{home?'8명':`${recipes.filter(u=>u.tier===n&&available.includes(u)).length}/8`}</span></button>)}</div><div className="book-grid">{recipes.filter(u=>u.tier===tier).map(u=>{const have=recipeStatus(u.recipe!,home?[]:roster),ready=!home&&have.every(Boolean);return <article key={u.name} className={`book-card ${ready?'ready':''}`}><div className="book-card-art" aria-hidden="true"><Portrait u={u} size="normal"/></div><div className="book-card-head"><div><small>{'★'.repeat(tier)} · {u.role}</small><h3>{u.name}</h3><span className="book-role-effect">{roleDescription(u)}</span></div>{u.tier===5&&<button className="book-preview" onClick={()=>previewLegendary(u.name)} aria-label={`${u.name} 등장 연출 미리보기`} title="등장 연출 미리보기"><Play size={13}/></button>}</div><div className="book-ingredients">{u.recipe!.map((name,i)=><span key={i} className={have[i]?'have':''}>{have[i]?'✓':'·'} {name}</span>)}</div><button disabled={home||!ready||phase==='lost'||phase==='won'} onClick={()=>merge(u)}>{home?'전투에서 조합 가능':ready?'조합하기':`재료 ${have.filter(Boolean).length}/${have.length}`}</button></article>})}</div></section></div>}
  {overlay==='help'&&<div className="overlay-shade" onMouseDown={e=>{if(e.target===e.currentTarget)setOverlay(null)}}><section className="help-modal" role="dialog" aria-modal="true" aria-label="게임 방법"><button className="help-close" onClick={()=>setOverlay(null)} aria-label="닫기"><X size={21}/></button><small>HOW TO PLAY</small><h2>한국사 조합 디펜스</h2><div><b>01 · 병사 모집</b><p>{SUMMON_COST}골드로 7종 병종 중 하나를 모집합니다. 새 게임은 {START_GOLD}골드로 시작합니다.</p><b>02 · 조합</b><p>책 모양 조합서를 열고 재료가 모인 영웅을 조합합니다. 유닛 선택 후 다른 유닛을 누르면 서로 자리를 바꾸고, 빈 칸을 누르면 이동합니다. 같은 유닛을 다시 누르면 선택이 취소됩니다.</p><b>03 · 방어</b><p>각 라운드는 30초입니다. 적이 모두 출현하고 전멸하면 남은 시간을 스킵해 바로 다음 라운드로 갈 수 있습니다. 30초가 지나고 적이 모두 처치되면 다음 라운드가 자동 시작됩니다. 적이 남아 있으면 처치될 때까지 전투가 계속됩니다.</p></div><button className="help-done" onClick={()=>setOverlay(null)}>{home?'초기 화면으로 돌아가기':'전장으로 돌아가기'}</button></section></div>}
  {!home&&stageCleared&&<StageClearPopup stage={stage} rounds={totalRounds} onMap={openStageSelection} onHome={returnHome}/>}
  {!home&&(phase==='won'||phase==='lost')&&<div className="overlay-shade result-shade"><section className={`result-modal ${phase}`} role="dialog" aria-modal="true" aria-label={phase==='lost'?'패배 결과':'클리어 결과'}><div className="result-emblem">{phase==='lost'?'✖':'✦'}</div><small>{phase==='lost'?'DEFENSE FAILED':'SALSU VICTORY'}</small><h2>{phase==='lost'?'패배했습니다':'살수대첩 클리어!'}</h2><p>{phase==='lost'?'성벽의 하트가 모두 사라졌습니다. 병종을 다시 조합해 도전하세요.':'수양제를 물리치고 수나라의 침공을 막아냈습니다.'}</p><button onClick={reset}>{phase==='won'?'처음부터 다시 플레이':'다시 도전'} <ChevronRight size={17}/></button><button className="result-home" onClick={returnHome}>초기 화면으로</button></section></div>}
  {!home&&selDef&&<div className="mobile-unit-info"><button className="mobile-unit-close" onClick={()=>setSelected(null)} aria-label="유닛 정보 닫기"><X size={15}/></button><div className="mobile-unit-head"><Portrait u={selDef} size="normal"/><div><b>{selDef.name}</b><span>{'★'.repeat(selDef.tier)} · {selDef.role}</span></div></div><p>{selDef.skill}<br/><strong>{roleDescription(selDef)}</strong>{selDef.tier===5&&<span className="hero-extra-skill">{heroSkillDescription(selDef.name)}</span>}</p><div className="mobile-unit-bottom"><span>공격 {selDef.damage} · 사거리 {selDef.range} · 속도 {sel?attackRate(sel,roster).toFixed(2):selDef.rate}</span><button onClick={sell}>판매 +{SELL_GOLD}G</button></div></div>}
  {!home&&mergeSuccess&&<div key={mergeSuccess.id} className="merge-success" role="status" aria-live="polite" aria-atomic="true"><Portrait u={mergeSuccess.unit} size="normal"/><div><strong>✓ 조합 성공!</strong><span>{mergeSuccess.unit.tier}단계 · {mergeSuccess.unit.name}</span><small>유닛이 전장에 배치되었습니다.</small></div><button onClick={()=>setMergeSuccess(null)} aria-label="조합 완료 알림 닫기"><X size={18}/></button></div>}
  {confirmNew&&<NewGameConfirm onConfirm={()=>prepareStage(pendingStage)} onCancel={()=>setConfirmNew(false)}/>}
  {legendary.active?.mode==='codex'&&<HeroCodex scene={legendary.active.scene} onSelect={openCodex} onClose={legendary.close}/>}
 </div>;
}
