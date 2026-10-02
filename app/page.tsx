"use client";
import LoadingImage, {
  LoadingBackground,
  useImageStatus,
  ImageLoadingIndicator,
  preloadImages,
} from "./LoadingImage";

import { useEffect, useRef, useState } from "react";
import {
  Backpack,
  BookOpen,
  Clock3,
  Coins,
  ClipboardList,
  Dices,
  FlaskConical,
  Heart,
  Home,
  Images,
  Lock,
  RotateCcw,
  ShoppingBag,
  SkipForward,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  basics,
  byName,
  createRoundInvader,
  enemyArtSheetSrc,
  enemyPortraitFor,
  enemyPortraits,
  pathAt,
  recipes,
  waveNames,
  type Enemy,
  type Soldier,
  type UnitDef,
} from "@/lib/game";

import LegendaryReveal from "./LegendaryReveal";
import HeroCodex from "./HeroCodex";
import {atlasCellViewBox} from "@/lib/portrait-crop";
import UnitBag from "./UnitBag";
import ProfileSettings, { ProfileAvatar } from "./ProfileSettings";
import {
  DEPLOY_LIMIT,
  inventoryRecipeStatus,
  combineInventory,
  storeUnits,
  deployUnits,
  sellStored,
  migrateDeployment,
  type Bag,
} from "@/lib/inventory";
import BattleSettings from "./BattleSettings";
import { tickBossTimers, expiredBoss, BOSS_SECONDS } from "@/lib/boss-timer";
import { frontIntro } from "@/lib/front-intro";
import {
  bossLine,
  defeatedDialogueBoss,
  type BossLine,
} from "@/lib/battle-dialogue";
import Prologue from "./Prologue";
import StoryArrival from "./StoryArrival";
import BattlePrelude from "./BattlePrelude";
import { isImjinPreludeStage } from "@/lib/imjin-prelude";
import StoryEpilogue from "./StoryEpilogue";
import {
  EPILOGUE_RETURN_IMAGE,
  STORY_EPILOGUE_IMAGES,
} from "@/lib/story-epilogue";
import { storySeenKey, hasSeenStory } from "@/lib/story-seen";
import StoryBooks from "./StoryBooks";
import {
  STORY_KEY,
  storyRoster,
  storyGold,
  type StoryProgress,
} from "@/lib/story";
import {
  PLAYER_KEY,
  readPlayer,
  awardHardClear,
  awardStageProfile,
  HARD_CLEAR_REWARDS,
  hardClearRewardForId,
  unlockedProfileIds,
  type PlayerProfile,
  type ProfileReward,
} from "@/lib/player";
import {drawHeroRecord} from "@/lib/hero-records";
import UpgradeDialog from "./UpgradeDialog";
import GamblingDialog from "./GamblingDialog";
import QuestDialog from "./QuestDialog";
import ResearchLab from "./ResearchLab";
import {
  canGamble,
  emptyGambleState,
  emptyUnitGambleUsage,
  gambleUnlocked,
  goldGambles,
  playGoldGamble,
  playUnitGamble,
  readGambleState,
  readUnitGambleUsage,
  recordGoldGamble,
  recordUnitGamble,
  recordUnitGambleSuccess,
  unitGambles,
  unitGamblesRemaining,
} from "@/lib/gambling";
import {
  battleQuests,
  claimQuest,
  emptyQuestProgress,
  readQuestProgress,
  recordBasicUnitsPeak,
  recordCombinedTier,
  recordGoldQuest,
  recordUnitQuest,
} from "@/lib/quests";
import {
  accountFromProfile,
  addAccountReward,
  buyResearch,
  clearAccountReward,
  completionReward,
  researchAttackPercent,
  researchBossCitizens,
  researchBossGold,
  researchBossTroops,
  researchDeployLimit,
  researchGamblePityBonus,
  researchGambleRefundPercent,
  researchQuestCitizens,
  researchQuestGold,
  researchQuestTroops,
  researchRecruitDiversity,
  researchSpeedPercent,
  researchStartCitizens,
  researchStartGold,
  researchStartTroops,
  xpForNextLevel,
} from "@/lib/research";
import {
  emptyUpgrades,
  readUpgrades,
  purchaseUpgrade,
  upgradedAttack,
  type UpgradeKind,
} from "@/lib/upgrades";
import { getMusicMood } from "@/lib/music";
import {
  BOSS_TROOP_CARDS,
  RECRUIT_TROOP_COST,
  ROUND_TROOP_CARDS,
  START_TROOP_CARDS,
  bossCitizenRewardCount,
  bossUnitRewardTier,
  randomName,
} from "@/lib/troop-cards";
import { useLegendaryReveal } from "./useLegendaryReveal";
import { legendaryScenes, resumeStageDeadline } from "@/lib/legendary";
import {
  canSkipStage,
  canAutoAdvanceRound,
  canCompleteStage,
  isOverrun,
} from "@/lib/stage-flow";
import TitleScreen, { NewGameConfirm } from "./TitleScreen";
import { moveOrSwap } from "@/lib/placement";
import StageClearPopup from "./StageClearPopup";
import StageMap from "./StageMap";
import { chapterUnlocked, progressKey, type ChapterId } from "@/lib/ansi";
import {
  drawBannedHeroes,
  resolveBannedHeroes,
  HARD_PROGRESS_KEY,
} from "@/lib/hard-mode";
import type { Difficulty } from "@/lib/enemy-stats";
import BattleTerrain from "./BattleTerrain";
import {
  combatStep,
  advanceEnemy,
  roleDescription,
  attackRate,
} from "@/lib/combat";
import { heroSkillStep, heroSkillDescription } from "@/lib/hero-skills";
import { activeHeroBuffs } from "@/lib/hero-buffs";
import HeroSkillFlash, { type SkillFlash } from "./HeroSkillFlash";
import AttackRange from "./AttackRange";
import { salePrice } from "@/lib/selling";
import {
  stageRoundCount,
  roundBossName,
  roundEnemyCount,
  roundKey,
  ROUND_CLEAR_GOLD,
  isStageComplete,
  isCampaignComplete,
  nextRound,
} from "@/lib/rounds";
import {
  frontForStage,
  CAMPAIGN_STORAGE_KEY,
  FINAL_WAVE,
  isWaveUnlocked,
  readCampaignProgress,
  recordWaveClear,
} from "@/lib/campaign";
import {
  SAVE_KEY,
  canContinue,
  makeGameSave,
  readGameSave,
  remainingStageMs,
  restoredCounters,
  type GameSave,
} from "@/lib/save";
import { useSocialAuth } from "./AuthProvider";
import {getSupabaseClient} from '@/lib/supabase';
import {createCloudSaveQueue,hydrateCloudSave} from '@/lib/cloud-save';
import {
  accountScopeFor,
  readAccountItem,
  writeAccountItem,
  removeAccountItem,
} from "@/lib/account-storage";
import {
  ADMIN_CHAPTERS,
  ADMIN_PROGRESS_KEYS,
  adminPlayerProfile,
  adminProgressValue,
  isAdminAccount,
} from "@/lib/admin";
import { COMBINATION_TIERS, hasHeroSkillTier } from "@/lib/unit-tiers";
import { isLockedUnit } from "@/lib/planned-units";
import {
  getStoryCampaign,
  getStoryStage,
  reinforcementDamage,
  reinforcementFor,
  type ReinforcementProgress,
} from "@/lib/story-campaigns";

type Phase = "ready" | "battle" | "cleared" | "lost" | "won";
type Overlay = "book" | "help" | null;
const recipeCatalog: UnitDef[] = recipes;
type AttackEffect = {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
};
const MAX_UNITS = 40,
  START_GOLD = 400,
  STAGE_SECONDS = 30;
const isStoryVictory = (phase: Phase) => phase === "won";
function Portrait({
  u,
  size = "normal",
}: {
  u: UnitDef;
  size?: "tiny" | "normal" | "large";
}) {
  const atlas = u.atlas,
    src = atlas?.src ?? u.portrait ?? "",
    status = useImageStatus(src);
  return (
    <span
      className={`unit-portrait ${size} ${status === "ready" ? "is-loaded" : status === "error" ? "is-error" : ""}`}
      style={{ "--unit-color": u.color } as React.CSSProperties}
    >
      {atlas ? (
        <svg
          className="atlas-viewport"
          viewBox="0 0 384 512"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        >
          <svg
            width="384"
            height="512"
            viewBox={atlasCellViewBox(atlas.col, atlas.row, u.name)}
            preserveAspectRatio="none"
            overflow="hidden"
          >
            <image href={src} width="1536" height="1024" />
          </svg>
        </svg>
      ) : (
        <img
          src={src}
          alt=""
          style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        />
      )}
      <ImageLoadingIndicator status={status} />
    </span>
  );
}
function Hearts({ remaining }: { remaining: number }) {
  return (
    <div
      className="heart-row"
      role="img"
      aria-label={`남은 하트 ${remaining}개`}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <Heart
          key={i}
          size={15}
          fill={i < remaining ? "#e86557" : "transparent"}
          color={i < remaining ? "#f7aa78" : "#78846a"}
          strokeWidth={2}
        />
      ))}
    </div>
  );
}
function AttackOverlay({ effects }: { effects: AttackEffect[] }) {
  return (
    <svg
      className="battle-effects"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {effects.map((fx) => (
        <g
          key={fx.id}
          style={{ "--fx-color": fx.color } as React.CSSProperties}
        >
          <line
            className="attack-glow"
            x1={fx.fromX}
            y1={fx.fromY}
            x2={fx.toX}
            y2={fx.toY}
          />
          <line
            className="attack-streak"
            x1={fx.fromX}
            y1={fx.fromY}
            x2={fx.toX}
            y2={fx.toY}
            pathLength="100"
          />
          <circle
            className="attack-origin"
            cx={fx.fromX}
            cy={fx.fromY}
            r=".8"
          />
          <circle className="attack-impact" cx={fx.toX} cy={fx.toY} r="1.2" />
        </g>
      ))}
    </svg>
  );
}

