import { progressKey, type ChapterId } from "./ansi.ts";
import { units } from "./game.ts";
export const HARD_PROGRESS_KEY = progressKey(3, true);
export const HARD_BAN_TIER = 7;
export const HARD_BAN_COUNT = 3;
const hardBanPool = (tier: number) =>
  units.filter((u) => u.tier === tier).map((u) => u.name);
export const HARD_PROTECTED_HEROES: Partial<Record<ChapterId, string>> = {
  1: "근초고왕",
  2: "광개토대왕",
  3: "을지문덕",
  4: "양만춘",
  5: "김유신",
  6: "김유신",
  7: "대조영",
  8: "강감찬",
  10: "이순신",
};
export const protectedHeroForChapter = (chapter: ChapterId) =>
  HARD_PROTECTED_HEROES[chapter];
const LEGACY_TIER_FIVE_BAN_POOL = [
  "이순신",
  "세종대왕",
  "광개토대왕",
  "을지문덕",
  "김유신",
  "이성계",
  "척준경",
  "정조",
];
export function drawBannedHeroes(
  random: () => number = Math.random,
  chapter: ChapterId = 1,
) {
  const protectedHero = protectedHeroForChapter(chapter);
  const pool = hardBanPool(HARD_BAN_TIER).filter(
    (name) => name !== protectedHero,
  );
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, HARD_BAN_COUNT);
}
export function validBannedHeroes(
  value: unknown,
  chapter: ChapterId = 1,
): value is string[] {
  if (
    !Array.isArray(value) ||
    value.length !== HARD_BAN_COUNT ||
    new Set(value).size !== HARD_BAN_COUNT
  )
    return false;
  const names = value.filter(
    (name): name is string => typeof name === "string",
  );
  if (names.length !== HARD_BAN_COUNT) return false;
  // Tier-five bans from existing version-six saves remain valid after the tier-seven migration.
  return (
    names.every((name) => hardBanPool(HARD_BAN_TIER).includes(name)) ||
    names.every((name) => LEGACY_TIER_FIVE_BAN_POOL.includes(name))
  );
}
export function resolveBannedHeroes(value: unknown, chapter: ChapterId = 1) {
  const protectedHero = protectedHeroForChapter(chapter);
  const eligible = hardBanPool(HARD_BAN_TIER).filter(
    (name) => name !== protectedHero,
  );
  const retained = Array.isArray(value)
    ? value.filter(
        (name, index): name is string =>
          typeof name === "string" &&
          eligible.includes(name) &&
          value.indexOf(name) === index,
      )
    : [];
  return [...retained, ...eligible.filter((name) => !retained.includes(name))].slice(
    0,
    HARD_BAN_COUNT,
  );
}
