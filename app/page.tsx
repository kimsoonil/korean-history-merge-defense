'use client';
import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';

import {useEffect,useRef,useState} from 'react';
import {Backpack,BookOpen,ChevronRight,Clock3,Coins,Heart,Home,Images,Info,RotateCcw,ShoppingBag,SkipForward,Sparkles,Play,X} from 'lucide-react';
import {basics,byName,createRoundInvader,enemyPortraits,pathAt,recipes,waveNames,type Enemy,type Soldier,type UnitDef} from '@/lib/game';

import LegendaryReveal from './LegendaryReveal';
import HeroCodex from './HeroCodex';
import UnitBag from './UnitBag';
import ProfileSettings,{ProfileAvatar} from './ProfileSettings';
import {DEPLOY_LIMIT,inventoryRecipeStatus,combineInventory,storeUnits,deployUnits,sellStored,migrateDeployment,type Bag} from '@/lib/inventory';
import BattleSettings from './BattleSettings';
import {tickBossTimers,expiredBoss,BOSS_SECONDS} from '@/lib/boss-timer';
import {frontIntro} from '@/lib/front-intro';
import {bossLine,defeatedDialogueBoss,victoryMessage,type BossLine} from '@/lib/battle-dialogue';
import Prologue from './Prologue';
import StoryArrival from './StoryArrival';
import StoryBooks from './StoryBooks';
import {STORY_KEY,storyRoster,storyGold,type StoryProgress} from '@/lib/story';
import {PLAYER_KEY,readPlayer,awardHardClear,HARD_CLEAR_TITLE,type PlayerProfile} from '@/lib/player';
import UpgradeDialog from './UpgradeDialog';
import {emptyUpgrades,readUpgrades,purchaseUpgrade,upgradedAttack,type UpgradeKind} from '@/lib/upgrades';
import {getMusicMood} from '@/lib/music';
import {useLegendaryReveal} from './useLegendaryReveal';
import {legendaryScenes,resumeStageDeadline} from '@/lib/legendary';
import {canSkipStage,canAutoAdvanceRound,canCompleteStage,isOverrun} from '@/lib/stage-flow';
import TitleScreen,{NewGameConfirm} from './TitleScreen';
import {moveOrSwap} from '@/lib/placement';
import StageClearPopup from './StageClearPopup';
import StageMap from './StageMap';
import {progressKey,ansiVictory,type ChapterId} from '@/lib/ansi';
import {drawBannedHeroes,HARD_PROGRESS_KEY} from '@/lib/hard-mode';
import type {Difficulty} from '@/lib/enemy-stats';
import BattleTerrain from './BattleTerrain';
import {combatStep,advanceEnemy,roleDescription,attackRate} from '@/lib/combat';
import {heroSkillStep,heroSkillDescription} from '@/lib/hero-skills';
import {activeHeroBuffs} from '@/lib/hero-buffs';
import HeroSkillFlash,{type SkillFlash} from './HeroSkillFlash';
import AttackRange from './AttackRange';
import {salePrice} from '@/lib/selling';
import {stageRoundCount,roundBossName,roundEnemyCount,roundKey,ROUND_CLEAR_GOLD,isStageComplete,isCampaignComplete,nextRound} from '@/lib/rounds';
import {frontForStage,CAMPAIGN_STORAGE_KEY,FINAL_WAVE,isWaveUnlocked,readCampaignProgress,recordWaveClear} from '@/lib/campaign';
import {SAVE_KEY,canContinue,makeGameSave,readGameSave,remainingStageMs,restoredCounters,type GameSave} from '@/lib/save';