export default function Game() {
  const auth = useSocialAuth();
  const storageScope = accountScopeFor(auth.status, auth.user?.id);
  const [hydratedScope,setHydratedScope]=useState<string|null>(null);
  const [cloudStorageError,setCloudStorageError]=useState(false);
  const cloudQueue=useRef<ReturnType<typeof createCloudSaveQueue>|null>(null);
  useEffect(()=>{
    let active=true;
    const oldQueue=cloudQueue.current;
    cloudQueue.current=null;
    if(oldQueue)oldQueue.close();
    setHydratedScope(null);
    setCloudStorageError(false);
    if(!storageScope)return()=>{active=false;};
    if(auth.status!=='authenticated'||!auth.user){setHydratedScope(storageScope);return()=>{active=false;};}
    const client=getSupabaseClient();
    if(!client){setCloudStorageError(true);setHydratedScope(storageScope);return()=>{active=false;};}
    void hydrateCloudSave(client,auth.user.id,localStorage).then(()=>{
      if(!active)return;
      cloudQueue.current=createCloudSaveQueue(client,auth.user!.id,()=>setCloudStorageError(true));
      setHydratedScope(storageScope);
    }).catch(()=>{if(active){setCloudStorageError(true);setHydratedScope(storageScope);}});
    return()=>{active=false;cloudQueue.current?.close();cloudQueue.current=null;};
  },[storageScope,auth.status,auth.user?.id]);
  useEffect(()=>{
    const flush=()=>{if(document.visibilityState==='hidden')void cloudQueue.current?.flush();};
    const pageHide=()=>{void cloudQueue.current?.flush();};
    document.addEventListener('visibilitychange',flush);
    window.addEventListener('pagehide',pageHide);
    return()=>{document.removeEventListener('visibilitychange',flush);window.removeEventListener('pagehide',pageHide);};
  },[]);
  const isAdmin = isAdminAccount(
    auth.user?.email,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  );
  const readStored = (key: string) =>
    storageScope ? readAccountItem(localStorage, storageScope, key) : null;
  const writeStored = (key: string, value: string) => {
    if (storageScope){writeAccountItem(localStorage, storageScope, key, value);cloudQueue.current?.write(key,value);}
  };
  const removeStored = (key: string) => {
    if (storageScope){removeAccountItem(localStorage, storageScope, key);cloudQueue.current?.remove(key);}
  };
  const [chapter, setChapter] = useState<ChapterId>(1);
  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        preloadImages([
          EPILOGUE_RETURN_IMAGE,
          ...STORY_EPILOGUE_IMAGES,
          enemyArtSheetSrc(chapter),
          ...Object.values(byName)
            .filter((unit) => unit.tier >= 2)
            .map((unit) => unit.atlas?.src ?? unit.portrait ?? "")
            .filter(Boolean),
        ]),
      500,
    );
    return () => window.clearTimeout(timer);
  }, [chapter]);
  const [salsuCleared, setSalsuCleared] = useState(0),
    [ansiCleared, setAnsiCleared] = useState(0),
    [hwangsanCleared, setHwangsanCleared] = useState(0),
    [nadangCleared, setNadangCleared] = useState(0),
    [gwijuCleared, setGwijuCleared] = useState(0),
    [cheoinCleared, setCheoinCleared] = useState(0),
    [hansandoCleared, setHansandoCleared] = useState(0),
    [haengjuCleared, setHaengjuCleared] = useState(0),
    [myeongnyangCleared, setMyeongnyangCleared] = useState(0);
  const canEnterChapter = (id: ChapterId) =>
    chapterUnlocked(
      id,
      salsuCleared,
      ansiCleared,
      hwangsanCleared,
      nadangCleared,
      gwijuCleared,
      cheoinCleared,
      hansandoCleared,
      haengjuCleared,
      myeongnyangCleared,
    );
  const [difficulty, setDifficulty] = useState<Difficulty>("normal"),
    [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>("normal"),
    [bannedHeroes, setBannedHeroes] = useState<string[]>([]),
    [hardCleared, setHardCleared] = useState(0);
  const hardClearedRef = useRef(0);
  const [booksOpen, setBooksOpen] = useState(false);
  const seenStories = useRef(new Set<ChapterId>());
  const storyWasSeen = (id: ChapterId) => {
    if (seenStories.current.has(id)) return true;
    try {
      return hasSeenStory(readStored(storySeenKey(id)));
    } catch {
      return false;
    }
  };
  const markStorySeen = (id: ChapterId) => {
    seenStories.current.add(id);
    try {
      writeStored(storySeenKey(id), "complete");
    } catch {
      setStorageError(true);
    }
  };
  const [storyOpen, setStoryOpen] = useState(false),
    [storyBattle, setStoryBattle] = useState<StoryProgress | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null),
    [playerReady, setPlayerReady] = useState(false),
    [playerStorageError, setPlayerStorageError] = useState(false),
    [replayPrologue, setReplayPrologue] = useState(false),
    [profileReward, setProfileReward] = useState<ProfileReward | null>(null);
  useEffect(() => {
    setPlayerReady(false);
    setPlayer(null);
    setPlayerStorageError(false);
    if (!storageScope||hydratedScope!==storageScope) return;
    try {
      const restored = readPlayer(
          readAccountItem(localStorage, storageScope, PLAYER_KEY),
        ),
        next = isAdmin ? adminPlayerProfile(restored) : restored;
      setPlayer(next);
      if (isAdmin && next)
        writeStored(PLAYER_KEY,JSON.stringify(next));
    } catch {
      setPlayerStorageError(true);
    }
    setPlayerReady(true);
  }, [storageScope, hydratedScope, isAdmin]);
  const savePlayer = (next: PlayerProfile) => {
    const profile = isAdmin ? adminPlayerProfile(next) : next;
    setPlayer(profile);
    try {
      writeStored(PLAYER_KEY, JSON.stringify(profile));
      setPlayerStorageError(false);
    } catch {
      setPlayerStorageError(true);
    }
  };
  const upgradeResearch = (id: string) => {
    if (!player) return;
    const next = buyResearch(accountFromProfile(player), id);
    if (!next) return;
    savePlayer({ ...player, ...next });
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [bag, setBag] = useState<Bag>({}),
    [bagOpen, setBagOpen] = useState(false);
  const [autoStoreBasic, setAutoStoreBasic] = useState(false);
  const toggleAutoStoreBasic = (enabled: boolean) => {
    setAutoStoreBasic(enabled);
    if (enabled) changeBag("store", 1);
  };
  const [upgrades, setUpgrades] = useState(emptyUpgrades),
    [upgradeOpen, setUpgradeOpen] = useState(false),
    [gambleOpen, setGambleOpen] = useState(false),
    [questOpen, setQuestOpen] = useState(false),
    [questProgress, setQuestProgress] = useState(emptyQuestProgress),
    [gambleState, setGambleState] = useState(() => emptyGambleState(1)),
    [unitGambleUsage, setUnitGambleUsage] = useState(() =>
      emptyUnitGambleUsage(1),
    );
  const [home, setHome] = useState(true),
    [saved, setSaved] = useState<GameSave | null>(null),
    [saveReady, setSaveReady] = useState(false),
    [storageError, setStorageError] = useState(false),
    [confirmNew, setConfirmNew] = useState(false);
  const [mapOpen, setMapOpen] = useState(false),
    [mapModalOpen, setMapModalOpen] = useState(false),
    [pendingStage, setPendingStage] = useState(1),
    [battlePrelude, setBattlePrelude] = useState<{
      stage: number;
      difficulty: Difficulty;
    } | null>(null),
    [highestClearedWave, setHighestClearedWave] = useState(0);
  useEffect(() => {
    if (!player || !saveReady) return;
    const next = awardHardClear(player, chapter, hardCleared);
    if (next !== player) savePlayer(next);
  }, [player, hardCleared, saveReady, chapter]);
  useEffect(() => {
    if (!player || !saveReady || !storageScope) return;
    let next = player;
    try {
      for (let id = 1; id <= 10; id++) {
        const chapterId = id as ChapterId,
          cleared = readCampaignProgress(readStored(progressKey(chapterId)));
        for (let clearedStage = 1; clearedStage <= cleared; clearedStage++)
          next = awardStageProfile(next, chapterId, clearedStage).profile;
      }
    } catch {
      setPlayerStorageError(true);
      return;
    }
    if (next !== player) savePlayer(next);
  }, [player, saveReady, storageScope]);
  const clearedWaveRef = useRef(0),
    homeRef = useRef(true);
  const markWaveCleared = (wave: number) => {
    const previous =
        difficulty === "hard" ? hardClearedRef.current : clearedWaveRef.current,
      firstClear = wave > previous,
      baseReward = clearAccountReward(
        wave,
        chapter,
        difficulty,
        player?.research,
      ),
      accountReward = completionReward(baseReward, firstClear);
    let nextPlayer = player;
    if (nextPlayer) {
      const account = addAccountReward(
        accountFromProfile(nextPlayer),
        accountReward,
      );
      nextPlayer = { ...nextPlayer, ...account, recordTickets:(nextPlayer.recordTickets??0)+(difficulty==="hard"&&firstClear?2:1) };
    }
    if (difficulty === "hard") {
      const next = recordWaveClear(hardClearedRef.current, wave);
      hardClearedRef.current = next;
      setHardCleared(next);
      try {
        writeStored(
          progressKey(chapter, true),
          JSON.stringify({ version: 1, highestClearedWave: next }),
        );
      } catch {
        setStorageError(true);
      }
      if (nextPlayer) savePlayer(nextPlayer);
      return accountReward;
    }
    const next = recordWaveClear(clearedWaveRef.current, wave);
    if (next !== clearedWaveRef.current) {
      clearedWaveRef.current = next;
      setHighestClearedWave(next);
      if (chapter === 1) setSalsuCleared(next);
      if (chapter === 2) setAnsiCleared(next);
      if (chapter === 3) setHwangsanCleared(next);
      if (chapter === 4) setNadangCleared(next);
      if (chapter === 5) setGwijuCleared(next);
      if (chapter === 6) setCheoinCleared(next);
      if (chapter === 7) setHansandoCleared(next);
      if (chapter === 8) setHaengjuCleared(next);
      if (chapter === 9) setMyeongnyangCleared(next);
    }
    if (nextPlayer) {
      const awarded = awardStageProfile(nextPlayer, chapter, wave);
      if (awarded.reward) {
        nextPlayer = awarded.profile;
        setProfileReward(awarded.reward);
      }
      savePlayer(nextPlayer);
    }
    try {
      writeStored(
        progressKey(chapter),
        JSON.stringify({ version: 1, highestClearedWave: next }),
      );
    } catch {
      setStorageError(true);
    }
    return accountReward;
  };
  const [roster, setRoster] = useState<Soldier[]>([]),
    [gold, setGold] = useState(START_GOLD),
    [troopCards, setTroopCards] = useState(START_TROOP_CARDS),
    [wall, setWall] = useState(10),
    [stage, setStage] = useState(1),
    [round, setRound] = useState(1),
    [phase, setPhase] = useState<Phase>("ready"),
    [timeLeft, setTimeLeft] = useState(STAGE_SECONDS),
    [enemies, setEnemies] = useState<Enemy[]>([]),
    [attackFx, setAttackFx] = useState<AttackEffect[]>([]),
    [selected, setSelected] = useState<number | null>(null),
    [overlay, setOverlay] = useState<Overlay>(null),
    [tier, setTier] = useState(2),
    [speed, setSpeed] = useState(1),
    [spawned, setSpawned] = useState(0),
    [notice, setNotice] = useState("병사를 모집하고 전투를 준비하세요.");
  const heroTimers = useRef(new Map<number, number>()),
    flashQueue = useRef<string[]>([]),
    flashSerial = useRef(0);
  const [skillFlash, setSkillFlash] = useState<SkillFlash | null>(null);
  const [bossDialogue, setBossDialogue] = useState<
    (BossLine & { id: number }) | null
  >(null);
  const [reinforcement, setReinforcement] =
      useState<ReinforcementProgress | null>(null),
    reinforcementRef = useRef<ReinforcementProgress | null>(null);
  useEffect(() => {
    if (!bossDialogue || phase === "won") return;
    const timer = window.setTimeout(() => setBossDialogue(null), 8000);
    return () => window.clearTimeout(timer);
  }, [bossDialogue, phase]);
  useEffect(() => {
    if (home || phase === "lost") setBossDialogue(null);
  }, [home, phase]);
  const [battleIntro, setBattleIntro] = useState(false);
  const [hardBanIntro, setHardBanIntro] = useState<string[] | null>(null);
  useEffect(() => {
    if (!battleIntro) return;
    const timer = window.setTimeout(() => setBattleIntro(false), 8000);
    return () => window.clearTimeout(timer);
  }, [battleIntro]);
  useEffect(() => {
    if (home || phase === "lost" || phase === "won") setBattleIntro(false);
  }, [home, phase]);
  useEffect(() => {
    if (!hardBanIntro) return;
    const timer = window.setTimeout(() => setHardBanIntro(null), 8000);
    return () => window.clearTimeout(timer);
  }, [hardBanIntro]);
  useEffect(() => {
    if (home || phase === "lost" || phase === "won") setHardBanIntro(null);
  }, [home, phase]);
  const [mergeSuccess, setMergeSuccess] = useState<{
    id: number;
    unit: UnitDef;
    stored: boolean;
  } | null>(null);
  useEffect(() => {
    if (!mergeSuccess) return;
    const timer = window.setTimeout(() => setMergeSuccess(null), 4000);
    return () => window.clearTimeout(timer);
  }, [mergeSuccess]);
  useEffect(() => {
    if (home) setMergeSuccess(null);
  }, [home]);
  const [unitReward, setUnitReward] = useState<{
    id: number;
    unit: UnitDef;
    source: string;
    stored: boolean;
    quantity?: number;
    bonus?: string;
  } | null>(null);
  useEffect(() => {
    if (!unitReward) return;
    const timer = window.setTimeout(() => setUnitReward(null), 5000);
    return () => window.clearTimeout(timer);
  }, [unitReward]);
  useEffect(() => {
    if (home) setUnitReward(null);
  }, [home]);
  const [gambleResult, setGambleResult] = useState<{
    id: number;
    outcome: "success" | "failure" | "draw";
    title: string;
    detail: string;
  } | null>(null);
  useEffect(() => {
    if (!gambleResult) return;
    const timer = window.setTimeout(() => setGambleResult(null), 5000);
    return () => window.clearTimeout(timer);
  }, [gambleResult]);
  useEffect(() => {
    if (home) setGambleResult(null);
  }, [home]);
  useEffect(() => {
    if (!skillFlash) return;
    const timer = window.setTimeout(
      () => setSkillFlash(null),
      Math.max(0, skillFlash.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [skillFlash]);
  const idRef = useRef(1),
    deadlineRef = useRef<number | null>(null),
    completedStageRef = useRef(0),
    rewardedBossesRef = useRef(new Set<number>()),
    stateRef = useRef({
      roster,
      enemies,
      stage,
      round,
      spawned,
      phase,
      speed,
      upgrades,
      difficulty,
      chapter,
    });
  stateRef.current = {
    roster,
    enemies,
    stage,
    round,
    spawned,
    phase,
    speed,
    upgrades,
    difficulty,
    chapter,
  };
  const legendary = useLegendaryReveal((pausedAt, now) => {
    if (!homeRef.current && stateRef.current.phase === "battle")
      deadlineRef.current = resumeStageDeadline(
        deadlineRef.current,
        pausedAt,
        now,
      );
  });
  const codexHeroRef = useRef(legendaryScenes[0].name);
  const [codexName,setCodexName] = useState(legendaryScenes[0].name);
  const [recordResult,setRecordResult] = useState('');
  const openCodex = (name = codexHeroRef.current) => {
    codexHeroRef.current = name;
    setCodexName(name);
    setOverlay(null);
    setAttackFx([]);
    if(legendary.active?.mode!=="codex")legendary.show(legendaryScenes[0].name, "codex");
  };
  const drawRecord = () => {
    if(!player||(player.recordTickets??0)<1)return;
    const available=[...unlockedProfileIds(player)];
    const result=drawHeroRecord(player.heroRecords??{},available);
    if(!result)return;
    if(result.allMaxed){setRecordResult('획득 가능한 영웅 기록을 모두 완성했습니다.');return;}
    savePlayer({...player,recordTickets:(player.recordTickets??0)-1,heroRecords:result.records});
    if(result.unit){setCodexName(result.unit.name);codexHeroRef.current=result.unit.name;setRecordResult(`${result.unit.name} 기록 +1${result.starGained?` · ★${result.records[result.unit.name].stars} 달성!`:''}`);}
  };
  const progressRef = useRef({
    roster,
    bag,
    enemies,
    gold,
    troopCards,
    wall,
    stage,
    round,
    phase,
    spawned,
    speed,
    upgrades,
    questProgress,
    gambleState,
    unitGambleUsage,
    difficulty,
    bannedHeroes,
    chapter,
    reinforcement: reinforcementRef.current ?? undefined,
  });
  progressRef.current = {
    roster,
    bag,
    enemies,
    gold,
    troopCards,
    wall,
    stage,
    round,
    phase,
    spawned,
    speed,
    upgrades,
    questProgress,
    gambleState,
    unitGambleUsage,
    difficulty,
    bannedHeroes,
    chapter,
    reinforcement: reinforcementRef.current ?? undefined,
  };
  useEffect(() => {
    const current = progressRef.current,
      next = recordBasicUnitsPeak(current.questProgress, current.roster, current.bag);
    if (next === current.questProgress) return;
    progressRef.current = { ...current, questProgress: next };
    setQuestProgress(next);
  }, [roster, bag]);
  const persistGame = () => {
    if (homeRef.current) return;
    const current = progressRef.current;
    const snapshot = makeGameSave({
      ...current,
      heroCooldowns: [...heroTimers.current].filter(([id]) =>
        current.roster.some(
          (s) => s.id === id && hasHeroSkillTier(byName[s.name].tier),
        ),
      ),
      remainingMs: remainingStageMs(
        deadlineRef.current,
        current.phase,
        Date.now(),
        legendary.pausedAtRef.current,
      ),
    });
    setSaved(snapshot);
    try {
      writeStored(SAVE_KEY, JSON.stringify(snapshot));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  const selectChapter = (next: ChapterId) => {
    setChapter(next);
    let normal = 0,
      hard = 0;
    try {
      normal = readCampaignProgress(readStored(progressKey(next)));
      hard = readCampaignProgress(readStored(progressKey(next, true)));
    } catch {
      setStorageError(true);
    }
    clearedWaveRef.current = normal;
    hardClearedRef.current = hard;
    setHighestClearedWave(normal);
    setHardCleared(hard);
  };
  const returnHome = () => {
    setBagOpen(false);
    setUpgradeOpen(false);
    persistGame();
    flashQueue.current = [];
    setSkillFlash(null);
    homeRef.current = true;
    legendary.close();
    deadlineRef.current = null;
    setHome(true);
    setMapOpen(false);
    setMapModalOpen(false);
    setOverlay(null);
    setSelected(null);
    setAttackFx([]);
  };
  const continueGame = () => {
    if (!canContinue(saved) || !saveReady) return;
    if (!canEnterChapter(saved.chapter ?? 1)) {
      setBooksOpen(true);
      return;
    }
    selectChapter(saved.chapter ?? 1);
    setDifficulty(saved.difficulty ?? "normal");
    setBannedHeroes(
      saved.difficulty === "hard"
        ? resolveBannedHeroes(saved.bannedHeroes, saved.chapter ?? 1)
        : [],
    );
    const counters = restoredCounters(saved);
    heroTimers.current = new Map(saved.heroCooldowns ?? []);
    flashQueue.current = [];
    setSkillFlash(null);
    idRef.current = counters.nextId;
    completedStageRef.current = counters.completedStage;
    deadlineRef.current = counters.deadline;
    rewardedBossesRef.current.clear();
    const restoredReinforcement = saved.reinforcement ?? null;
    reinforcementRef.current = restoredReinforcement;
    setReinforcement(restoredReinforcement);
    setUpgrades(readUpgrades(saved.upgrades));
    setQuestProgress(readQuestProgress(saved.questProgress));
    setGambleState(
      readGambleState(
        saved.gambleState,
        saved.round,
        saved.difficulty ?? "normal",
      ),
    );
    setUnitGambleUsage(readUnitGambleUsage(saved.unitGambleUsage, saved.round));
    setUpgradeOpen(false);
    setAutoStoreBasic(false);
    const inventory = migrateDeployment(saved.roster, saved.bag ?? {},DEPLOY_LIMIT+researchDeployLimit(accountFromProfile(player??{}).research));
    setRoster(inventory.roster);
    setBag(inventory.bag);
    setEnemies(saved.enemies);
    setGold(saved.gold);
    setTroopCards(saved.troopCards ?? START_TROOP_CARDS);
    setWall(saved.wall);
    setStage(saved.stage);
    setRound(saved.round);
    setPhase(saved.phase);
    setSpawned(saved.spawned);
    setSpeed(saved.speed);
    setTimeLeft(Math.ceil(saved.remainingMs / 1000));
    setAttackFx([]);
    setSelected(null);
    setOverlay(null);
    setNotice("저장된 방어전을 이어갑니다.");
    homeRef.current = false;
    setHome(false);
  };
  useEffect(() => {
    setSaveReady(false);
    setSaved(null);
    setStorageError(false);
    seenStories.current.clear();
    setSalsuCleared(0);
    setAnsiCleared(0);
    setHwangsanCleared(0);
    setNadangCleared(0);
    setGwijuCleared(0);
    setCheoinCleared(0);
    setHansandoCleared(0);
    setHaengjuCleared(0);
    setMyeongnyangCleared(0);
    clearedWaveRef.current = 0;
    hardClearedRef.current = 0;
    setHighestClearedWave(0);
    setHardCleared(0);
    reinforcementRef.current = null;
    setReinforcement(null);
    homeRef.current = true;
    setHome(true);
    setMapOpen(false);
    setMapModalOpen(false);
    setBooksOpen(false);
    setStoryOpen(false);
    setProfileOpen(false);
    if (!storageScope||hydratedScope!==storageScope) {
      if (auth.status === "signedOut") setSaveReady(true);
      return;
    }
    try {
      const stored = (key: string) =>
        readAccountItem(localStorage, storageScope, key);
      const store = (key: string, value: string) => writeStored(key,value);
      if (isAdmin) {
        const complete = adminProgressValue();
        for (const key of ADMIN_PROGRESS_KEYS) store(key, complete);
        for (const id of ADMIN_CHAPTERS) {
          seenStories.current.add(id);
          store(storySeenKey(id), "complete");
        }
      }
      const restored = readGameSave(stored(SAVE_KEY));
      setSaved(restored);
      const myeongnyangRecorded = readCampaignProgress(stored(progressKey(9)));
      const myeongnyangFromSave =
        restored?.chapter === 9 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setMyeongnyangCleared(Math.max(myeongnyangRecorded, myeongnyangFromSave));
      if (myeongnyangFromSave > myeongnyangRecorded)
        store(
          progressKey(9),
          JSON.stringify({
            version: 1,
            highestClearedWave: myeongnyangFromSave,
          }),
        );
      const haengjuRecorded = readCampaignProgress(stored(progressKey(8)));
      const haengjuFromSave =
        restored?.chapter === 8 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setHaengjuCleared(Math.max(haengjuRecorded, haengjuFromSave));
      if (haengjuFromSave > haengjuRecorded)
        store(
          progressKey(8),
          JSON.stringify({ version: 1, highestClearedWave: haengjuFromSave }),
        );
      const hansandoRecorded = readCampaignProgress(stored(progressKey(7)));
      const hansandoFromSave =
        restored?.chapter === 7 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setHansandoCleared(Math.max(hansandoRecorded, hansandoFromSave));
      if (hansandoFromSave > hansandoRecorded)
        store(
          progressKey(7),
          JSON.stringify({ version: 1, highestClearedWave: hansandoFromSave }),
        );
      const cheoinRecorded = readCampaignProgress(stored(progressKey(6)));
      const cheoinFromSave =
        restored?.chapter === 6 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setCheoinCleared(Math.max(cheoinRecorded, cheoinFromSave));
      if (cheoinFromSave > cheoinRecorded)
        store(
          progressKey(6),
          JSON.stringify({ version: 1, highestClearedWave: cheoinFromSave }),
        );
      const gwijuRecorded = readCampaignProgress(stored(progressKey(5)));
      const gwijuFromSave =
        restored?.chapter === 5 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setGwijuCleared(Math.max(gwijuRecorded, gwijuFromSave));
      if (gwijuFromSave > gwijuRecorded)
        store(
          progressKey(5),
          JSON.stringify({ version: 1, highestClearedWave: gwijuFromSave }),
        );
      const nadangRecorded = readCampaignProgress(stored(progressKey(4)));
      const nadangFromSave =
        restored?.chapter === 4 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setNadangCleared(Math.max(nadangRecorded, nadangFromSave));
      if (nadangFromSave > nadangRecorded)
        store(
          progressKey(4),
          JSON.stringify({ version: 1, highestClearedWave: nadangFromSave }),
        );
      const hwangsanRecorded = readCampaignProgress(stored(progressKey(3)));
      const hwangsanFromSave =
        restored?.chapter === 3 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setHwangsanCleared(Math.max(hwangsanRecorded, hwangsanFromSave));
      if (hwangsanFromSave > hwangsanRecorded)
        store(
          progressKey(3),
          JSON.stringify({ version: 1, highestClearedWave: hwangsanFromSave }),
        );
      const ansiRecorded = readCampaignProgress(stored(progressKey(2)));
      const ansiFromSave =
        restored?.chapter === 2 && restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      setAnsiCleared(Math.max(ansiRecorded, ansiFromSave));
      if (ansiFromSave > ansiRecorded)
        store(
          progressKey(2),
          JSON.stringify({ version: 1, highestClearedWave: ansiFromSave }),
        );
      const hardRecord = readCampaignProgress(stored(HARD_PROGRESS_KEY));
      hardClearedRef.current = hardRecord;
      setHardCleared(hardRecord);
      const recorded = readCampaignProgress(stored(CAMPAIGN_STORAGE_KEY));
      const fromSave =
        restored &&
        (restored.chapter ?? 1) === 1 &&
        restored.difficulty !== "hard"
          ? (restored.phase === "cleared" || restored.phase === "won") &&
            isStageComplete(restored.stage, restored.round)
            ? restored.stage
            : restored.stage - 1
          : 0;
      const cleared = Math.max(recorded, fromSave);
      clearedWaveRef.current = cleared;
      setHighestClearedWave(cleared);
      setSalsuCleared(cleared);
      if (cleared > recorded)
        store(
          CAMPAIGN_STORAGE_KEY,
          JSON.stringify({ version: 1, highestClearedWave: cleared }),
        );
    } catch {
      setStorageError(true);
    }
    setSaveReady(true);
  }, [storageScope, hydratedScope, auth.status, isAdmin]);
  useEffect(() => {
    if (home) return;
    persistGame();
    const timer = window.setInterval(persistGame, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") persistGame();
    };
    window.addEventListener("pagehide", persistGame);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", persistGame);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [
    home,
    roster,
    bag,
    gold,
    troopCards,
    wall,
    stage,
    round,
    phase,
    spawned,
    speed,
    upgrades,
    questProgress,
    unitGambleUsage,
  ]);
  const campaign = getStoryCampaign(chapter),
    front = frontForStage(stage, chapter),
    intro = frontIntro(stage, chapter);
  const permanentResearch=accountFromProfile(player??{}).research,
    deployLimit=DEPLOY_LIMIT+researchDeployLimit(permanentResearch);
  const totalRounds = stageRoundCount(stage),
    finalRound = isCampaignComplete(stage, round),
    stageEnd = isStageComplete(stage, round),
    maxSpawn = roundEnemyCount(stage, round, difficulty),
    bossEnemy = enemies.find((e) => e.boss),
    sel = roster.find((s) => s.id === selected),
    selDef = sel ? byName[sel.name] : null,
    available = recipes.filter(
      (u) =>
        !bannedHeroes.includes(u.name) &&
        inventoryRecipeStatus(u.recipe!, roster, bag).every(Boolean),
    );
  const stageCleared = phase === "cleared" && stageEnd;
  const quests = battleQuests(questProgress, roster, bag, upgrades),
    readyQuestCount = quests.filter(
      (quest) => quest.complete && !quest.claimed,
    ).length;
  const claimBattleQuest = (id: string) => {
    const current = progressRef.current,
      quest = battleQuests(
        current.questProgress,
        current.roster,
        current.bag,
        current.upgrades,
      ).find((item) => item.id === id);
    if (!quest) return;
    const result = claimQuest(current.questProgress, quest);
    if (!result) return;
    const previousClaims=current.questProgress.claimed.length,nextClaims=result.progress.claimed.length,
      bonusGold=previousClaims===0?researchQuestGold(permanentResearch):0,
      bonusTroops=previousClaims<3&&nextClaims>=3?researchQuestTroops(permanentResearch):0,
      bonusCitizens=previousClaims<5&&nextClaims>=5?researchQuestCitizens(permanentResearch):0,
      totalCitizens=result.citizens+bonusCitizens;
    const nextBag = totalCitizens
      ? {
          ...current.bag,
          시민: (current.bag.시민 ?? 0) + totalCitizens,
        }
      : current.bag;
    progressRef.current = {
      ...current,
      bag: nextBag,
      gold: current.gold + result.gold+bonusGold,
      troopCards: current.troopCards + result.troopCards+bonusTroops,
      questProgress: result.progress,
    };
    setBag(nextBag);
    setGold(current.gold + result.gold+bonusGold);
    setTroopCards(current.troopCards + result.troopCards+bonusTroops);
    setQuestProgress(result.progress);
    setNotice(`${quest.title} 보상을 획득했습니다.`);
  };
  const showStoryEpilogue: boolean = isStoryVictory(phase);
  const openStageSelection = () => {
    returnHome();
    setBooksOpen(false);
    setStoryOpen(false);
    setMapOpen(true);
  };
  const openStorySelection = () => {
    returnHome();
    setStoryOpen(false);
    setBooksOpen(true);
  };
  const skipReady = canSkipStage({
    phase,
    timeLeft,
    spawned,
    maxSpawn,
    enemyCount: enemies.length,
    paused: !!legendary.active,
  });
  const summon = () => {
    const current = progressRef.current;
    if (
      phase === "lost" ||
      phase === "won" ||
      current.troopCards < RECRUIT_TROOP_COST
    )
      return;
    const previousName=current.roster.at(-1)?.name,
      recruitPool=researchRecruitDiversity(permanentResearch)?basics.filter(candidate=>candidate.name!==previousName):basics,
      unit = recruitPool[Math.floor(Math.random() * recruitPool.length)],
      nextCards = current.troopCards - RECRUIT_TROOP_COST;
    progressRef.current = { ...current, troopCards: nextCards };
    setTroopCards(nextCards);
    if (autoStoreBasic || roster.length >= deployLimit) {
      const nextBag = {
        ...current.bag,
        [unit.name]: (current.bag[unit.name] ?? 0) + 1,
      };
      progressRef.current = { ...progressRef.current, bag: nextBag };
      setBag(nextBag);
      setNotice(`${unit.name} 모집 · 가방에 보관했습니다.`);
      return;
    }
    const slot = Array.from({ length: MAX_UNITS }, (_, i) => i).find(
      (i) => !current.roster.some((s) => s.slot === i),
    )!;
    const nextRoster = [
      ...current.roster,
      { id: idRef.current++, name: unit.name, slot },
    ];
    progressRef.current = { ...progressRef.current, roster: nextRoster };
    stateRef.current = { ...stateRef.current, roster: nextRoster };
    setRoster(nextRoster);
    setNotice(`${unit.name} 모집!`);
  };
  const receiveUnit = (name: string, source = "도박 성공") => {
    const current = progressRef.current,
      unit = byName[name],
      stored =
        current.roster.length >= deployLimit ||
        (unit.tier === 1 && autoStoreBasic);
    setUnitReward({ id: Date.now(), unit, source, stored });
    if (stored) {
      const nextBag = { ...current.bag, [name]: (current.bag[name] ?? 0) + 1 };
      progressRef.current = { ...current, bag: nextBag };
      setBag(nextBag);
      setNotice(`${source} · ${name} 획득! 가방에 보관했습니다.`);
      return;
    }
    const slot = Array.from({ length: MAX_UNITS }, (_, i) => i).find(
      (i) => !current.roster.some((s) => s.slot === i),
    );
    if (slot === undefined) return;
    const nextRoster = [...current.roster, { id: idRef.current++, name, slot }];
    progressRef.current = { ...current, roster: nextRoster };
    stateRef.current = { ...stateRef.current, roster: nextRoster };
    setRoster(nextRoster);
    setNotice(`${source} · ${name} 획득!`);
  };
  const gambleGold = (id: string) => {
    const option = goldGambles.find((item) => item.id === id),
      current = progressRef.current;
    if (!option || !gambleUnlocked(current.round, option.unlockRound)) return;
    const now = Date.now();
    if (!canGamble(current.gambleState, current.round, current.difficulty, now))
      return;
    const failures = current.gambleState.goldFailures[option.id],
      result = playGoldGamble(
        option,
        current.gold,
        current.difficulty,
        failures,
        Math.random,
        researchGamblePityBonus(permanentResearch),
      );
    if (!result) return;
    const refund=result.outcome==='failure'?Math.round((option.cost-result.reward)*researchGambleRefundPercent(permanentResearch)/100):0,
      adjustedGold=result.gold+refund,
      net=adjustedGold-current.gold,
      success = net >= 0,
      sign = net > 0 ? "+" : "";
    const nextGambleState = recordGoldGamble(
      current.gambleState,
      current.round,
      current.difficulty,
      option.id,
      result.outcome,
      now,
    );
    const nextQuestProgress = recordGoldQuest(
      current.questProgress,
      result.outcome === "failure",
    );
    setUnitReward(null);
    setGambleResult({
      id: Date.now(),
      outcome: success ? "success" : "failure",
      title: `${option.cost.toLocaleString()}G 도박 ${success ? "성공" : "실패"}`,
      detail: `${sign}${net.toLocaleString()}G`,
    });
    progressRef.current = {
      ...current,
      gold: adjustedGold,
      gambleState: nextGambleState,
      questProgress: nextQuestProgress,
    };
    setGold(adjustedGold);
    setGambleState(nextGambleState);
    setQuestProgress(nextQuestProgress);
    setNotice(
      `골드 도박 ${success ? "성공" : "실패"} · ${sign}${net.toLocaleString()}G`,
    );
  };
  const gambleUnit = (tier: 1 | 2 | 3) => {
    const option = unitGambles.find((item) => item.tier === tier),
      current = progressRef.current;
    if (!option || !gambleUnlocked(current.round, option.unlockRound)) return;
    const now = Date.now();
    if (!canGamble(current.gambleState, current.round, current.difficulty, now))
      return;
    if (unitGamblesRemaining(tier, current.round, current.unitGambleUsage) <= 0)
      return;
    const names = Object.values(byName)
        .filter((unit) => unit.tier === tier && unit.name !== "시민")
        .map((unit) => unit.name),
      result = playUnitGamble(
        option,
        current.gold,
        names,
        current.difficulty,
        current.gambleState.unitFailures[tier],
        Math.random,
        researchGamblePityBonus(permanentResearch),
      );
    if (!result) return;
    const nextGambleState = recordUnitGamble(
      current.gambleState,
      current.round,
      current.difficulty,
      tier,
      result.success,
      now,
    );
    const nextQuestProgress = recordUnitQuest(
      current.questProgress,
      result.success,
    );
    const extraRefund=!result.success?Math.round((option.cost-result.refund)*researchGambleRefundPercent(permanentResearch)/100):0,
      adjustedGold=result.gold+extraRefund;
    progressRef.current = {
      ...current,
      gold: adjustedGold,
      gambleState: nextGambleState,
      questProgress: nextQuestProgress,
    };
    setGold(adjustedGold);
    setGambleState(nextGambleState);
    setQuestProgress(nextQuestProgress);
    if (!result.success) {
      setUnitReward(null);
      setGambleResult({
        id: Date.now(),
        outcome: "failure",
        title: `${tier}단계 유닛 도박 실패`,
        detail: `${(result.refund+extraRefund).toLocaleString()}G 환급 · 성공 횟수 차감 없음`,
      });
      setNotice(
        `${tier}단계 유닛 도박 실패 · ${result.refund}G 환급 · 성공 횟수 차감 없음`,
      );
      return;
    }
    setGambleResult(null);
    const nextUsage = recordUnitGambleSuccess(
      tier,
      current.round,
      current.unitGambleUsage,
    );
    progressRef.current = {
      ...progressRef.current,
      unitGambleUsage: nextUsage,
    };
    setUnitGambleUsage(nextUsage);
    receiveUnit(result.name, "유닛 도박 성공");
  };
  const changeBag = (
    action: "store" | "deploy" | "sell",
    tier: number,
    name?: string,
    all = false,
  ) => {
    if (
      homeRef.current ||
      phase === "lost" ||
      phase === "won" ||
      stageCleared ||
      legendary.active
    )
      return;
    const current = progressRef.current;
    if (action === "sell" && name) {
      const result = sellStored(current.bag, name, all);
      progressRef.current = {
        ...current,
        bag: result.bag,
        gold: current.gold + result.gold,
      };
      setBag(result.bag);
      setGold((g) => g + result.gold);
      return;
    }
    const result =
      action === "store"
        ? storeUnits(current.roster, current.bag, tier)
        : deployUnits(
            current.roster,
            current.bag,
            tier,
            idRef.current,
            name,
            !!name,
            deployLimit,
          );
    if ("nextId" in result && typeof result.nextId === "number")
      idRef.current = result.nextId;
    progressRef.current = {
      ...current,
      roster: result.roster,
      bag: result.bag,
    };
    stateRef.current = { ...stateRef.current, roster: result.roster };
    setRoster(result.roster);
    setBag(result.bag);
    setSelected(null);
    setNotice(`${result.count}명 ${action === "store" ? "보관" : "배치"} 완료`);
  };
  useEffect(() => {
    if (
      home ||
      phase === "lost" ||
      phase === "won" ||
      stageCleared ||
      legendary.active
    )
      setBagOpen(false);
  }, [home, phase, stageCleared, legendary.active]);
  useEffect(() => {
    if (
      home ||
      phase === "lost" ||
      phase === "won" ||
      stageCleared ||
      legendary.active
    )
      setGambleOpen(false);
  }, [home, phase, stageCleared, legendary.active]);
  useEffect(() => {
    if (
      home ||
      phase === "lost" ||
      phase === "won" ||
      stageCleared ||
      legendary.active
    )
      setQuestOpen(false);
  }, [home, phase, stageCleared, legendary.active]);

  const merge = (u: UnitDef) => {
    if (bannedHeroes.includes(u.name)) {
      setNotice("이번 하드 전투에서 조합이 금지된 영웅입니다.");
      return;
    }
    if (
      homeRef.current ||
      phase === "lost" ||
      phase === "won" ||
      stageCleared ||
      legendary.active
    )
      return;
    const current = progressRef.current,
      id = idRef.current,
      result = combineInventory(u, current.roster, current.bag, id,deployLimit);
    if (!result.ok) {
      setNotice(
        result.reason === "capacity"
          ? "최종 단계 영웅을 배치할 자리가 필요합니다. 전장 유닛을 가방에 넣어 주세요."
          : "조합 재료가 부족합니다.",
      );
      return;
    }
    idRef.current++;
    const nextQuestProgress = recordCombinedTier(
      current.questProgress,
      u.tier,
      current.round,
    );
    progressRef.current = {
      ...current,
      roster: result.roster,
      bag: result.bag,
      questProgress: nextQuestProgress,
    };
    stateRef.current = { ...stateRef.current, roster: result.roster };
    setRoster(result.roster);
    setBag(result.bag);
    setQuestProgress(nextQuestProgress);
    setSelected(result.stored ? null : id);
    setMergeSuccess({ id, unit: u, stored: result.stored });
    setNotice(
      `${u.name} 조합 성공! ${result.stored ? "가방에 보관했습니다." : "전장에 배치했습니다."}`,
    );
    if (u.tier === 7) {
      setAttackFx([]);
      legendary.show(u.name);
    }
  };
  const buyUpgrade = (kind: UpgradeKind, key: string) => {
    const current = progressRef.current;
    if (
      homeRef.current ||
      current.phase === "lost" ||
      current.phase === "won" ||
      (current.phase === "cleared" &&
        isStageComplete(current.stage, current.round))
    )
      return;
    const result = purchaseUpgrade(
      current.upgrades,
      current.gold,
      kind,
      key,
      current.difficulty,
    );
    if (!result) return;
    progressRef.current = { ...current, ...result };
    stateRef.current = { ...stateRef.current, upgrades: result.upgrades };
    setGold(result.gold);
    setUpgrades(result.upgrades);
    setNotice("공격력 강화 완료!");
  };
  const sell = () => {
    if (!sel || !selDef) return;
    const value = salePrice(selDef);
    if (value === null) {
      setNotice("최상위 유닛은 판매할 수 없습니다.");
      return;
    }
    setRoster((r) => r.filter((s) => s.id !== sel.id));
    setGold((g) => g + value);
    setSelected(null);
    setNotice(`${selDef.name} 판매 · ${value} 골드 획득`);
  };
  const move = (id: number, slot: number) => {
    if (
      home ||
      stageCleared ||
      phase === "lost" ||
      phase === "won" ||
      legendary.active
    )
      return;
    const moving = roster.find((s) => s.id === id),
      other = roster.find((s) => s.slot === slot);
    if (!moving) return;
    setRoster((r) => moveOrSwap(r, id, slot));
    setSelected(null);
    setNotice(
      other
        ? `${moving.name} ↔ ${other.name} 자리 교환 완료`
        : `${moving.name} 이동 완료`,
    );
  };
  const selectSlot = (slot: number) => {
    if (
      home ||
      stageCleared ||
      phase === "lost" ||
      phase === "won" ||
      legendary.active
    )
      return;
    const soldier = roster.find((s) => s.slot === slot);
    if (sel) {
      if (soldier?.id === sel.id) setSelected(null);
      else move(sel.id, slot);
    } else if (soldier) setSelected(soldier.id);
  };
  const start = () => {
    const current = progressRef.current;
    if (current.phase !== "ready") return;
    progressRef.current = { ...current, phase: "battle" };
    const starterName = randomName(
      Object.values(byName)
        .filter((unit) => unit.tier === 2)
        .map((unit) => unit.name),
    );
    if (starterName) receiveUnit(starterName, "전투 시작 지원");
    beginRound(stage, round);
  };
  const beginRound = (nextStage: number, nextRoundNumber: number) => {
    if (nextRoundNumber > 1) {
      const nextCards = progressRef.current.troopCards + ROUND_TROOP_CARDS;
      progressRef.current = { ...progressRef.current, troopCards: nextCards };
      setTroopCards(nextCards);
    }
    setBattleIntro(
      nextRoundNumber === 1 && frontIntro(nextStage, chapter) !== null,
    );
    const boss = roundBossName(nextStage, nextRoundNumber, chapter);
    const arrival = boss ? bossLine(boss, nextStage, false, chapter) : null;
    if (arrival) setBossDialogue({ ...arrival, id: Date.now() });
    deadlineRef.current = Date.now() + STAGE_SECONDS * 1000;
    completedStageRef.current = 0;
    setTimeLeft(STAGE_SECONDS);
    setEnemies((old) =>
      boss
        ? [
            ...old,
            createRoundInvader(
              nextStage,
              nextRoundNumber,
              0,
              idRef.current++,
              difficulty,
              chapter,
            ),
          ]
        : old,
    );
    setAttackFx([]);
    setStage(nextStage);
    setRound(nextRoundNumber);
    setPhase("battle");
    setSpawned(boss ? 1 : 0);
    setOverlay(null);
    setNotice(
      boss
        ? `${boss} 출현! ${chapter}-${nextStage} · ${nextRoundNumber}라운드`
        : `${chapter}-${nextStage} · ${nextRoundNumber}라운드 시작`,
    );
  };
  const advance = () => {
    if (phase !== "cleared" || stageEnd || timeLeft > 0 || enemies.length > 0)
      return;
    const next = nextRound(stage, round);
    if (next) beginRound(next.stage, next.round);
  };
  const finishRound = (skipTime = false) => {
    if (stageEnd && bossDialogue?.defeated) return;
    if (completedStageRef.current === roundKey(stage, round)) return;
    completedStageRef.current = roundKey(stage, round);
    deadlineRef.current = null;
    setTimeLeft(0);
    setGold((g) => g + ROUND_CLEAR_GOLD);
    let accountReward: { gold: number; xp: number } | undefined;
    if (stageEnd) {
      setUpgradeOpen(false);
      accountReward = markWaveCleared(stage);
      setSelected(null);
      setOverlay(null);
      setAttackFx([]);
      setSkillFlash(null);
      flashQueue.current = [];
    }
    if (finalRound) {
      const line = bossLine(campaign.finalBoss, stage, true, chapter);
      if (line) setBossDialogue({ ...line, id: Date.now() });
      setPhase("won");
      setNotice(
        campaign.victory +
          (accountReward
            ? ` · 연구금 ${accountReward.gold} · EXP ${accountReward.xp}`
            : "") +
          (difficulty === "hard" && !player?.unlockedTitles?.includes(HARD_CLEAR_REWARDS[chapter].id)
            ? ` · ${campaign.title} 하드 최초 클리어 보상 획득!`
            : ""),
      );
      return;
    }
    if (stageEnd) {
      setPhase("cleared");
      setNotice(
        `${chapter}-${stage} 클리어! 계정 ${accountReward?.gold ?? 0}G · EXP ${accountReward?.xp ?? 0} · ${chapter}-${stage + 1} 스테이지가 개방되었습니다.`,
      );
      return;
    }
    if (skipTime) {
      const next = nextRound(stage, round);
      if (next) beginRound(next.stage, next.round);
    } else {
      setPhase("cleared");
      setNotice(
        stageEnd
          ? `${chapter}-${stage} 클리어! 다음 스테이지가 열렸습니다.`
          : `${round}라운드 방어 성공! 다음 라운드를 진행하세요.`,
      );
    }
  };
  const skip = () => {
    if (skipReady) finishRound(true);
  };
  const prepareStage = (nextStage: number, mode: Difficulty = difficulty) => {
    if (!canEnterChapter(chapter)) {
      setConfirmNew(false);
      setBooksOpen(true);
      return;
    }
    setBossDialogue(null);
    setBattleIntro(false);
    if (mode === "hard" && clearedWaveRef.current < 10) return;
    if (
      !isWaveUnlocked(
        nextStage,
        mode === "hard" ? hardClearedRef.current : clearedWaveRef.current,
      )
    )
      return;
    setDifficulty(mode);
    const nextBannedHeroes =
      mode === "hard" ? drawBannedHeroes(Math.random, chapter) : [];
    setBannedHeroes(nextBannedHeroes);
    setHardBanIntro(mode === "hard" ? nextBannedHeroes : null);
    setUpgrades(emptyUpgrades());
    setQuestProgress(emptyQuestProgress());
    setQuestOpen(false);
    setGambleState(emptyGambleState(1, mode));
    setUnitGambleUsage(emptyUnitGambleUsage(1));
    setUpgradeOpen(false);
    setAutoStoreBasic(false);
    setProfileReward(null);
    reinforcementRef.current = null;
    setReinforcement(null);
    legendary.close();
    heroTimers.current.clear();
    flashQueue.current = [];
    setSkillFlash(null);
    setUnitReward(null);
    setGambleResult(null);
    deadlineRef.current = null;
    completedStageRef.current = 0;
    rewardedBossesRef.current.clear();
    idRef.current = 1;
    setConfirmNew(false);
    const permanent = accountFromProfile(player ?? {}),
      startingGold = START_GOLD + researchStartGold(permanent.research),
      startingCards =
        START_TROOP_CARDS + researchStartTroops(permanent.research),
      startingCitizens = researchStartCitizens(permanent.research);
    homeRef.current = false;
    setHome(false);
    setMapOpen(false);
    setMapModalOpen(false);
    setRoster([]);
    setBag(startingCitizens ? { 시민: startingCitizens } : {});
    setBagOpen(false);
    setGold(startingGold);
    setTroopCards(startingCards);
    setWall(10);
    setStage(nextStage);
    setRound(1);
    setTimeLeft(STAGE_SECONDS);
    setPhase("ready");
    setEnemies([]);
    setAttackFx([]);
    setSelected(null);
    setSpawned(0);
    setSpeed(1);
    setOverlay(null);
    setNotice(
      `${chapter}-${nextStage} · 병력을 모집하고 전투를 준비하세요. · 병력패 ${startingCards}개 지급`,
    );
  };
  const launchStoryBattle = (progress: StoryProgress) => {
    if (progress.step !== 12 || !progress.merged || progress.summoned !== 4)
      return;
    selectChapter(1);
    prepareStage(1, "normal");
    setRoster(storyRoster(progress));
    setGold(storyGold(progress));
    idRef.current = 6;
    setStoryOpen(false);
    setStoryBattle(null);
    if (player) savePlayer({ ...player, tutorialComplete: true });
    try {
      removeStored(STORY_KEY);
    } catch {}
    beginRound(1, 1);
    setNotice(
      `${player?.nickname}의 첫 전투 · 온달과 함께 요동성을 지켜내세요!`,
    );
  };
  const requestStoryBattle = (progress: StoryProgress) => {
    if (canContinue(saved)) {
      setStoryBattle(progress);
      setConfirmNew(true);
    } else launchStoryBattle(progress);
  };
  const reset = () => prepareStage(1);
  const newGame = () => {
    if (!saveReady) return;
    setBooksOpen(true);
    setMapOpen(false);
    setMapModalOpen(false);
  };
  const chooseBattle = (wave: number, mode: Difficulty = "normal") => {
    if (!canEnterChapter(chapter)) return;
    if (mode === "hard" && clearedWaveRef.current < 10) return;
    if (
      !isWaveUnlocked(
        wave,
        mode === "hard" ? hardClearedRef.current : clearedWaveRef.current,
      )
    )
      return;
    setPendingDifficulty(mode);
    setPendingStage(wave);
    if (
      chapter === 1 &&
      mode === "normal" &&
      wave === 1 &&
      !player?.tutorialComplete
    ) {
      setBooksOpen(true);
      setMapOpen(false);
      setMapModalOpen(false);
      return;
    }
    if (chapter === 10 && isImjinPreludeStage(wave)) {
      setMapModalOpen(false);
      setBattlePrelude({ stage: wave, difficulty: mode });
      return;
    }
    if (canContinue(saved)) setConfirmNew(true);
    else prepareStage(wave, mode);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlay(null);
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!overlay) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(
      overlay === "book" ? ".book-modal" : ".help-modal",
    );
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
      );
      const index = controls.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      event.preventDefault();
      controls[
        (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
      ]?.focus();
    };
    dialog?.addEventListener("keydown", onTab);
    return () => {
      dialog?.removeEventListener("keydown", onTab);
      if (previous?.isConnected && !previous.closest("[inert]"))
        previous.focus();
    };
  }, [overlay]);
  useEffect(() => {
    if (home || phase === "lost" || phase === "won") return;
    let spawnClock = 0,
      visualCooldown = 0,
      effectLife = 0,
      fxSerial = 0,
      lastSecond = STAGE_SECONDS;
    const cooldowns = new Map<number, number>();
    let lastBossTick = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now(),
        bossElapsed = (now - lastBossTick) / 1000;
      lastBossTick = now;
      if (homeRef.current || legendary.pausedAtRef.current !== null) return;
      const s = stateRef.current,
        dt = 0.1 * s.speed,
        limit = roundEnemyCount(s.stage, s.round, s.difficulty);
      const timedEnemies =
        s.phase === "battle"
          ? tickBossTimers(s.enemies, bossElapsed)
          : s.enemies;
      const timedOut = expiredBoss(timedEnemies);
      if (timedOut) {
        setEnemies(timedEnemies);
        setWall(0);
        setPhase("lost");
        deadlineRef.current = null;
        setNotice(`${timedOut.name} 처치 제한시간 90초를 초과했습니다.`);
        return;
      }
      const reinforcementPlan = reinforcementFor(
        s.chapter,
        s.difficulty,
        s.stage,
      );
      const storyBoss = timedEnemies.find(
        (enemy) =>
          enemy.boss &&
          isCampaignComplete(enemy.originStage, enemy.originRound ?? s.round),
      );
      let activeReinforcement = reinforcementRef.current;
      if (
        reinforcementPlan &&
        storyBoss &&
        (storyBoss.bossSeconds ?? BOSS_SECONDS) <= 70 &&
        !activeReinforcement
      ) {
        activeReinforcement = {
          chapter: s.chapter,
          hero: reinforcementPlan.hero,
          damageDealt: 0,
          halfSpoken: false,
        };
        reinforcementRef.current = activeReinforcement;
        progressRef.current = {
          ...progressRef.current,
          reinforcement: activeReinforcement,
        };
        setReinforcement(activeReinforcement);
        setBossDialogue({
          id: Date.now(),
          title: "역사의 원군 도착",
          speaker: reinforcementPlan.hero,
          text: reinforcementPlan.arrival,
          defeated: false,
          extra: [
            { speaker: storyBoss.name, text: reinforcementPlan.bossReply },
          ],
        });
        setNotice(
          `${reinforcementPlan.hero} 원군 합류! 최종 보스 공략을 지원합니다.`,
        );
      }
      visualCooldown = Math.max(0, visualCooldown - 0.1);
      if (effectLife > 0) {
        effectLife -= 0.1;
        if (effectLife <= 0) setAttackFx([]);
      }
      if (s.phase === "battle") {
        const seconds = Math.max(
          0,
          Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000),
        );
        if (seconds !== lastSecond) {
          lastSecond = seconds;
          setTimeLeft(seconds);
          if (seconds === 0)
            setNotice(
              "30초 종료 · 다음 라운드 진행 (마지막 라운드는 적 전멸 시 클리어)",
            );
        }
        spawnClock += dt;
        if (spawnClock >= 0.72 && s.spawned < limit) {
          spawnClock = 0;
          const invader = createRoundInvader(
            s.stage,
            s.round,
            s.spawned,
            idRef.current++,
            s.difficulty,
            s.chapter,
          );
          setEnemies((old) => [...old, invader]);
          setSpawned((n) => n + 1);
          if (isOverrun(s.enemies.length + 1)) {
            setWall(0);
            setPhase("lost");
            deadlineRef.current = null;
            setNotice("적군이 100명 누적되어 방어선이 무너졌습니다.");
            return;
          }
        }
      }
      const { hits, shots, stuns } = combatStep(
        s.roster,
        s.enemies,
        dt,
        s.stage,
        cooldowns,
        s.upgrades,
        Math.random,
        activeHeroBuffs(s.roster, heroTimers.current),
        player?.research,
        player?.heroRecords,
      );
      if (s.phase === "battle") {
        const skill = heroSkillStep(
          s.roster,
          s.enemies,
          0.1,
          s.stage,
          heroTimers.current,
          s.upgrades,
        );
        for (const [id, damage] of skill.hits)
          hits.set(id, (hits.get(id) ?? 0) + damage);
        for (const [id, seconds] of skill.stuns)
          stuns.set(id, Math.max(stuns.get(id) ?? 0, seconds));
        if (skill.gold) setGold((g) => g + skill.gold);
        // Wall healing is retired: defeat now depends on enemy accumulation.
        flashQueue.current = [
          ...new Set([...flashQueue.current, ...skill.casts]),
        ];
        // Each hero gets its own two-second image, even when multiple skills fire together.
        if (flashQueue.current.length && Date.now() >= flashSerial.current) {
          const name = flashQueue.current.shift()!;
          flashSerial.current = Date.now() + 2000;
          setSkillFlash({
            names: [name],
            serial: flashSerial.current,
            expiresAt: flashSerial.current,
          });
        }
      }
      if (reinforcementPlan && storyBoss && activeReinforcement) {
        const damage = reinforcementDamage(
          reinforcementPlan,
          storyBoss.maxHp,
          bossElapsed,
          activeReinforcement.damageDealt,
        );
        if (damage > 0) {
          hits.set(storyBoss.id, (hits.get(storyBoss.id) ?? 0) + damage);
          activeReinforcement = {
            ...activeReinforcement,
            damageDealt: activeReinforcement.damageDealt + damage,
          };
          reinforcementRef.current = activeReinforcement;
          progressRef.current = {
            ...progressRef.current,
            reinforcement: activeReinforcement,
          };
        }
        if (
          !activeReinforcement.halfSpoken &&
          storyBoss.hp - (hits.get(storyBoss.id) ?? 0) <= storyBoss.maxHp * 0.5
        ) {
          activeReinforcement = { ...activeReinforcement, halfSpoken: true };
          reinforcementRef.current = activeReinforcement;
          progressRef.current = {
            ...progressRef.current,
            reinforcement: activeReinforcement,
          };
          setReinforcement(activeReinforcement);
          setBossDialogue({
            id: Date.now(),
            title: "최종전 · 반격",
            speaker: reinforcementPlan.hero,
            text: reinforcementPlan.halfHp,
            defeated: false,
          });
        }
      }
      if (shots.length && visualCooldown <= 0) {
        setAttackFx(
          shots.map((shot) => ({
            id: ++fxSerial,
            fromX: shot.from.x,
            fromY: shot.from.y,
            toX: shot.to.x,
            toY: shot.to.y,
            color: shot.color,
          })),
        );
        visualCooldown = 0.1;
        effectLife = 0.36;
      }
      const defeated = defeatedDialogueBoss(s.enemies, hits);
      if (defeated) {
        const line = bossLine(defeated.name, s.stage, true, s.chapter);
        if (line) setBossDialogue({ ...line, id: Date.now() });
      }
      const defeatedBosses = s.enemies.filter(
        (enemy) =>
          enemy.boss &&
          !isStageComplete(enemy.originStage, enemy.originRound ?? s.round) &&
          enemy.hp > 0 &&
          enemy.hp <= (hits.get(enemy.id) ?? 0) &&
          !rewardedBossesRef.current.has(enemy.id),
      );
      for (const enemy of defeatedBosses) {
        rewardedBossesRef.current.add(enemy.id);
        const bossCardReward=BOSS_TROOP_CARDS+researchBossTroops(permanentResearch),
          bossGoldReward=researchBossGold(permanentResearch),
          nextCards = progressRef.current.troopCards + bossCardReward,
          nextGold=progressRef.current.gold+bossGoldReward;
        progressRef.current = { ...progressRef.current, troopCards: nextCards,gold:nextGold };
        setTroopCards(nextCards);
        setGold(nextGold);
        const rewardRound = enemy.originRound ?? s.round,
          citizenCount = bossCitizenRewardCount(rewardRound)+researchBossCitizens(permanentResearch);
        const rewardTier = bossUnitRewardTier(rewardRound),
          rewardName = rewardTier
            ? randomName(
                Object.values(byName)
                  .filter((unit) => unit.tier === rewardTier)
                  .map((unit) => unit.name),
              )
            : null;
        if (rewardName)
          receiveUnit(
            rewardName,
            `${enemy.name} 처치 보상 · 병력패 ${bossCardReward}개`,
          );
        else
          setNotice(`${enemy.name} 처치 · 병력패 ${bossCardReward}개 획득${bossGoldReward?` · ${bossGoldReward}G`:''}`);
        if (citizenCount) {
          const current = progressRef.current,
            nextBag = {
              ...current.bag,
              시민: (current.bag.시민 ?? 0) + citizenCount,
            };
          progressRef.current = { ...current, bag: nextBag };
          setBag(nextBag);
          const citizenText = `시민 ×${citizenCount} · 가방 보관`;
          setUnitReward((previous) =>
            previous
              ? { ...previous, bonus: citizenText }
              : {
                  id: Date.now(),
                  unit: byName.시민,
                  source: `${enemy.name} 처치 보상`,
                  stored: true,
                  quantity: citizenCount,
                },
          );
          setNotice(
            `${enemy.name} 처치 · 병력패 ${bossCardReward}개 · 시민 ${citizenCount}명 획득${bossGoldReward?` · ${bossGoldReward}G`:''}${rewardName ? ` · ${rewardName} 획득` : ""}`,
          );
        }
      }
      const killGold = s.enemies
        .filter(
          (e) =>
            e.hp <= (hits.get(e.id) ?? 0) &&
            !(
              e.boss && isStageComplete(e.originStage, e.originRound ?? s.round)
            ),
        )
        .reduce((total, e) => total + e.reward, 0);
      if (killGold) setGold((g) => g + killGold);
      setEnemies((old) => {
        if (!old.length) return old;
        const bossTime = new Map(
          timedEnemies.filter((e) => e.boss).map((e) => [e.id, e.bossSeconds]),
        );
        let next = old.map((e) => ({
          ...advanceEnemy(e, s.roster, dt, stuns.get(e.id)),
          ...(e.boss && bossTime.has(e.id)
            ? { bossSeconds: bossTime.get(e.id) }
            : {}),
          hp: e.hp - (hits.get(e.id) || 0),
        }));
        next = next.filter((e) => e.hp > 0);
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [home, phase, stage, round]);
  useEffect(() => {
    if (home || legendary.active || phase === "lost" || phase === "won") return;
    if (isOverrun(enemies.length)) {
      setWall(0);
      setPhase("lost");
      deadlineRef.current = null;
      setNotice("적군이 100명 누적되어 방어선이 무너졌습니다.");
      return;
    }
    if (
      !canCompleteStage(
        {
          phase,
          timeLeft,
          spawned,
          maxSpawn,
          enemyCount: enemies.length,
          paused: !!legendary.active,
        },
        stage,
        round,
      ) &&
      !(
        !stageEnd &&
        canAutoAdvanceRound({
          phase,
          timeLeft,
          spawned,
          maxSpawn,
          enemyCount: enemies.length,
          paused: !!legendary.active,
        })
      )
    )
      return;
    finishRound(true);
  }, [
    home,
    wall,
    timeLeft,
    spawned,
    enemies.length,
    phase,
    stage,
    round,
    maxSpawn,
    legendary.active,
    bossDialogue,
  ]);
  const timeLabel = `00:${String(timeLeft).padStart(2, "0")}`;
  const account = accountFromProfile(player ?? {});
  if (auth.status === "loading" || auth.status === "signedOut")
    return (
      <div className="game-root on-title">
        <TitleScreen
          profile={player}
          save={saved}
          ready={saveReady}
          storageError={storageError||cloudStorageError}
          inert={false}
          onNew={newGame}
          onContinue={continueGame}
        />
      </div>
    );
  if (!playerReady)
    return (
      <div className="game-root prologue">
        <p role="status">서책을 펼치는 중입니다…</p>
      </div>
    );
  if (!player || !player.prologueComplete || replayPrologue)
    return (
      <div className="game-root on-prologue">
        <Prologue
          profile={player}
          storageError={playerStorageError}
          onCreate={(nickname) =>
            savePlayer({
              version: 1,
              nickname,
              prologueComplete: false,
              ...accountFromProfile({}),
            })
          }
          onComplete={() => {
            if (player) savePlayer({ ...player, prologueComplete: true });
            setReplayPrologue(false);
            setBooksOpen(false);
            setMapOpen(false);
          }}
          onClose={replayPrologue ? () => setReplayPrologue(false) : undefined}
        />
      </div>
    );
  if (booksOpen && home)
    return (
      <div className="game-root">
        <StoryBooks
          haengjuCleared={haengjuCleared}
          myeongnyangCleared={myeongnyangCleared}
          hansandoCleared={hansandoCleared}
          cheoinCleared={cheoinCleared}
          gwijuCleared={gwijuCleared}
          nadangCleared={nadangCleared}
          hwangsanCleared={hwangsanCleared}
          ansiCleared={ansiCleared}
          salsuCleared={salsuCleared}
          onBack={() => setBooksOpen(false)}
          onSelect={(next) => {
            if (!canEnterChapter(next)) return;
            selectChapter(next);
            setBooksOpen(false);
            const seen = storyWasSeen(next);
            setStoryOpen(!seen);
            setMapOpen(seen);
            setMapModalOpen(false);
          }}
        />
      </div>
    );
  if (storyOpen && home)
    return (
      <div className="game-root">
        <StoryArrival
          chapter={chapter}
          nickname={player.nickname}
          onClose={() => {
            setStoryOpen(false);
            setBooksOpen(true);
          }}
          onComplete={() => {
            markStorySeen(chapter);
            savePlayer({ ...player, tutorialComplete: true });
            setStoryOpen(false);
            setBooksOpen(false);
            setMapOpen(true);
            setMapModalOpen(false);
          }}
        />
      </div>
    );
  if (battlePrelude && home)
    return (
      <div className="game-root">
        <BattlePrelude
          stage={battlePrelude.stage}
          nickname={player.nickname}
          onClose={() => setBattlePrelude(null)}
          onComplete={() => {
            const selection = battlePrelude;
            setBattlePrelude(null);
            if (canContinue(saved)) setConfirmNew(true);
            else prepareStage(selection.stage, selection.difficulty);
          }}
        />
      </div>
    );
  return (
    <div
      className={`game-root ${home ? "on-title" : ""} ${legendary.active ? "cinematic-active" : ""}`}
    >
      {bagOpen && !home && (
        <UnitBag
          bag={bag}
          roster={roster}
          deployLimit={deployLimit}
          autoStoreBasic={autoStoreBasic}
          onAutoStoreBasic={toggleAutoStoreBasic}
          onClose={() => setBagOpen(false)}
          onStore={(t) => changeBag("store", t)}
          onDeploy={(t, name) => changeBag("deploy", t, name)}
          onSell={(name, all) => changeBag("sell", 0, name, all)}
          portrait={(u) => <Portrait u={u} />}
        />
      )}
      {questOpen && !home && (
        <QuestDialog
          quests={quests}
          onClaim={claimBattleQuest}
          onClose={() => setQuestOpen(false)}
        />
      )}
      {upgradeOpen && !home && (
        <UpgradeDialog
          state={upgrades}
          gold={gold}
          difficulty={difficulty}
          disabled={phase === "lost" || phase === "won" || stageCleared}
          onBuy={buyUpgrade}
          onClose={() => setUpgradeOpen(false)}
        />
      )}
      {gambleOpen && !home && (
        <GamblingDialog
          gold={gold}
          round={round}
          difficulty={difficulty}
          gambleState={gambleState}
          unitUsage={unitGambleUsage}
          disabled={phase === "lost" || phase === "won" || stageCleared}
          onGold={gambleGold}
          onUnit={gambleUnit}
          onClose={() => setGambleOpen(false)}
        />
      )}
      <header
        className="game-header"
        inert={
          stageCleared ||
          !!legendary.active ||
          confirmNew ||
          mapModalOpen ||
          gambleOpen ||
          questOpen ||
          researchOpen ||
          (home && !!overlay)
        }
      >
        <div
          className="player-profile"
          title={`플레이어: ${player.nickname} · 이 브라우저에 저장된 프로필`}
        >
          <ProfileAvatar avatar={player.avatar} />
          <span>
            {player.title && (
              <small className="reward-title player-title">
                {hardClearRewardForId(player.title)?.title}
              </small>
            )}
            <b className="player-name">{player.nickname}</b>
            <small className="player-account-line">Lv {account.level}</small>
          </span>
        </div>
        <div className="header-tools">
          {home && !mapModalOpen && (
            <div className="account-resources" aria-label="계정 재화">
              <span className="account-resource xp" title="계정 경험치" aria-label={`계정 경험치 ${account.xp}/${xpForNextLevel(account.level)}`}><Sparkles aria-hidden="true"/><b>{account.xp.toLocaleString()}/{xpForNextLevel(account.level).toLocaleString()}</b></span>
              <span className="account-resource research" title="연구금: 연구소에서 사용하는 계정 재화" aria-label={`연구금 ${account.accountGold.toLocaleString()}`}><FlaskConical aria-hidden="true"/><b>{account.accountGold.toLocaleString()}</b></span>
            </div>
          )}
          <BattleSettings
            mood={home ? "silent" : getMusicMood(phase, enemies)}
            blocked={
              stageCleared ||
              !!legendary.active ||
              confirmNew ||
              mapModalOpen ||
              !!overlay ||
              upgradeOpen ||
              gambleOpen ||
              questOpen ||
              researchOpen
            }
            accountMode={auth.status === "authenticated" ? "logout" : "login"}
            onStage={openStageSelection}
            onStory={openStorySelection}
            onCodex={() => openCodex()}
            onHelp={() => setOverlay("help")}
            onProfile={() => setProfileOpen(true)}
            onAccount={() => {
              returnHome();
              if (auth.status === "authenticated") void auth.signOut();
              else auth.showLogin();
            }}
          />
        </div>
      </header>
      {profileOpen && (
        <ProfileSettings
          profile={player}
          onSave={savePlayer}
          onClose={() => setProfileOpen(false)}
        />
      )}
      {researchOpen && player && (
        <ResearchLab
          profile={player}
          onUpgrade={upgradeResearch}
          onClose={() => setResearchOpen(false)}
        />
      )}
      {home && !mapOpen && (
        <TitleScreen
          profile={player}
          save={saved && canEnterChapter(saved.chapter ?? 1) ? saved : null}
          chapter={chapter}
          clearedStage={highestClearedWave}
          ready={saveReady}
          storageError={storageError||cloudStorageError}
          inert={
            stageCleared ||
            !!legendary.active ||
            !!overlay ||
            confirmNew ||
            researchOpen
          }
          onNew={newGame}
          onContinue={continueGame}
          onStory={openStorySelection}
          onCombination={() => setOverlay("book")}
          onCodex={() => openCodex()}
          onProfile={() => setProfileOpen(true)}
          onResearch={() => setResearchOpen(true)}
        />
      )}
      {home && mapOpen && (
        <StageMap
          key={chapter}
          chapter={chapter}
          hardCleared={hardCleared}
          highestClearedWave={highestClearedWave}
          blocked={confirmNew || !!legendary.active || !!overlay}
          onModalChange={setMapModalOpen}
          onBack={() => {
            setMapOpen(false);
            setMapModalOpen(false);
            setBooksOpen(true);
          }}
          onStart={chooseBattle}
        />
      )}
      {!home && (
        <>
          <div
            className="game-status"
            inert={stageCleared || !!legendary.active}
          >
            <div className="status-stage">
              <small>STAGE</small>
              <b>
                {chapter}-{String(stage).padStart(2, "0")}
              </b>
              <span>
                라운드 {round} / {totalRounds}
              </span>
            </div>
            <div className="status-enemy">
              <small>남은 적</small>
              <b>
                {enemies.length}
                <span>/100</span>
              </b>
            </div>
            <div className="status-gold">
              <small>보유 골드</small>
              <b>
                <Coins size={18} />
                {gold}
              </b>
            </div>
            <div className="status-speed">
              <small>속도</small>
              <div>
                {[1, 2, 3].map((n) => (
                  <button
                    className={speed === n ? "on" : ""}
                    key={n}
                    aria-label={`전투 속도 ${n}배`}
                    aria-pressed={speed === n}
                    onClick={() => setSpeed(n)}
                  >
                    <span className="speed-value">
                      <span>{n}</span>
                      <span>×</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <main className="game-main">
            <aside
              className="stage-panel"
              inert={stageCleared || !!legendary.active}
            >
              <div className="panel-kicker">
                BATTLE STATUS · {difficulty === "hard" ? "하드" : "일반"}
              </div>
              <div className="hud-stage">
                <small>
                  현재 스테이지 · {difficulty === "hard" ? "하드" : "일반"}
                </small>
                <strong>
                  {chapter}-{String(stage).padStart(2, "0")}{" "}
                  <span>
                    / {chapter}-{FINAL_WAVE}
                  </span>
                </strong>
                <b>
                  라운드 {round} / {totalRounds}
                  {roundBossName(stage, round, chapter) ? " · 보스전" : ""}
                </b>
              </div>
              <div
                className={`hud-stat hud-timer ${timeLeft === 0 ? "overtime" : ""}`}
              >
                <div>
                  <small>남은 시간</small>
                  <strong>
                    <Clock3 size={17} />
                    {timeLabel}
                  </strong>
                </div>
                <p>
                  {skipReady
                    ? "적군 전멸 · 스킵으로 바로 진행 가능"
                    : timeLeft > 0
                      ? "적군 전멸 시 남은 시간 스킵 가능"
                      : enemies.length
                        ? `연장전 · 남은 적 ${enemies.length}명`
                        : "적군 전멸 · 다음 단계 준비 완료"}
                </p>
              </div>
              <div className="hud-stat hud-enemies">
                <div>
                  <small>전장에 남은 적군</small>
                  <strong>
                    {enemies.length}
                    <span>/100</span>
                  </strong>
                </div>
                <p>
                  이번 라운드 출현 {spawned} / {maxSpawn}
                  <br />
                  100명 누적 시 패배합니다.
                </p>
              </div>
              <div className="hud-stat">
                <div>
                  <small>보유 골드</small>
                  <strong>
                    <Coins size={18} />
                    {gold}
                  </strong>
                </div>
              </div>
              <div className="hud-speed">
                <small>진행 속도</small>
                <div>
                  {[1, 2, 3].map((n) => (
                    <button
                      className={speed === n ? "on" : ""}
                      key={n}
                      aria-label={`전투 속도 ${n}배`}
                      aria-pressed={speed === n}
                      onClick={() => setSpeed(n)}
                    >
                      <span className="speed-value">
                        <span>{n}</span>
                        <span>×</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <section className="battle-story" aria-label="진행 이야기">
                <h3>
                  {getStoryStage(chapter, stage).year} · {front.name}
                </h3>
                <small>
                  {chapter}-{stage} · 전투 {round}/{totalRounds}
                </small>
                <p>{front.intro}</p>
                <p>
                  <b>{getStoryStage(chapter, stage).guide}</b>
                  <br />
                  {player.nickname}, {front.dialogue}
                </p>
                <p>
                  <b>책의 정령</b>
                  <br />
                  {player.nickname}, 병사를 모집하고 영웅을 조합해 방어선을
                  지켜라.
                </p>
                <button onClick={() => setOverlay("book")}>조합서</button>
                <button onClick={() => openCodex()}>도감</button>
              </section>
              <p className="hud-rule">
                30초마다 다음 라운드 · 매 라운드 적 {maxSpawn}명 · 일반 적
                처치당 {difficulty === "hard" ? 15 : 20}G. 적 100명 누적 시
                패배합니다. 마지막 라운드는 남은 적을 모두 처치해야
                클리어합니다.
              </p>
            </aside>
            <section className="center-panel">
              <div
                className="arena-heading"
                inert={stageCleared || !!legendary.active}
              >
                <div>
                  <small>TACTICAL FIELD · 사각 순환 전장</small>
                  <h1>
                    {front.name} · {round}라운드
                  </h1>
                </div>
                <div className="battle-resources">
                  <div className="battle-resource">
                    <Ticket />
                    <span>
                      <small>병력패</small>
                      <b>{troopCards}</b>
                    </span>
                  </div>
                  <div className="battle-resource">
                    <Coins />
                    <span>
                      <small>골드</small>
                      <b>{gold.toLocaleString()}</b>
                    </span>
                  </div>
                </div>
              </div>
              <div className="arena-stage">
                <div className="arena-board">
                  <div
                    className="battle-world"
                    inert={stageCleared || !!legendary.active}
                  >
                    <BattleTerrain chapter={chapter} stage={stage} />
                    <div className={`unit-grid ${sel ? "has-selection" : ""}`}>
                      {Array.from({ length: MAX_UNITS }, (_, i) => {
                        const soldier = roster.find((s) => s.slot === i),
                          u = soldier ? byName[soldier.name] : null;
                        return (
                          <button
                            key={i}
                            className={`board-slot ${u ? `filled tier-${u.tier}` : ""} ${selected === soldier?.id ? "selected" : ""}`}
                            onClick={() => selectSlot(i)}
                            aria-pressed={!!soldier && selected === soldier.id}
                            aria-label={
                              u ? `${u.name} ${u.tier}단계` : `빈 칸 ${i + 1}`
                            }
                            title={
                              sel
                                ? soldier?.id === sel.id
                                  ? "다시 눌러 선택 취소"
                                  : soldier
                                    ? `${sel.name} ↔ ${soldier.name} 자리 교환`
                                    : "선택한 유닛을 이 칸으로 이동"
                                : u
                                  ? `${u.name} 선택 · 다른 유닛을 누르면 자리 교환`
                                  : "유닛을 먼저 선택하세요"
                            }
                          >
                            {u ? (
                              <>
                                <Portrait u={u} size="tiny" />
                                <span>{u.name}</span>
                              </>
                            ) : (
                              <span className="slot-plus">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {reinforcement && (
                      <div
                        className="story-reinforcement"
                        role="status"
                        aria-label={`${reinforcement.hero} 원군 전투 지원`}
                      >
                        <LoadingBackground src={campaign.reinforcement.image} />
                        <Portrait
                          u={byName[reinforcement.hero]}
                          size="normal"
                        />
                        <span>
                          <small>HISTORICAL ALLY · 원군</small>
                          <b>{reinforcement.hero}</b>
                        </span>
                      </div>
                    )}
                    {enemies.map((e) => {
                      const p = pathAt(e.progress),
                        art = enemyPortraitFor(e),
                        finalBoss =
                          e.boss &&
                          isStageComplete(
                            e.originStage,
                            e.originRound ?? round,
                          );
                      return (
                        <div
                          key={e.id}
                          className={`invader ${e.boss ? `boss ${finalBoss ? "final-boss" : "mid-boss"}` : ""} ${phase === "lost" || phase === "won" ? "" : "is-moving"}`}
                          style={{
                            left: `${e.boss ? Math.min(92, Math.max(8, p.x)) : p.x}%`,
                            top: `${e.boss ? Math.min(90, Math.max(10, p.y)) : p.y}%`,
                          }}
                          title={`${e.name} · ${Math.ceil(e.hp)} HP`}
                        >
                          <span className="invader-hp">
                            <i
                              style={{
                                width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%`,
                              }}
                            />
                          </span>
                          <span
                            className="enemy-sprite-viewport"
                            style={
                              {
                                "--step-delay": `-${(e.id % 5) * 0.09}s`,
                              } as React.CSSProperties
                            }
                          >
                            <LoadingImage
                              src={art.src}
                              alt=""
                              style={
                                art.crop
                                  ? {
                                      width: `${100 / art.crop.w}%`,
                                      height: `${100 / art.crop.h}%`,
                                      left: `${(-art.crop.x / art.crop.w) * 100}%`,
                                      top: `${(-art.crop.y / art.crop.h) * 100}%`,
                                      maxWidth: "none",
                                    }
                                  : art.standalone
                                  ? {
                                      width: "100%",
                                      height: "100%",
                                      left: 0,
                                      top: 0,
                                      objectFit: "contain",
                                    }
                                  : {
                                      width: "400%",
                                      height: "200%",
                                      left: `-${art.col * 100}%`,
                                      top: `-${art.row * 100}%`,
                                      maxWidth: "none",
                                    }
                              }
                            />
                          </span>
                          {e.boss && (
                            <span className="boss-name">{e.name}</span>
                          )}
                        </div>
                      );
                    })}
                    {sel && selDef && (
                      <AttackRange soldier={sel} unit={selDef} />
                    )}
                    <AttackOverlay effects={attackFx} />
                    {bossEnemy && (
                      <div className="boss-banner">
                        <b>♛ {bossEnemy.name}</b>
                        <strong className="boss-countdown">
                          제한시간{" "}
                          {Math.ceil(bossEnemy.bossSeconds ?? BOSS_SECONDS)}초
                          {enemies.filter((e) => e.boss).length > 1
                            ? ` · 보스 ${enemies.filter((e) => e.boss).length}명`
                            : ""}
                        </strong>
                        <span>
                          {Math.ceil(bossEnemy.hp).toLocaleString()} /{" "}
                          {bossEnemy.maxHp.toLocaleString()}
                        </span>
                        <i>
                          <span
                            style={{
                              width: `${Math.max(0, (bossEnemy.hp / bossEnemy.maxHp) * 100)}%`,
                            }}
                          />
                        </i>
                      </div>
                    )}
                    {bossDialogue && phase !== "won" && (
                      <div
                        key={bossDialogue.id}
                        className="battle-intro-text"
                        role="status"
                        aria-live="polite"
                      >
                        <strong>{bossDialogue.title}</strong>
                        <p>
                          <span>{bossDialogue.speaker}</span>
                          <br />“{bossDialogue.text}”
                        </p>
                        {bossDialogue.extra?.map((line, i) => (
                          <p key={i}>
                            <span>{line.speaker}</span>
                            <br />“{line.text}”
                          </p>
                        ))}
                      </div>
                    )}
                    {hardBanIntro && !bossDialogue && (
                      <div
                        className="battle-intro-text hard-variant-intro"
                        role="status"
                        aria-live="polite"
                      >
                        <strong>변칙 모드</strong>
                        <b>해당 유닛 조합이 금지됩니다.</b>
                        <p>
                          <span>7단계 랜덤 유닛 3개</span>
                          <br />“{hardBanIntro.join(" · ")}”
                        </p>
                      </div>
                    )}
                    {battleIntro && intro && !bossDialogue && !hardBanIntro && (
                      <div
                        className="battle-intro-text"
                        role="status"
                        aria-live="polite"
                      >
                        <strong>{intro.title}</strong>
                        {intro.lines.map((line) => (
                          <b key={line}>{line}</b>
                        ))}
                        <p>
                          <span>{intro.speaker}</span> “{intro.text}”
                        </p>
                      </div>
                    )}
                    <button
                      className="board-bag"
                      onClick={() => {
                        setSelected(null);
                        setBagOpen(true);
                      }}
                      aria-label="유닛 가방 열기"
                    >
                      <Backpack size={21} />
                      <span>
                        {Object.values(bag).reduce((a, b) => a + b, 0)}
                      </span>
                    </button>
                    <button
                      className={`board-quest ${readyQuestCount ? "ready" : ""}`}
                      onClick={() => {
                        setSelected(null);
                        setQuestOpen(true);
                      }}
                      aria-label={`전투 퀘스트 열기${readyQuestCount ? ` · 수령 가능 ${readyQuestCount}개` : ""}`}
                    >
                      <ClipboardList size={20} />
                      {readyQuestCount > 0 && <span>{readyQuestCount}</span>}
                    </button>
                    <div className="board-count">
                      배치 {roster.length} / {deployLimit}
                    </div>
                  </div>
                  {skillFlash && !legendary.active && (
                    <HeroSkillFlash
                      key={skillFlash.serial}
                      flash={skillFlash}
                    />
                  )}{" "}
                  {legendary.active && legendary.active.mode !== "codex" && (
                    <LegendaryReveal
                      key={legendary.active.serial}
                      scene={legendary.active.scene}
                      preview={legendary.active.preview}
                      onClose={legendary.close}
                    />
                  )}
                </div>
              </div>
              <div
                className="arena-foot"
                inert={stageCleared || !!legendary.active}
              >
                <div className="arena-message">
                  ✧{" "}
                  {sel
                    ? `${sel.name} 선택 · 다른 유닛: 자리 교환 / 빈 칸: 이동 / 다시 클릭: 취소`
                    : skipReady
                      ? "적군 전멸! 남은 시간을 스킵할 수 있습니다."
                      : notice}
                </div>
                <div className="wave-action">
                  <span>
                    {phase === "battle"
                      ? `${timeLeft > 0 ? "진행" : "연장전"} ${spawned}/${maxSpawn} · 남은 적 ${enemies.length}`
                      : `라운드 ${round} / ${totalRounds}`}
                  </span>
                  {phase === "ready" ? (
                    <button onClick={start}>전투 시작</button>
                  ) : phase === "battle" ? (
                    <button
                      className="wave-skip"
                      onClick={skip}
                      disabled={!skipReady}
                      title={
                        skipReady
                          ? "남은 시간을 건너뛰고 바로 진행합니다."
                          : "이번 라운드의 적이 모두 출현하고 전멸하면 활성화됩니다."
                      }
                    >
                      <SkipForward size={16} />
                      {finalRound
                        ? "스킵 · 결과 보기"
                        : stageEnd
                          ? "스킵 · 결과 보기"
                          : "스킵 · 다음 라운드"}
                    </button>
                  ) : phase === "cleared" ? (
                    <button onClick={advance}>
                      {stageEnd ? "다음 스테이지" : "다음 라운드"}
                    </button>
                  ) : (
                    <button onClick={reset}>
                      <RotateCcw size={16} /> 다시 시작
                    </button>
                  )}
                </div>
              </div>
            </section>
            <aside
              className="detail-side"
              inert={stageCleared || !!legendary.active}
            >
              <div className="panel-kicker">UNIT INTELLIGENCE</div>
              <h3>전장 정보</h3>
              {selDef ? (
                <>
                  <div className="selected-top">
                    <Portrait u={selDef} size="large" />
                    <div>
                      <span>
                        {"★".repeat(selDef.tier)} · {selDef.role}
                      </span>
                      <h2>{selDef.name}</h2>
                    </div>
                  </div>
                  <p className="selected-skill">
                    {selDef.skill}
                    <br />
                    <strong>{roleDescription(selDef)}</strong>
                    {selDef.tier === 5 && (
                      <span className="hero-extra-skill">
                        {heroSkillDescription(selDef.name)}
                      </span>
                    )}
                  </p>
                  <div className="selected-stats">
                    <span>
                      공격력{" "}
                      <b>
                        {Number(
                          upgradedAttack(
                            selDef,
                            upgrades,
                            researchAttackPercent(selDef, player.research),
                          ).toFixed(1),
                        )}
                      </b>
                    </span>
                    <span>
                      사거리 <b>{selDef.range}</b>
                    </span>
                    <span>
                      공격 속도{" "}
                      <b>
                        {sel
                          ? attackRate(sel, roster, player.research).toFixed(2)
                          : (selDef.rate *
                              (1 + researchSpeedPercent(player.research, selDef) / 100)
                            ).toFixed(2)}
                      </b>
                    </span>
                  </div>
                  <button
                    className="side-sell"
                    onClick={sell}
                    disabled={salePrice(selDef) === null}
                  >
                    <ShoppingBag size={16} />{" "}
                    {salePrice(selDef) === null
                      ? "최상위 유닛 · 판매 불가"
                      : `판매 · +${salePrice(selDef)} 골드`}
                  </button>
                </>
              ) : (
                <div className="detail-placeholder">
                  <span>✦</span>유닛을 클릭하면 초상화와
                  <br />
                  스탯·스킬이 표시됩니다.
                </div>
              )}
              <div className="side-help">
                <BookOpen size={18} />
                <div>
                  <b>조합 가능한 영웅 {available.length}명</b>
                  <span>책을 열어 영웅의 계보를 확인하세요.</span>
                </div>
              </div>
              <button
                className="side-book"
                onClick={() => {
                  setTier(2);
                  setOverlay("book");
                }}
              >
                <BookOpen size={19} /> 조합서 열기
              </button>
            </aside>
          </main>
          <footer
            className="game-actions"
            inert={stageCleared || !!legendary.active || gambleOpen || questOpen}
          >
            <button
              className="action-summon"
              onClick={summon}
              disabled={
                troopCards < RECRUIT_TROOP_COST ||
                phase === "lost" ||
                phase === "won"
              }
            >
              <Ticket size={23} />
              <span>
                <b>병력 모집</b>
                <small>랜덤 1단계</small>
              </span>
            </button>
            <button
              className="action-book"
              onClick={() => {
                setTier(2);
                setOverlay("book");
              }}
            >
              <BookOpen size={24} />
              <span>
                <b>조합서</b>
                <small>{available.length}개 조합 가능</small>
              </span>
            </button>
            <button
              className="action-upgrade"
              onClick={() => {
                setSelected(null);
                setOverlay(null);
                setUpgradeOpen(true);
              }}
              disabled={phase === "lost" || phase === "won"}
            >
              <Sparkles size={22} />
              <span>
                <b>강화</b>
                <small>공격력 증가</small>
              </span>
            </button>
            <button
              className="action-gamble"
              onClick={() => {
                setSelected(null);
                setOverlay(null);
                setUpgradeOpen(false);
                setGambleOpen(true);
              }}
              disabled={phase === "lost" || phase === "won"}
            >
              <Dices size={22} />
              <span>
                <b>도박</b>
                <small>골드·유닛 획득</small>
              </span>
            </button>
          </footer>
        </>
      )}
      {overlay === "book" && (
        <div
          className={`overlay-shade ${home ? "" : "battle-bottom-sheet"}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOverlay(null);
          }}
        >
          <section
            className="book-modal"
            role="dialog"
            aria-modal="true"
            aria-label="조합서"
          >
            <header>
              <div>
                <BookOpen size={24} />
                <span>
                  <small>THE HERO ARCHIVE</small>
                  <b>영웅 조합서</b>
                </span>
              </div>
              <button onClick={() => setOverlay(null)} aria-label="조합서 닫기">
                <X size={21} />
              </button>
            </header>
            <div className="book-tabs">
              {COMBINATION_TIERS.map((n) => (
                <button
                  key={n}
                  className={tier === n ? "active" : ""}
                  onClick={() => setTier(n)}
                >
                  Lv {n}{" "}
                  <span>
                    {home
                      ? `${recipeCatalog.filter((u) => u.tier === n).length}명`
                      : `${recipes.filter((u) => u.tier === n && available.includes(u)).length}/${recipeCatalog.filter((u) => u.tier === n).length}`}
                  </span>
                </button>
              ))}
            </div>
            <div className="book-grid">
              {recipeCatalog
                .filter((u) => u.tier === tier)
                .map((u) => {
                  const locked = isLockedUnit(u),
                    hardBanned =
                      !home &&
                      difficulty === "hard" &&
                      bannedHeroes.includes(u.name),
                    have = inventoryRecipeStatus(
                      u.recipe!,
                      home ? [] : roster,
                      home ? {} : bag,
                    ),
                    ready =
                      !locked &&
                      !home &&
                      !hardBanned &&
                      have.every(Boolean),
                    activate = () => {
                      if (ready && phase !== "lost" && phase !== "won")
                        merge(u);
                    };
                  return (
                    <article
                      key={`${u.tier}-${u.name}`}
                      className={`book-card ${ready ? "ready" : ""} ${locked ? "locked" : ""} ${hardBanned ? "hard-banned" : ""}`}
                      role="button"
                      aria-disabled={
                        locked || !ready || phase === "lost" || phase === "won"
                      }
                      aria-label={`${u.name} ${locked ? "이미지 준비 중" : hardBanned ? "이번 하드 전투 조합 금지" : ready ? "조합 가능" : `재료 ${have.filter(Boolean).length}/${have.length}`}`}
                      tabIndex={ready ? 0 : -1}
                      onClick={activate}
                      onKeyDown={(e) => {
                        if (
                          e.target === e.currentTarget &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          activate();
                        }
                      }}
                    >
                      <div className="book-card-art" aria-hidden="true">
                        {locked ? (
                          <span className="book-locked-art">
                            <Lock size={28} />
                            <small>이미지 준비 중</small>
                          </span>
                        ) : (
                          <Portrait u={u} size="normal" />
                        )}
                      </div>
                      {hardBanned && (
                        <span
                          className="book-hard-lock"
                          role="img"
                          aria-label="이번 하드 전투 조합 금지"
                        >
                          <Lock size={34} strokeWidth={2.8} />
                        </span>
                      )}
                      <div className="book-card-head">
                        <div>
                          <small>
                            {"★".repeat(tier)} · {u.role}
                          </small>
                          <h3>{u.name}</h3>
                        </div>
                      </div>
                      <div className="book-ingredients">
                        {u.recipe!.map((name, i) => (
                          <span
                            key={i}
                            className={!locked && have[i] ? "have" : ""}
                          >
                            {!locked && have[i] ? "✓" : "·"} {name}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </div>
      )}
      {overlay === "help" && (
        <div
          className={`overlay-shade ${home ? "" : "battle-bottom-sheet"}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOverlay(null);
          }}
        >
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-label="게임 방법"
          >
            <button
              className="help-close"
              onClick={() => setOverlay(null)}
              aria-label="닫기"
            >
              <X size={21} />
            </button>
            <small>HOW TO PLAY</small>
            <h2>한국사 조합 디펜스</h2>
            <div>
              <b>01 · 병력 모집</b>
              <p>
                병력패 1개로 시민을 제외한 1단계 병종 한 명을 모집합니다. 전투
                시작 시 무작위 2단계 영웅 한 명이 합류하며 병력패{" "}
                {START_TROOP_CARDS}개로 시작합니다.
              </p>
              <b>02 · 조합</b>
              <p>
                책 모양 조합서를 열고 재료가 모인 영웅을 조합합니다. 시민은 중간
                보스 보상으로만 얻으며, 필요한 모든 1단계 재료를 대신할 수
                있습니다.
              </p>
              <b>03 · 방어</b>
              <p>
                라운드가 시작될 때마다 병력패 {ROUND_TROOP_CARDS}개를 받고, 중간
                보스 처치 시 병력패 {BOSS_TROOP_CARDS}개와 구간별 무작위
                영웅·시민을 획득합니다. 스테이지 마지막 보스는 처치 보상을
                지급하지 않습니다. 각 라운드는 30초입니다.
              </p>
              <b>04 · 도박</b>
              <p>
                골드 도박으로 무작위 골드를 얻거나 유닛 도박으로 1~3단계 유닛을
                획득합니다. 시민은 도박에서 나오지 않습니다.
              </p>
              <b>음악 출처</b>
              <p>
                Music provided by 작곡하는김의홍 · Track: 決着 (Haru Studios)
                <br />
                <a
                  href="https://www.youtube.com/watch?v=T5Xxo7dfN1I"
                  target="_blank"
                  rel="noreferrer"
                >
                  원곡 듣기
                </a>{" "}
                ·{" "}
                <a
                  href="https://haru-studios.itch.io/ketchaku"
                  target="_blank"
                  rel="noreferrer"
                >
                  공식 음원 페이지
                </a>
              </p>
            </div>
            <button className="help-done" onClick={() => setOverlay(null)}>
              {home ? "초기 화면으로 돌아가기" : "전장으로 돌아가기"}
            </button>
          </section>
        </div>
      )}
      {!home && stageCleared && (
        <StageClearPopup
          chapter={chapter}
          stage={stage}
          rounds={totalRounds}
          profileReward={profileReward}
          onMap={() => {
            setProfileReward(null);
            openStageSelection();
          }}
          onHome={() => {
            setProfileReward(null);
            openStorySelection();
          }}
        />
      )}
      {!home && showStoryEpilogue && (
        <StoryEpilogue
          chapter={chapter}
          nickname={player.nickname}
          profileReward={profileReward}
          onComplete={() => {
            setProfileReward(null);
            returnHome();
            setStoryOpen(false);
            setBooksOpen(false);
          }}
        />
      )}
      {!home &&
        (phase === "lost" || (phase === "won" && !showStoryEpilogue)) && (
          <div
            className={`overlay-shade result-shade ${phase === "won" ? "victory-layout" : ""}`}
          >
            {phase === "won" && bossDialogue && (
              <aside
                className="victory-dialogue"
                role="status"
                aria-live="polite"
              >
                <strong>{bossDialogue.speaker}</strong>
                <p>“{bossDialogue.text}”</p>
              </aside>
            )}
            <section
              className={`result-modal ${phase}`}
              role="dialog"
              aria-modal="true"
              aria-label={phase === "lost" ? "패배 결과" : "클리어 결과"}
            >
              <div className="result-emblem">
                {phase === "lost" ? "✖" : "✦"}
              </div>
              <small>
                {phase === "lost" ? "DEFENSE FAILED" : "STORY VICTORY"}
              </small>
              <h2>
                {phase === "lost" ? "패배했습니다" : `${campaign.title} 승리!`}
              </h2>
              <p>
                {phase === "lost"
                  ? expiredBoss(enemies)
                    ? `${expiredBoss(enemies)!.name}을(를) 90초 안에 처치하지 못했습니다.`
                    : "전장에 적군이 100명 누적되었습니다. 병사를 조합하고 강화하여 다시 도전하세요."
                  : campaign.victory}
              </p>
              <button onClick={reset}>
                {phase === "won" ? "처음부터 다시 플레이" : "다시 도전"}
              </button>
              <button className="result-home" onClick={openStageSelection}>
                스테이지 선택
              </button>
              <button className="result-home" onClick={openStorySelection}>
                이야기 선택
              </button>
            </section>
          </div>
        )}
      {!home && selDef && (
        <div className="mobile-unit-info">
          <button
            className="mobile-unit-close"
            onClick={() => setSelected(null)}
            aria-label="유닛 정보 닫기"
          >
            <X size={15} />
          </button>
          <div className="mobile-unit-head">
            <Portrait u={selDef} size="normal" />
            <div>
              <b>{selDef.name}</b>
              <span>
                {"★".repeat(selDef.tier)} · {selDef.role}
              </span>
            </div>
          </div>
          <p>
            {selDef.skill}
            <br />
            <strong>{roleDescription(selDef)}</strong>
            {selDef.tier === 5 && (
              <span className="hero-extra-skill">
                {heroSkillDescription(selDef.name)}
              </span>
            )}
          </p>
          <div className="mobile-unit-bottom">
            <span>
              공격 {Number(upgradedAttack(selDef, upgrades, researchAttackPercent(selDef, player.research)).toFixed(1))} ·
              사거리 {selDef.range} · 속도{" "}
              {sel ? attackRate(sel, roster, player.research).toFixed(2) : (selDef.rate*(1+researchSpeedPercent(player.research,selDef)/100)).toFixed(2)}
            </span>
            <button onClick={sell} disabled={salePrice(selDef) === null}>
              {salePrice(selDef) === null
                ? "최상위 · 판매 불가"
                : `판매 +${salePrice(selDef)}G`}
            </button>
          </div>
        </div>
      )}
      {!home && mergeSuccess && (
        <div
          key={mergeSuccess.id}
          className="merge-success"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Portrait u={mergeSuccess.unit} size="normal" />
          <div>
            <strong>✓ 조합 성공!</strong>
            <span>
              {mergeSuccess.unit.tier}단계 · {mergeSuccess.unit.name}
            </span>
          </div>
          <button
            onClick={() => setMergeSuccess(null)}
            aria-label="조합 완료 알림 닫기"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {!home && unitReward && (
        <div
          key={unitReward.id}
          className="merge-success unit-reward-alert"
          role="status"
          aria-live="assertive"
          aria-atomic="true"
        >
          <Portrait u={unitReward.unit} size="normal" />
          <div>
            <strong>✦ {unitReward.source}</strong>
            <span>
              {unitReward.unit.tier}단계 · {unitReward.unit.name}
              {unitReward.quantity && unitReward.quantity > 1
                ? ` ×${unitReward.quantity}`
                : ""}{" "}
              획득!
            </span>
            <small>
              {unitReward.stored
                ? "가방에 보관되었습니다."
                : "전장에 배치되었습니다."}
              {unitReward.bonus && (
                <>
                  <br />
                  {unitReward.bonus}
                </>
              )}
            </small>
          </div>
          <button
            onClick={() => setUnitReward(null)}
            aria-label="유닛 획득 알림 닫기"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {!home && gambleResult && (
        <div
          key={gambleResult.id}
          className={`merge-success gamble-result-alert ${gambleResult.outcome}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <Dices size={34} />
          <div>
            <strong>{gambleResult.title}</strong>
            <span>{gambleResult.detail}</span>
          </div>
          <button
            onClick={() => setGambleResult(null)}
            aria-label="도박 결과 알림 닫기"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {confirmNew && (
        <NewGameConfirm
          onConfirm={() => prepareStage(pendingStage, pendingDifficulty)}
          onCancel={() => setConfirmNew(false)}
        />
      )}
      {legendary.active?.mode === "codex" && (
        <HeroCodex
          selectedName={codexName}
          onSelect={openCodex}
          profile={player}
          onDraw={drawRecord}
          drawResult={recordResult}
          onClose={legendary.close}
        />
      )}
    </div>
  );
}
