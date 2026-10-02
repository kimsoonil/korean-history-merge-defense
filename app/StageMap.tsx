"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
  Check,
  X,
} from "lucide-react";
import { LoadingBackground } from "./LoadingImage";
import type { ChapterId } from "@/lib/ansi";
import { regionMaps, regionPins, regionCanvasSize } from "@/lib/region-maps";
import type { Difficulty } from "@/lib/enemy-stats";
import { stageRoundCount } from "@/lib/rounds";
import {
  frontsForChapter,
  isWaveUnlocked,
  horizontalWheelDelta,
} from "@/lib/campaign";
import { getStoryCampaign, getStoryStage } from "@/lib/story-campaigns";
function MapDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="stage-map-shade"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={rootRef}
        className="stage-map-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose();
          }
          if (event.key === "Tab") {
            const controls = Array.from(
              rootRef.current?.querySelectorAll<HTMLButtonElement>(
                "button:not(:disabled)",
              ) ?? [],
            );
            const index = controls.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            event.preventDefault();
            controls[
              (index + (event.shiftKey ? -1 : 1) + controls.length) %
                controls.length
            ]?.focus();
          }
        }}
      >
        {children}
      </section>
    </div>
  );
}

export default function StageMap({
  onBack,
  onStart,
  blocked,
  onModalChange,
  highestClearedWave,
  hardCleared,
  chapter = 1,
}: {
  onBack: () => void;
  onStart: (wave: number, difficulty: Difficulty) => void;
  blocked: boolean;
  onModalChange: (open: boolean) => void;
  highestClearedWave: number;
  hardCleared: number;
  chapter?: ChapterId;
}) {
  const campaign = getStoryCampaign(chapter),
    battleFronts = frontsForChapter(chapter),
    chapterOneBattles = Array.from({ length: campaign.stageCount }, (_, i) => ({
      wave: i + 1,
      code: `${chapter}-${i + 1}`,
      name: getStoryStage(chapter, i + 1).title,
    }));
  const [selected, setSelected] = useState<number | null>(null);
  const [hard, setHard] = useState(false);
  const hardUnlocked = highestClearedWave >= campaign.stageCount;
  const progress = hard ? hardCleared : highestClearedWave,
    canPlay = !hard || hardUnlocked;
  const view = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState(regionCanvasSize(500));
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const resize = () => setCanvas(regionCanvasSize(el.clientHeight));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (view.current) view.current.scrollLeft = 0;
  }, [chapter]);
  const close = () => {
    setSelected(null);
    onModalChange(false);
  };
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += horizontalWheelDelta(
        e.deltaX,
        e.deltaY,
        e.deltaMode,
        el.clientWidth,
      );
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  const front = selected === null ? null : battleFronts[selected];
  return (
    <main
      className={`stage-map-screen front-selection ${hard ? "hard-preview" : ""}`}
      inert={blocked}
    >
      <div className="front-selection-shell" inert={selected !== null}>
        <header className="region-heading">
          <button onClick={onBack} aria-label="초기 화면으로">
            <ChevronLeft size={22} />
          </button>
          <h1>{campaign.title} · 지역 선택</h1>
          <span>
            {progress} / {campaign.stageCount}
          </span>
        </header>
        <div className="region-mode" aria-label="난이도">
          <button
            className={!hard ? "active" : ""}
            aria-pressed={!hard}
            onClick={() => setHard(false)}
          >
            일반
          </button>
          <button
            className={hard ? "active" : ""}
            aria-pressed={hard}
            onClick={() => setHard(true)}
          >
            {hardUnlocked ? <LockOpen size={14} /> : <Lock size={14} />} 하드
          </button>
        </div>
        <div
          className="region-viewport"
          ref={view}
          tabIndex={0}
          aria-label="좌우로 스크롤하여 지역 선택"
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              e.currentTarget.scrollBy({
                left: e.key === "ArrowRight" ? 320 : -320,
                behavior: "smooth",
              });
            }
          }}
        >
          <div className="region-world" style={canvas}>
            <LoadingBackground
              className="region-world-art"
              src={regionMaps[chapter]}
            />
            <svg
              className="region-route"
              viewBox="0 0 1000 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M140 208 Q260 120 380 256 T640 184 Q760 300 880 232" />
            </svg>
            {battleFronts.map((f, i) => {
              const unlocked = canPlay && isWaveUnlocked(f.first, progress),
                complete = progress >= f.last;
              return (
                <button
                  key={f.id}
                  className={`region-pin ${unlocked ? "available" : "locked"} ${complete ? "complete" : ""}`}
                  style={{
                    left: `${regionPins[i].x}%`,
                    top: `${regionPins[i].y}%`,
                  }}
                  onClick={() => {
                    setSelected(i);
                    onModalChange(true);
                  }}
                  aria-label={f.name + " 스테이지 선택"}
                >
                  <span className="region-seal">
                    {complete ? (
                      <Check size={25} />
                    ) : unlocked ? (
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    ) : (
                      <Lock size={22} />
                    )}
                  </span>
                  <strong>{chapter === 10 ? f.name : i === 3 ? "최종전" : f.name}</strong>
                  <small>
                    {complete ? "클리어" : unlocked ? "도전 가능" : "잠김"}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
        <footer className="region-navigation">
          <button
            aria-label="지도 왼쪽으로 이동"
            onClick={() =>
              view.current?.scrollBy({ left: -420, behavior: "smooth" })
            }
          >
            <ChevronLeft size={19} />
          </button>
          <span>좌우로 이동하여 지역을 선택하세요</span>
          <button
            aria-label="지도 오른쪽으로 이동"
            onClick={() =>
              view.current?.scrollBy({ left: 420, behavior: "smooth" })
            }
          >
            <ChevronRight size={19} />
          </button>
        </footer>
      </div>
      {front && (
        <MapDialog title={front.name + " 스테이지 선택"} onClose={close}>
          <header className="map-dialog-header">
            <div>
              <small>
                {hard ? "하드 · 스테이지 선택" : "일반 · 스테이지 선택"}
              </small>
              <h2>{front.name}</h2>
            </div>
            <button onClick={close} aria-label="스테이지 선택 닫기">
              <X size={22} />
            </button>
          </header>
          <div className="map-battle-list">
            {chapterOneBattles
              .filter((b) => b.wave >= front.first && b.wave <= front.last)
              .map((b) => {
                const unlocked = canPlay && isWaveUnlocked(b.wave, progress);
                return (
                  <button
                    key={b.wave}
                    className={`map-battle-row ${b.wave <= progress ? "completed" : ""}`}
                    disabled={!unlocked}
                    onClick={() => onStart(b.wave, hard ? "hard" : "normal")}
                  >
                    <span className="map-battle-code">{b.code}</span>
                    <b>
                      {b.name}
                      <small className="battle-round-count">
                        1–{stageRoundCount(b.wave, hard ? 'hard' : 'normal')}라운드
                      </small>
                    </b>
                    <span className="map-battle-kind">
                      {!unlocked ? (
                        <>
                          <Lock size={14} /> 잠김
                        </>
                      ) : b.wave <= progress ? (
                        <>
                          <Check size={24} strokeWidth={4} aria-label="클리어" />
                        </>
                      ) : (
                        "도전"
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </MapDialog>
      )}
    </main>
  );
}