type Phase='ready'|'battle'|'cleared'|'lost'|'won';
type Overlay='book'|'help'|null;
type AttackEffect={id:number;fromX:number;fromY:number;toX:number;toY:number;color:string};
const MAX_UNITS=40, SUMMON_COST=50, START_GOLD=400, STAGE_SECONDS=30;
function Portrait({u,size='normal'}:{u:UnitDef;size?:'tiny'|'normal'|'large'}){
 const atlas=u.atlas,src=atlas?.src??u.portrait??'',status=useImageStatus(src);
 return <span className={`unit-portrait ${size} ${status==='ready'?'is-loaded':''}`} style={{'--unit-color':u.color} as React.CSSProperties}>
 {atlas?<svg className="atlas-viewport" viewBox="0 0 384 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{visibility:status==='ready'?'visible':'hidden'}}><svg width="384" height="512" viewBox={`${atlas.col*384} ${atlas.row*512} 384 512`} overflow="hidden"><image href={src} width="1536" height="1024"/></svg></svg>:<img src={src} alt="" style={{visibility:status==='ready'?'visible':'hidden'}}/>}
 <ImageLoadingIndicator status={status}/></span>;
}
function Hearts({remaining}:{remaining:number}){return <div className="heart-row" role="img" aria-label={`남은 하트 ${remaining}개`}>{Array.from({length:10},(_,i)=><Heart key={i} size={15} fill={i<remaining?'#e86557':'transparent'} color={i<remaining?'#f7aa78':'#78846a'} strokeWidth={2}/>)}</div>}
function AttackOverlay({effects}:{effects:AttackEffect[]}){return <svg className="battle-effects" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{effects.map(fx=><g key={fx.id} style={{'--fx-color':fx.color} as React.CSSProperties}><line className="attack-glow" x1={fx.fromX} y1={fx.fromY} x2={fx.toX} y2={fx.toY}/><line className="attack-streak" x1={fx.fromX} y1={fx.fromY} x2={fx.toX} y2={fx.toY} pathLength="100"/><circle className="attack-origin" cx={fx.fromX} cy={fx.fromY} r=".8"/><circle className="attack-impact" cx={fx.toX} cy={fx.toY} r="1.2"/></g>)}</svg>}

export default function Game(){
 const [chapter,setChapter]=useState<ChapterId>(1);
 const [difficulty,setDifficulty]=useState<Difficulty>('normal'),[pendingDifficulty,setPendingDifficulty]=useState<Difficulty>('normal'),[bannedHeroes,setBannedHeroes]=useState<string[]>([]),[hardCleared,setHardCleared]=useState(0);
 const hardClearedRef=useRef(0);
 const [booksOpen,setBooksOpen]=useState(false);
 const [storyOpen,setStoryOpen]=useState(false),[storyBattle,setStoryBattle]=useState<StoryProgress|null>(null);
 const [player,setPlayer]=useState<PlayerProfile|null>(null),[playerReady,setPlayerReady]=useState(false),[playerStorageError,setPlayerStorageError]=useState(false),[replayPrologue,setReplayPrologue]=useState(false);
 useEffect(()=>{try{setPlayer(readPlayer(localStorage.getItem(PLAYER_KEY)));}catch{setPlayerStorageError(true);}setPlayerReady(true);},[]);
 const savePlayer=(next:PlayerProfile)=>{setPlayer(next);try{localStorage.setItem(PLAYER_KEY,JSON.stringify(next));setPlayerStorageError(false);}catch{setPlayerStorageError(true);}};

 const [profileOpen,setProfileOpen]=useState(false);
 const [bag,setBag]=useState<Bag>({}),[bagOpen,setBagOpen]=useState(false);
 const [autoStoreBasic,setAutoStoreBasic]=useState(false);
 useEffect(()=>{try{setAutoStoreBasic(localStorage.getItem('defense-auto-store-basic')==='true');}catch{}},[]);
 const toggleAutoStoreBasic=(enabled:boolean)=>{
  setAutoStoreBasic(enabled);
  try{localStorage.setItem('defense-auto-store-basic',String(enabled));}catch{setStorageError(true);}
  if(enabled)changeBag('store',1);
 };
 const [upgrades,setUpgrades]=useState(emptyUpgrades),[upgradeOpen,setUpgradeOpen]=useState(false);
 const [home,setHome]=useState(true),[saved,setSaved]=useState<GameSave|null>(null),[saveReady,setSaveReady]=useState(false),[storageError,setStorageError]=useState(false),[confirmNew,setConfirmNew]=useState(false);
 const [mapOpen,setMapOpen]=useState(false),[mapModalOpen,setMapModalOpen]=useState(false),[pendingStage,setPendingStage]=useState(1),[highestClearedWave,setHighestClearedWave]=useState(0);
 useEffect(()=>{if(!player||!saveReady||chapter!==1)return;const next=awardHardClear(player,hardCleared);if(next!==player)savePlayer(next);},[player,hardCleared,saveReady,chapter]);
 const clearedWaveRef=useRef(0),homeRef=useRef(true);
 const markWaveCleared=(wave:number)=>{
  if(difficulty==='hard'){const next=recordWaveClear(hardClearedRef.current,wave);hardClearedRef.current=next;setHardCleared(next);try{localStorage.setItem(progressKey(chapter,true),JSON.stringify({version:1,highestClearedWave:next}));}catch{setStorageError(true);}return;}
  const next=recordWaveClear(clearedWaveRef.current,wave);if(next===clearedWaveRef.current)return;
  clearedWaveRef.current=next;setHighestClearedWave(next);
  try{window.localStorage.setItem(progressKey(chapter),JSON.stringify({version:1,highestClearedWave:next}));}catch{setStorageError(true);}
 };
 const [roster,setRoster]=useState<Soldier[]>([]),[gold,setGold]=useState(START_GOLD),[wall,setWall]=useState(10),[stage,setStage]=useState(1),[round,setRound]=useState(1),[phase,setPhase]=useState<Phase>('ready'),[timeLeft,setTimeLeft]=useState(STAGE_SECONDS),[enemies,setEnemies]=useState<Enemy[]>([]),[attackFx,setAttackFx]=useState<AttackEffect[]>([]),[selected,setSelected]=useState<number|null>(null),[overlay,setOverlay]=useState<Overlay>(null),[tier,setTier]=useState(2),[speed,setSpeed]=useState(1),[spawned,setSpawned]=useState(0),[notice,setNotice]=useState('병사를 모집하고 전투를 준비하세요.');
 const heroTimers=useRef(new Map<number,number>()),flashQueue=useRef<string[]>([]),flashSerial=useRef(0);
 const [skillFlash,setSkillFlash]=useState<SkillFlash|null>(null);
 const [bossDialogue,setBossDialogue]=useState<(BossLine&{id:number})|null>(null);
 useEffect(()=>{if(!bossDialogue||phase==='won')return;const timer=window.setTimeout(()=>setBossDialogue(null),8000);return()=>window.clearTimeout(timer);},[bossDialogue,phase]);
 useEffect(()=>{if(home||phase==='lost')setBossDialogue(null);},[home,phase]);
 const [battleIntro,setBattleIntro]=useState(false);
 useEffect(()=>{if(!battleIntro)return;const timer=window.setTimeout(()=>setBattleIntro(false),8000);return()=>window.clearTimeout(timer);},[battleIntro]);
 useEffect(()=>{if(home||phase==='lost'||phase==='won')setBattleIntro(false);},[home,phase]);
 const [mergeSuccess,setMergeSuccess]=useState<{id:number;unit:UnitDef;stored:boolean}|null>(null);
 useEffect(()=>{if(!mergeSuccess)return;const timer=window.setTimeout(()=>setMergeSuccess(null),4000);return()=>window.clearTimeout(timer);},[mergeSuccess]);
 useEffect(()=>{if(home)setMergeSuccess(null);},[home]);
 useEffect(()=>{if(!skillFlash)return;const timer=window.setTimeout(()=>setSkillFlash(null),Math.max(0,skillFlash.expiresAt-Date.now()));return()=>window.clearTimeout(timer);},[skillFlash]);
 const idRef=useRef(1),deadlineRef=useRef<number|null>(null),completedStageRef=useRef(0),stateRef=useRef({roster,enemies,stage,round,spawned,phase,speed,upgrades,difficulty,chapter});stateRef.current={roster,enemies,stage,round,spawned,phase,speed,upgrades,difficulty,chapter};
 const legendary=useLegendaryReveal((pausedAt,now)=>{if(!homeRef.current&&stateRef.current.phase==='battle')deadlineRef.current=resumeStageDeadline(deadlineRef.current,pausedAt,now)});
 const previewLegendary=(name:string)=>{if(home){openCodex(name);return;}setOverlay(null);setSelected(null);setAttackFx([]);legendary.show(name,'preview')};
 const codexHeroRef=useRef(legendaryScenes[0].name);
 const openCodex=(name=codexHeroRef.current)=>{codexHeroRef.current=name;setOverlay(null);setAttackFx([]);legendary.show(name,'codex')};
 const progressRef=useRef({roster,bag,enemies,gold,wall,stage,round,phase,spawned,speed,upgrades,difficulty,bannedHeroes,chapter});
 progressRef.current={roster,bag,enemies,gold,wall,stage,round,phase,spawned,speed,upgrades,difficulty,bannedHeroes,chapter};
 const persistGame=()=>{
  if(homeRef.current)return;
  const current=progressRef.current;
  const snapshot=makeGameSave({...current,heroCooldowns:[...heroTimers.current].filter(([id])=>current.roster.some(s=>s.id===id&&byName[s.name].tier===5)),remainingMs:remainingStageMs(deadlineRef.current,current.phase,Date.now(),legendary.pausedAtRef.current)});
  setSaved(snapshot);
  try{window.localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));setStorageError(false);}catch{setStorageError(true);}
 };
 const selectChapter=(next:ChapterId)=>{setChapter(next);let normal=0,hard=0;try{normal=readCampaignProgress(localStorage.getItem(progressKey(next)));hard=readCampaignProgress(localStorage.getItem(progressKey(next,true)));}catch{setStorageError(true);}clearedWaveRef.current=normal;hardClearedRef.current=hard;setHighestClearedWave(normal);setHardCleared(hard);};
 const returnHome=()=>{setBagOpen(false);setUpgradeOpen(false);persistGame();flashQueue.current=[];setSkillFlash(null);homeRef.current=true;legendary.close();deadlineRef.current=null;setHome(true);setMapOpen(false);setMapModalOpen(false);setOverlay(null);setSelected(null);setAttackFx([]);};
 const continueGame=()=>{
  if(!canContinue(saved)||!saveReady)return;
  selectChapter(saved.chapter??1);
  setDifficulty(saved.difficulty??'normal');setBannedHeroes(saved.bannedHeroes??[]);
  const counters=restoredCounters(saved);heroTimers.current=new Map(saved.heroCooldowns??[]);flashQueue.current=[];setSkillFlash(null);
  idRef.current=counters.nextId;completedStageRef.current=counters.completedStage;deadlineRef.current=counters.deadline;
  setUpgrades(readUpgrades(saved.upgrades));setUpgradeOpen(false);const inventory=migrateDeployment(saved.roster,saved.bag??{});setRoster(inventory.roster);setBag(inventory.bag);setEnemies(saved.enemies);setGold(saved.gold);setWall(saved.wall);setStage(saved.stage);setRound(saved.round);setPhase(saved.phase);setSpawned(saved.spawned);setSpeed(saved.speed);setTimeLeft(Math.ceil(saved.remainingMs/1000));setAttackFx([]);setSelected(null);setOverlay(null);setNotice('저장된 방어전을 이어갑니다.');homeRef.current=false;setHome(false);
 };
 useEffect(()=>{
  try{
   const restored=readGameSave(window.localStorage.getItem(SAVE_KEY));setSaved(restored);
   const hardRecord=readCampaignProgress(localStorage.getItem(HARD_PROGRESS_KEY));hardClearedRef.current=hardRecord;setHardCleared(hardRecord);
   const recorded=readCampaignProgress(window.localStorage.getItem(CAMPAIGN_STORAGE_KEY));
   const fromSave=restored&&(restored.chapter??1)===1&&restored.difficulty!=='hard'?((restored.phase==='cleared'||restored.phase==='won')&&isStageComplete(restored.stage,restored.round)?restored.stage:restored.stage-1):0;
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
 },[home,roster,bag,gold,wall,stage,round,phase,spawned,speed,upgrades]);
 const front=frontForStage(stage,chapter),intro=frontIntro(stage,chapter);
 const totalRounds=stageRoundCount(stage),finalRound=isCampaignComplete(stage,round),stageEnd=isStageComplete(stage,round),maxSpawn=roundEnemyCount(stage,round,difficulty),bossEnemy=enemies.find(e=>e.boss),sel=roster.find(s=>s.id===selected),selDef=sel?byName[sel.name]:null,available=recipes.filter(u=>!bannedHeroes.includes(u.name)&&inventoryRecipeStatus(u.recipe!,roster,bag).every(Boolean));
 const stageCleared=phase==='cleared'&&stageEnd;
 const openStageSelection=()=>{returnHome();setBooksOpen(false);setStoryOpen(false);setMapOpen(true);};
 const openStorySelection=()=>{returnHome();setStoryOpen(false);setBooksOpen(true);};
 const skipReady=canSkipStage({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active});
 const summon=()=>{if(phase==='lost'||phase==='won'||gold<SUMMON_COST)return;const unit=basics[Math.floor(Math.random()*basics.length)];setGold(g=>g-SUMMON_COST);if(autoStoreBasic||roster.length>=DEPLOY_LIMIT){setBag(b=>({...b,[unit.name]:(b[unit.name]??0)+1}));setNotice(`${unit.name} 모집 · 가방에 보관했습니다.`);return;}const slot=Array.from({length:MAX_UNITS},(_,i)=>i).find(i=>!roster.some(s=>s.slot===i))!;setRoster(r=>[...r,{id:idRef.current++,name:unit.name,slot}]);setNotice(`${unit.name} 모집!`);};
 const changeBag=(action:'store'|'deploy'|'sell',tier:number,name?:string,all=false)=>{
  if(homeRef.current||phase==='lost'||phase==='won'||stageCleared||legendary.active)return;
  const current=progressRef.current;
  if(action==='sell'&&name){const result=sellStored(current.bag,name,all);progressRef.current={...current,bag:result.bag,gold:current.gold+result.gold};setBag(result.bag);setGold(g=>g+result.gold);return;}
  const result=action==='store'?storeUnits(current.roster,current.bag,tier):deployUnits(current.roster,current.bag,tier,idRef.current,name,!!name);
  if('nextId' in result&&typeof result.nextId==='number')idRef.current=result.nextId;
  progressRef.current={...current,roster:result.roster,bag:result.bag};stateRef.current={...stateRef.current,roster:result.roster};
  setRoster(result.roster);setBag(result.bag);setSelected(null);setNotice(`${result.count}명 ${action==='store'?'보관':'배치'} 완료`);
 };
 useEffect(()=>{if(home||phase==='lost'||phase==='won'||stageCleared||legendary.active)setBagOpen(false);},[home,phase,stageCleared,legendary.active]);

 const merge=(u:UnitDef)=>{
  if(bannedHeroes.includes(u.name)){setNotice('이번 하드 전투에서 조합이 금지된 영웅입니다.');return;}
  if(homeRef.current||phase==='lost'||phase==='won'||stageCleared||legendary.active)return;
  const current=progressRef.current,id=idRef.current,result=combineInventory(u,current.roster,current.bag,id);
  if(!result.ok){setNotice(result.reason==='capacity'?'5단계 영웅을 배치할 자리가 필요합니다. 전장 유닛을 가방에 넣어 주세요.':'조합 재료가 부족합니다.');return;}
  idRef.current++;
  progressRef.current={...current,roster:result.roster,bag:result.bag};stateRef.current={...stateRef.current,roster:result.roster};
  setRoster(result.roster);setBag(result.bag);setSelected(result.stored?null:id);setOverlay(null);setMergeSuccess({id,unit:u,stored:result.stored});
  setNotice(`${u.name} 조합 성공! ${result.stored?'가방에 보관했습니다.':'전장에 배치했습니다.'}`);
  if(u.tier===5){setAttackFx([]);legendary.show(u.name)}
 };
 const buyUpgrade=(kind:UpgradeKind,key:string)=>{
  const current=progressRef.current;
  if(homeRef.current||current.phase==='lost'||current.phase==='won'||(current.phase==='cleared'&&isStageComplete(current.stage,current.round)))return;
  const result=purchaseUpgrade(current.upgrades,current.gold,kind,key,current.difficulty);if(!result)return;
  progressRef.current={...current,...result};stateRef.current={...stateRef.current,upgrades:result.upgrades};
  setGold(result.gold);setUpgrades(result.upgrades);setNotice('공격력 강화 완료!');
 };
 const sell=()=>{if(!sel||!selDef)return;const value=salePrice(selDef);if(value===null){setNotice('최상위 유닛은 판매할 수 없습니다.');return;}setRoster(r=>r.filter(s=>s.id!==sel.id));setGold(g=>g+value);setSelected(null);setNotice(`${selDef.name} 판매 · ${value} 골드 획득`)};
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
  setBattleIntro(nextRoundNumber===1&&frontIntro(nextStage,chapter)!==null);
  const boss=roundBossName(nextStage,nextRoundNumber,chapter);
  const arrival=boss?bossLine(boss,nextStage,false,chapter):null;
  if(arrival)setBossDialogue({...arrival,id:Date.now()});
  deadlineRef.current=Date.now()+STAGE_SECONDS*1000;completedStageRef.current=0;
  setTimeLeft(STAGE_SECONDS);setEnemies(old=>boss?[...old,createRoundInvader(nextStage,nextRoundNumber,0,idRef.current++,difficulty,chapter)]:old);
  setAttackFx([]);setStage(nextStage);setRound(nextRoundNumber);setPhase('battle');setSpawned(boss?1:0);setOverlay(null);
  setNotice(boss?`${boss} 출현! ${chapter}-${nextStage} · ${nextRoundNumber}라운드`:`${chapter}-${nextStage} · ${nextRoundNumber}라운드 시작`);
 };
 const advance=()=>{if(phase!=='cleared'||stageEnd||timeLeft>0||enemies.length>0)return;const next=nextRound(stage,round);if(next)beginRound(next.stage,next.round);};
 const finishRound=(skipTime=false)=>{
  if(stageEnd&&bossDialogue?.defeated)return;
  if(completedStageRef.current===roundKey(stage,round))return;
  completedStageRef.current=roundKey(stage,round);deadlineRef.current=null;setTimeLeft(0);
  setGold(g=>g+ROUND_CLEAR_GOLD);
  if(stageEnd){setUpgradeOpen(false);markWaveCleared(stage);setSelected(null);setOverlay(null);setAttackFx([]);setSkillFlash(null);flashQueue.current=[];}
  if(finalRound){const line=bossLine(chapter===2?'당 태종':'수양제',stage,true,chapter);if(line)setBossDialogue({...line,id:Date.now()});setPhase('won');setNotice((chapter===2?ansiVictory:victoryMessage)+(chapter===1&&difficulty==='hard'&&!player?.hardClearReward?' · 최초 클리어 보상: 살수의 지배자 칭호와 붉은 프로필 테두리 획득!':''));return;}
  if(stageEnd){setPhase('cleared');setNotice(`${chapter}-${stage} 클리어! ${chapter}-${stage+1} 스테이지가 개방되었습니다.`);return;}
  if(skipTime){const next=nextRound(stage,round);if(next)beginRound(next.stage,next.round);}
  else{setPhase('cleared');setNotice(stageEnd?`${chapter}-${stage} 클리어! 다음 스테이지가 열렸습니다.`:`${round}라운드 방어 성공! 다음 라운드를 진행하세요.`);}
 };
 const skip=()=>{if(skipReady)finishRound(true);};
 const prepareStage=(nextStage:number,mode:Difficulty=difficulty)=>{
  setBossDialogue(null);setBattleIntro(false);
  if(mode==='hard'&&clearedWaveRef.current<10)return;
  if(!isWaveUnlocked(nextStage,mode==='hard'?hardClearedRef.current:clearedWaveRef.current))return;
  setDifficulty(mode);setBannedHeroes(mode==='hard'?drawBannedHeroes(Math.random,chapter):[]);
  setUpgrades(emptyUpgrades());setUpgradeOpen(false);legendary.close();heroTimers.current.clear();flashQueue.current=[];setSkillFlash(null);deadlineRef.current=null;completedStageRef.current=0;idRef.current=1;setConfirmNew(false);homeRef.current=false;setHome(false);setMapOpen(false);setMapModalOpen(false);setRoster([]);setBag({});setBagOpen(false);setGold(START_GOLD);setWall(10);setStage(nextStage);setRound(1);setTimeLeft(STAGE_SECONDS);setPhase('ready');setEnemies([]);setAttackFx([]);setSelected(null);setSpawned(0);setSpeed(1);setOverlay(null);setNotice(`${chapter}-${nextStage} · 병사를 모집하고 전투를 준비하세요.`);
 };
 const launchStoryBattle=(progress:StoryProgress)=>{
  if(progress.step!==12||!progress.merged||progress.summoned!==4)return;
  selectChapter(1);prepareStage(1,'normal');setRoster(storyRoster(progress));setGold(storyGold(progress));idRef.current=6;setStoryOpen(false);setStoryBattle(null);
  if(player)savePlayer({...player,tutorialComplete:true});
  try{localStorage.removeItem(STORY_KEY);}catch{}
  beginRound(1,1);setNotice(`${player?.nickname}의 첫 전투 · 온달과 함께 요동성을 지켜내세요!`);
 };
 const requestStoryBattle=(progress:StoryProgress)=>{if(canContinue(saved)){setStoryBattle(progress);setConfirmNew(true);}else launchStoryBattle(progress);};
 const reset=()=>prepareStage(1);
 const newGame=()=>{if(!saveReady)return;setBooksOpen(true);setMapOpen(false);setMapModalOpen(false);};
 const chooseBattle=(wave:number,mode:Difficulty='normal')=>{if(mode==='hard'&&clearedWaveRef.current<10)return;if(!isWaveUnlocked(wave,mode==='hard'?hardClearedRef.current:clearedWaveRef.current))return;setPendingDifficulty(mode);setPendingStage(wave);if(chapter===1&&mode==='normal'&&wave===1&&!player?.tutorialComplete){setBooksOpen(true);setMapOpen(false);setMapModalOpen(false);return;}if(canContinue(saved))setConfirmNew(true);else prepareStage(wave,mode);};
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
  let lastBossTick=Date.now();
  const timer=window.setInterval(()=>{
   const now=Date.now(),bossElapsed=(now-lastBossTick)/1000;lastBossTick=now;
   if(homeRef.current||legendary.pausedAtRef.current!==null)return;
   const s=stateRef.current,dt=.1*s.speed,limit=roundEnemyCount(s.stage,s.round,s.difficulty);
   const timedEnemies=s.phase==='battle'?tickBossTimers(s.enemies,bossElapsed):s.enemies;
   const timedOut=expiredBoss(timedEnemies);
   if(timedOut){setEnemies(timedEnemies);setWall(0);setPhase('lost');deadlineRef.current=null;setNotice(`${timedOut.name} 처치 제한시간 90초를 초과했습니다.`);return;}
   visualCooldown=Math.max(0,visualCooldown-.1);
   if(effectLife>0){effectLife-=.1;if(effectLife<=0)setAttackFx([])}
   if(s.phase==='battle'){
    const seconds=Math.max(0,Math.ceil(((deadlineRef.current??Date.now())-Date.now())/1000));
    if(seconds!==lastSecond){lastSecond=seconds;setTimeLeft(seconds);if(seconds===0)setNotice('30초 종료 · 다음 라운드 진행 (마지막 라운드는 적 전멸 시 클리어)')}
    spawnClock+=dt;
    if(spawnClock>=.72&&s.spawned<limit){spawnClock=0;const invader=createRoundInvader(s.stage,s.round,s.spawned,idRef.current++,s.difficulty,s.chapter);setEnemies(old=>[...old,invader]);setSpawned(n=>n+1);if(isOverrun(s.enemies.length+1)){setWall(0);setPhase('lost');deadlineRef.current=null;setNotice('적군이 100명 누적되어 방어선이 무너졌습니다.');return;}}
   }
   const {hits,shots,stuns}=combatStep(s.roster,s.enemies,dt,s.stage,cooldowns,s.upgrades,Math.random,activeHeroBuffs(s.roster,heroTimers.current));
   if(s.phase==='battle'){
    const skill=heroSkillStep(s.roster,s.enemies,.1,s.stage,heroTimers.current,s.upgrades);
    for(const [id,damage] of skill.hits)hits.set(id,(hits.get(id)??0)+damage);
    if(skill.gold)setGold(g=>g+skill.gold);
    // Wall healing is retired: defeat now depends on enemy accumulation.
    flashQueue.current=[...new Set([...flashQueue.current,...skill.casts])];
    // Each hero gets its own two-second image, even when multiple skills fire together.
    if(flashQueue.current.length&&Date.now()>=flashSerial.current){
     const name=flashQueue.current.shift()!;flashSerial.current=Date.now()+2000;
     setSkillFlash({names:[name],serial:flashSerial.current,expiresAt:flashSerial.current});
    }
   }
   if(shots.length&&visualCooldown<=0){setAttackFx(shots.map(shot=>({id:++fxSerial,fromX:shot.from.x,fromY:shot.from.y,toX:shot.to.x,toY:shot.to.y,color:shot.color})));visualCooldown=.1;effectLife=.36;}
   const defeated=defeatedDialogueBoss(s.enemies,hits);
   if(defeated){const line=bossLine(defeated.name,s.stage,true,s.chapter);if(line)setBossDialogue({...line,id:Date.now()});}
   const killGold=s.enemies.filter(e=>e.hp<=(hits.get(e.id)??0)).reduce((total,e)=>total+e.reward,0);
   if(killGold)setGold(g=>g+killGold);
   setEnemies(old=>{
    if(!old.length)return old;
    const bossTime=new Map(timedEnemies.filter(e=>e.boss).map(e=>[e.id,e.bossSeconds]));
    let next=old.map(e=>({...advanceEnemy(e,s.roster,dt,stuns.get(e.id)),...(e.boss&&bossTime.has(e.id)?{bossSeconds:bossTime.get(e.id)}:{}),hp:e.hp-(hits.get(e.id)||0)}));
    next=next.filter(e=>e.hp>0);
    return next;
   });
  },100);
  return()=>clearInterval(timer)
 },[home,phase,stage,round]);
 useEffect(()=>{if(home||legendary.active||phase==='lost'||phase==='won')return;if(isOverrun(enemies.length)){setWall(0);setPhase('lost');deadlineRef.current=null;setNotice('적군이 100명 누적되어 방어선이 무너졌습니다.');return}if(!canCompleteStage({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active},stage,round)&&!( !stageEnd&&canAutoAdvanceRound({phase,timeLeft,spawned,maxSpawn,enemyCount:enemies.length,paused:!!legendary.active})))return;finishRound(true);},[home,wall,timeLeft,spawned,enemies.length,phase,stage,round,maxSpawn,legendary.active,bossDialogue]);
 const phaseText={ready:'전투 준비',battle:'전투 중',cleared:'방어 성공',lost:'게임 오버',won:'최종 승리'}[phase],timeLabel=`00:${String(timeLeft).padStart(2,'0')}`;
 if(!playerReady)return <div className="game-root prologue"><p role="status">서책을 펼치는 중입니다…</p></div>;
 if(!player||!player.prologueComplete||replayPrologue)return <div className="game-root on-prologue"><Prologue profile={player} storageError={playerStorageError} onCreate={nickname=>savePlayer({version:1,nickname,prologueComplete:false})} onComplete={()=>{if(player)savePlayer({...player,prologueComplete:true});setReplayPrologue(false);setBooksOpen(true);}} onClose={replayPrologue?()=>setReplayPrologue(false):undefined}/></div>;
 if(booksOpen&&home)return <div className="game-root"><StoryBooks onBack={()=>setBooksOpen(false)} onSelect={next=>{selectChapter(next);setBooksOpen(false);setStoryOpen(true);}}/></div>;
 if(storyOpen&&home)return <div className="game-root"><StoryArrival chapter={chapter} nickname={player.nickname} onClose={()=>{setStoryOpen(false);setBooksOpen(true);}} onComplete={()=>{savePlayer({...player,tutorialComplete:true});setStoryOpen(false);setBooksOpen(false);setMapOpen(true);setMapModalOpen(false);}}/></div>;
 return <div className={`game-root ${home?'on-title':''} ${legendary.active?'cinematic-active':''}`}>
  {bagOpen&&!home&&<UnitBag bag={bag} roster={roster} autoStoreBasic={autoStoreBasic} onAutoStoreBasic={toggleAutoStoreBasic} onClose={()=>setBagOpen(false)} onStore={t=>changeBag('store',t)} onDeploy={(t,name)=>changeBag('deploy',t,name)} onSell={(name,all)=>changeBag('sell',0,name,all)} portrait={u=><Portrait u={u}/>}/>}
  {upgradeOpen&&!home&&<UpgradeDialog state={upgrades} gold={gold} difficulty={difficulty} disabled={phase==='lost'||phase==='won'||stageCleared} onBuy={buyUpgrade} onClose={()=>setUpgradeOpen(false)}/>}
  <header className="game-header" inert={stageCleared||!!legendary.active||confirmNew||mapModalOpen||(home&&!!overlay)}><div className="player-profile" title={`플레이어: ${player.nickname} · 이 브라우저에 저장된 프로필`}><ProfileAvatar avatar={player.avatar} frame={player.frame}/><span><small className={player.title==='salsu'?'reward-title':undefined}>{player.title==='salsu'?HARD_CLEAR_TITLE:'천명을 이을 자'}</small><b>{player.nickname}</b></span></div><div className="header-tools"><BattleSettings mood={home?'silent':getMusicMood(phase,enemies)} blocked={stageCleared||!!legendary.active||confirmNew||mapModalOpen||!!overlay||upgradeOpen} onStage={openStageSelection} onStory={openStorySelection} onCodex={()=>openCodex()} onHelp={()=>setOverlay('help')} onHome={returnHome} onProfile={()=>setProfileOpen(true)}/></div></header>
  {profileOpen&&<ProfileSettings profile={player} onSave={savePlayer} onClose={()=>setProfileOpen(false)}/>}
  {home&&!mapOpen&&<TitleScreen onProfile={()=>setProfileOpen(true)} onPrologue={()=>setReplayPrologue(true)} save={saved} ready={saveReady} storageError={storageError} inert={stageCleared||!!legendary.active||!!overlay||confirmNew} onNew={newGame} onContinue={continueGame} onCodex={()=>openCodex()} onBook={()=>{setTier(2);setOverlay('book');}}/>}
  {home&&mapOpen&&<StageMap key={chapter} chapter={chapter} hardCleared={hardCleared} highestClearedWave={highestClearedWave} blocked={confirmNew||!!legendary.active||!!overlay} onModalChange={setMapModalOpen} onBack={()=>{setMapOpen(false);setMapModalOpen(false);}} onStart={chooseBattle}/>}
  {!home&&<>
  <div className="game-status" inert={stageCleared||!!legendary.active}><div className="status-stage"><small>STAGE</small><b>{chapter}-{String(stage).padStart(2,'0')}</b><span>라운드 {round} / {totalRounds}</span></div><div className="status-enemy"><small>남은 적</small><b>{enemies.length}<span>/100</span></b></div><div className="status-gold"><small>보유 골드</small><b><Coins size={18}/>{gold}</b></div><div className="status-speed"><small>속도</small><div>{[1,2,3].map(n=><button className={speed===n?'on':''} key={n} aria-label={`전투 속도 ${n}배`} aria-pressed={speed===n} onClick={()=>setSpeed(n)}>{n}×</button>)}</div></div></div>
  <main className="game-main"><aside className="stage-panel" inert={stageCleared||!!legendary.active}><div className="panel-kicker">BATTLE STATUS · {difficulty==='hard'?'하드':'일반'}</div><div className="hud-stage"><small>현재 스테이지 · {difficulty==='hard'?'하드':'일반'}</small><strong>{chapter}-{String(stage).padStart(2,'0')} <span>/ {chapter}-{FINAL_WAVE}</span></strong><b>라운드 {round} / {totalRounds}{roundBossName(stage,round,chapter)?' · 보스전':''}</b></div><div className={`hud-stat hud-timer ${timeLeft===0?'overtime':''}`}><div><small>남은 시간</small><strong><Clock3 size={17}/>{timeLabel}</strong></div><p>{skipReady?'적군 전멸 · 스킵으로 바로 진행 가능':timeLeft>0?'적군 전멸 시 남은 시간 스킵 가능':enemies.length?`연장전 · 남은 적 ${enemies.length}명`:'적군 전멸 · 다음 단계 준비 완료'}</p></div><div className="hud-stat hud-enemies"><div><small>전장에 남은 적군</small><strong>{enemies.length}<span>/100</span></strong></div><p>이번 라운드 출현 {spawned} / {maxSpawn}<br/>100명 누적 시 패배합니다.</p></div><div className="hud-stat"><div><small>보유 골드</small><strong><Coins size={18}/>{gold}</strong></div></div><div className="hud-speed"><small>진행 속도</small><div>{[1,2,3].map(n=><button className={speed===n?'on':''} key={n} aria-label={`전투 속도 ${n}배`} aria-pressed={speed===n} onClick={()=>setSpeed(n)}>{n}×</button>)}</div></div><section className="battle-story" aria-label="진행 이야기"><h3>{chapter===2?'645년':'612년'} · {front.name}</h3><small>{chapter}-{stage} · 전투 {round}/{totalRounds}</small><p>{front.intro}</p><p><b>{chapter===2?'안시성주':'을지문덕'}</b><br/>{player.nickname}, {front.dialogue}</p><p><b>책의 정령</b><br/>{player.nickname}, 병사를 모집하고 영웅을 조합해 방어선을 지켜라.</p><button onClick={()=>setOverlay('book')}>조합서</button><button onClick={()=>openCodex()}>도감</button></section><p className="hud-rule">30초마다 다음 라운드 · 매 라운드 적 {maxSpawn}명 · 일반 적 처치당 {difficulty==='hard'?15:20}G. 적 100명 누적 시 패배합니다. 마지막 라운드는 남은 적을 모두 처치해야 클리어합니다.</p></aside>
  <section className="center-panel"><div className="arena-heading" inert={stageCleared||!!legendary.active}><div><small>TACTICAL FIELD · 사각 순환 전장</small><h1>{front.name} · {round}라운드</h1></div><div className={`phase-label ${phase}`}>{phaseText}{phase==='battle'||phase==='cleared'?` · ${timeLabel}`:''}</div></div><div className="arena-stage"><div className="arena-board"><div className="battle-world" inert={stageCleared||!!legendary.active}><BattleTerrain chapter={chapter} stage={stage}/><div className={`unit-grid ${sel?'has-selection':''}`}>{Array.from({length:MAX_UNITS},(_,i)=>{const soldier=roster.find(s=>s.slot===i),u=soldier?byName[soldier.name]:null;return <button key={i} className={`board-slot ${u?`filled tier-${u.tier}`:''} ${selected===soldier?.id?'selected':''}`} onClick={()=>selectSlot(i)} aria-pressed={!!soldier&&selected===soldier.id} aria-label={u?`${u.name} ${u.tier}단계`:`빈 칸 ${i+1}`} title={sel?(soldier?.id===sel.id?'다시 눌러 선택 취소':soldier?`${sel.name} ↔ ${soldier.name} 자리 교환`:'선택한 유닛을 이 칸으로 이동'):u?`${u.name} 선택 · 다른 유닛을 누르면 자리 교환`:'유닛을 먼저 선택하세요'}>{u?<><Portrait u={u} size="tiny"/><span>{u.name}</span></>:<span className="slot-plus">+</span>}</button>})}</div>{enemies.map(e=>{const p=pathAt(e.progress),art=enemyPortraits[e.name];return <div key={e.id} className={`invader ${e.boss?'boss':''} ${phase==='lost'||phase==='won'?'':'is-moving'}`} style={{left:`${p.x}%`,top:`${p.y}%`}} title={`${e.name} · ${Math.ceil(e.hp)} HP`}><span className="invader-hp"><i style={{width:`${Math.max(0,e.hp/e.maxHp*100)}%`}}/></span><span className="enemy-sprite-viewport" style={{'--step-delay':`-${(e.id%5)*.09}s`} as React.CSSProperties}><LoadingImage src={art.src} alt="" style={{width:'400%',height:'200%',left:`-${art.col*100}%`,top:`-${art.row*100}%`,maxWidth:'none'}}/></span>{e.boss&&<span className="boss-name">{e.name}</span>}</div>})}{sel&&selDef&&<AttackRange soldier={sel} unit={selDef}/>}<AttackOverlay effects={attackFx}/>{bossEnemy&&<div className="boss-banner"><b>♛ {bossEnemy.name}</b><strong className="boss-countdown">제한시간 {Math.ceil(bossEnemy.bossSeconds??BOSS_SECONDS)}초{enemies.filter(e=>e.boss).length>1?` · 보스 ${enemies.filter(e=>e.boss).length}명`:''}</strong><span>{Math.ceil(bossEnemy.hp).toLocaleString()} / {bossEnemy.maxHp.toLocaleString()}</span><i><span style={{width:`${Math.max(0,bossEnemy.hp/bossEnemy.maxHp*100)}%`}}/></i></div>}{bossDialogue&&phase!=='won'&&<div key={bossDialogue.id} className="battle-intro-text" role="status" aria-live="polite"><strong>{bossDialogue.title}</strong><p><span>{bossDialogue.speaker}</span><br/>“{bossDialogue.text}”</p>{bossDialogue.extra?.map((line,i)=><p key={i}><span>{line.speaker}</span><br/>“{line.text}”</p>)}</div>}{battleIntro&&intro&&!bossDialogue&&<div className="battle-intro-text" role="status" aria-live="polite"><strong>{intro.title}</strong>{intro.lines.map(line=><b key={line}>{line}</b>)}<p><span>{intro.speaker}</span> “{intro.text}”</p></div>}<button className="board-bag" onClick={()=>{setSelected(null);setBagOpen(true);}} aria-label="유닛 가방 열기"><Backpack size={21}/><span>{Object.values(bag).reduce((a,b)=>a+b,0)}</span></button><div className="board-count">배치 {roster.length} / {DEPLOY_LIMIT}</div></div>{skillFlash&&!legendary.active&&<HeroSkillFlash key={skillFlash.serial} flash={skillFlash}/>} {legendary.active&&legendary.active.mode!=='codex'&&<LegendaryReveal key={legendary.active.serial} scene={legendary.active.scene} preview={legendary.active.preview} onClose={legendary.close}/>}</div></div><div className="arena-foot" inert={stageCleared||!!legendary.active}><div className="arena-message">✧ {sel?`${sel.name} 선택 · 다른 유닛: 자리 교환 / 빈 칸: 이동 / 다시 클릭: 취소`:skipReady?'적군 전멸! 남은 시간을 스킵할 수 있습니다.':notice}</div><div className="wave-action"><span>{phase==='battle'?`${timeLeft>0?'진행':'연장전'} ${spawned}/${maxSpawn} · 남은 적 ${enemies.length}`:`라운드 ${round} / ${totalRounds}`}</span>{phase==='ready'?<button onClick={start}>전투 시작 <ChevronRight size={17}/></button>:phase==='battle'?<button className="wave-skip" onClick={skip} disabled={!skipReady} title={skipReady?'남은 시간을 건너뛰고 바로 진행합니다.':'이번 라운드의 적이 모두 출현하고 전멸하면 활성화됩니다.'}><SkipForward size={16}/>{finalRound?'스킵 · 결과 보기':stageEnd?'스킵 · 결과 보기':'스킵 · 다음 라운드'}</button>:phase==='cleared'?<button onClick={advance}>{stageEnd?'다음 스테이지':'다음 라운드'} <ChevronRight size={17}/></button>:<button onClick={reset}><RotateCcw size={16}/> 다시 시작</button>}</div></div></section>
  <aside className="detail-side" inert={stageCleared||!!legendary.active}><div className="panel-kicker">UNIT INTELLIGENCE</div><h3>전장 정보</h3>{selDef?<><div className="selected-top"><Portrait u={selDef} size="large"/><div><span>{'★'.repeat(selDef.tier)} · {selDef.role}</span><h2>{selDef.name}</h2></div></div><p className="selected-skill">{selDef.skill}<br/><strong>{roleDescription(selDef)}</strong>{selDef.tier===5&&<span className="hero-extra-skill">{heroSkillDescription(selDef.name)}</span>}</p><div className="selected-stats"><span>공격력 <b>{Number(upgradedAttack(selDef,upgrades).toFixed(1))}</b></span><span>사거리 <b>{selDef.range}</b></span><span>공격 속도 <b>{sel?attackRate(sel,roster).toFixed(2):selDef.rate}</b></span></div><button className="side-sell" onClick={sell} disabled={salePrice(selDef)===null}><ShoppingBag size={16}/> {salePrice(selDef)===null?'최상위 유닛 · 판매 불가':`판매 · +${salePrice(selDef)} 골드`}</button></>:<div className="detail-placeholder"><span>✦</span>유닛을 클릭하면 초상화와<br/>스탯·스킬이 표시됩니다.</div>}<div className="side-help"><BookOpen size={18}/><div><b>조합 가능한 영웅 {available.length}명</b><span>책을 열어 영웅의 계보를 확인하세요.</span></div></div><button className="side-book" onClick={()=>{setTier(2);setOverlay('book')}}><BookOpen size={19}/> 조합서 열기 <ChevronRight size={16}/></button></aside></main>
  <footer className="game-actions" inert={stageCleared||!!legendary.active}><div className="action-gold"><Coins size={25}/><b>{gold}</b><small>GOLD</small></div><button className="action-summon" onClick={summon} disabled={gold<SUMMON_COST||phase==='lost'||phase==='won'}><Sparkles size={23}/><span><b>병사 모집</b><small>랜덤 1단계 · {SUMMON_COST} 골드</small></span></button><button className="action-book" onClick={()=>{setTier(2);setOverlay('book')}}><BookOpen size={24}/><span><b>조합서</b><small>{available.length}개 조합 가능</small></span></button><button className="action-upgrade" onClick={()=>{setSelected(null);setOverlay(null);setUpgradeOpen(true);}} disabled={phase==='lost'||phase==='won'}><Sparkles size={22}/><span><b>강화</b><small>공격력 증가</small></span></button><button className="action-help" onClick={()=>setOverlay('help')}><Info size={19}/><span>게임 방법</span></button></footer>
  </>}
  {overlay==='book'&&<div className="overlay-shade" onMouseDown={e=>{if(e.target===e.currentTarget)setOverlay(null)}}><section className="book-modal" role="dialog" aria-modal="true" aria-label="조합서"><header><div><BookOpen size={24}/><span><small>THE HERO ARCHIVE</small><b>영웅 조합서</b></span></div><button onClick={()=>setOverlay(null)} aria-label="조합서 닫기"><X size={21}/></button></header>{!home&&difficulty==='hard'&&<p role="status">하드 조합 금지: {bannedHeroes.join(' · ')}{chapter===1?' · 을지문덕 조합 가능':''}</p>}<div className="book-tabs">{[2,3,4,5].map(n=><button key={n} className={tier===n?'active':''} onClick={()=>setTier(n)}>{n}단계 <span>{home?'8명':`${recipes.filter(u=>u.tier===n&&available.includes(u)).length}/8`}</span></button>)}</div><div className="book-grid">{recipes.filter(u=>u.tier===tier).map(u=>{const have=inventoryRecipeStatus(u.recipe!,home?[]:roster,home?{}:bag),ready=!home&&!bannedHeroes.includes(u.name)&&have.every(Boolean);return <article key={u.name} className={`book-card ${ready?'ready':''}`}><div className="book-card-art" aria-hidden="true"><Portrait u={u} size="normal"/></div><div className="book-card-head"><div><small>{'★'.repeat(tier)} · {u.role}</small><h3>{u.name}</h3><span className="book-role-effect">{roleDescription(u)}</span></div>{u.tier===5&&<button className="book-preview" onClick={()=>previewLegendary(u.name)} aria-label={`${u.name} 등장 연출 미리보기`} title="등장 연출 미리보기"><Play size={13}/></button>}</div><div className="book-ingredients">{u.recipe!.map((name,i)=><span key={i} className={have[i]?'have':''}>{have[i]?'✓':'·'} {name}</span>)}</div><button disabled={home||!ready||phase==='lost'||phase==='won'} onClick={()=>merge(u)}>{home?'전투에서 조합 가능':bannedHeroes.includes(u.name)?'하드 · 조합 금지':ready?'조합하기':`재료 ${have.filter(Boolean).length}/${have.length}`}</button></article>})}</div></section></div>}
  {overlay==='help'&&<div className="overlay-shade" onMouseDown={e=>{if(e.target===e.currentTarget)setOverlay(null)}}><section className="help-modal" role="dialog" aria-modal="true" aria-label="게임 방법"><button className="help-close" onClick={()=>setOverlay(null)} aria-label="닫기"><X size={21}/></button><small>HOW TO PLAY</small><h2>한국사 조합 디펜스</h2><div><b>01 · 병사 모집</b><p>{SUMMON_COST}골드로 7종 병종 중 하나를 모집합니다. 새 게임은 {START_GOLD}골드로 시작합니다.</p><b>02 · 조합</b><p>책 모양 조합서를 열고 재료가 모인 영웅을 조합합니다. 유닛 선택 후 다른 유닛을 누르면 서로 자리를 바꾸고, 빈 칸을 누르면 이동합니다. 같은 유닛을 다시 누르면 선택이 취소됩니다.</p><b>03 · 방어</b><p>각 라운드는 30초입니다. 적이 모두 출현하고 전멸하면 남은 시간을 스킵해 바로 다음 라운드로 갈 수 있습니다. 30초가 지나고 적이 모두 처치되면 다음 라운드가 자동 시작됩니다. 적이 남아 있으면 처치될 때까지 전투가 계속됩니다.</p><b>음악 출처</b><p>Music provided by 작곡하는김의홍 · Track: 決着 (Haru Studios)<br/><a href="https://www.youtube.com/watch?v=T5Xxo7dfN1I" target="_blank" rel="noreferrer">원곡 듣기</a> · <a href="https://haru-studios.itch.io/ketchaku" target="_blank" rel="noreferrer">공식 음원 페이지</a></p></div><button className="help-done" onClick={()=>setOverlay(null)}>{home?'초기 화면으로 돌아가기':'전장으로 돌아가기'}</button></section></div>}
  {!home&&stageCleared&&<StageClearPopup chapter={chapter} stage={stage} rounds={totalRounds} onMap={openStageSelection} onHome={openStorySelection}/>}
  {!home&&(phase==='won'||phase==='lost')&&<div className={`overlay-shade result-shade ${phase==='won'?'victory-layout':''}`}>{phase==='won'&&bossDialogue&&<aside className="victory-dialogue" role="status" aria-live="polite"><strong>{bossDialogue.speaker}</strong><p>“{bossDialogue.text}”</p></aside>}<section className={`result-modal ${phase}`} role="dialog" aria-modal="true" aria-label={phase==='lost'?'패배 결과':'클리어 결과'}><div className="result-emblem">{phase==='lost'?'✖':'✦'}</div><small>{phase==='lost'?'DEFENSE FAILED':chapter===2?'ANSI VICTORY':'SALSU VICTORY'}</small><h2>{phase==='lost'?'패배했습니다':chapter===2?'안시성 방어 성공!':'살수대첩 대승리!'}</h2><p>{phase==='lost'?(expiredBoss(enemies)?`${expiredBoss(enemies)!.name}을(를) 90초 안에 처치하지 못했습니다.`:'전장에 적군이 100명 누적되었습니다. 병사를 조합하고 강화하여 다시 도전하세요.'):chapter===2?ansiVictory:'고구려가 수나라의 침략으로부터 동아시아의 평화를 지켜냈습니다!'}</p><button onClick={reset}>{phase==='won'?'처음부터 다시 플레이':'다시 도전'} <ChevronRight size={17}/></button><button className="result-home" onClick={openStageSelection}>스테이지 선택</button><button className="result-home" onClick={openStorySelection}>이야기 선택</button></section></div>}
  {!home&&selDef&&<div className="mobile-unit-info"><button className="mobile-unit-close" onClick={()=>setSelected(null)} aria-label="유닛 정보 닫기"><X size={15}/></button><div className="mobile-unit-head"><Portrait u={selDef} size="normal"/><div><b>{selDef.name}</b><span>{'★'.repeat(selDef.tier)} · {selDef.role}</span></div></div><p>{selDef.skill}<br/><strong>{roleDescription(selDef)}</strong>{selDef.tier===5&&<span className="hero-extra-skill">{heroSkillDescription(selDef.name)}</span>}</p><div className="mobile-unit-bottom"><span>공격 {Number(upgradedAttack(selDef,upgrades).toFixed(1))} · 사거리 {selDef.range} · 속도 {sel?attackRate(sel,roster).toFixed(2):selDef.rate}</span><button onClick={sell} disabled={salePrice(selDef)===null}>{salePrice(selDef)===null?'최상위 · 판매 불가':`판매 +${salePrice(selDef)}G`}</button></div></div>}
  {!home&&mergeSuccess&&<div key={mergeSuccess.id} className="merge-success" role="status" aria-live="polite" aria-atomic="true"><Portrait u={mergeSuccess.unit} size="normal"/><div><strong>✓ 조합 성공!</strong><span>{mergeSuccess.unit.tier}단계 · {mergeSuccess.unit.name}</span></div><button onClick={()=>setMergeSuccess(null)} aria-label="조합 완료 알림 닫기"><X size={18}/></button></div>}
  {confirmNew&&<NewGameConfirm onConfirm={()=>prepareStage(pendingStage,pendingDifficulty)} onCancel={()=>setConfirmNew(false)}/>}
  {legendary.active?.mode==='codex'&&<HeroCodex scene={legendary.active.scene} onSelect={openCodex} onClose={legendary.close}/>}
 </div>;
}
