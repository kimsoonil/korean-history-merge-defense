import type { ChapterId } from "./ansi";

// Dedicated overworld panoramas; never reuse square battlefield or portrait art.
export const regionMaps: Record<ChapterId, string> = {
  1: "/regions/pyongyang-v2.jpg",
  2: "/regions/goguryeo-conquests-v2.jpg",
  3: "/terrain/campaign-panorama.png",
  4: "/regions/ansi.jpg",
  5: "/regions/hwangsan.jpg",
  6: "/regions/nadang.jpg",
  7: "/regions/cheonmunryeong-v2.jpg",
  8: "/regions/goryeo-khitan-v2.jpg",
  9: "/regions/cheoin.jpg",
  10: "/regions/imjin-four-victories-v3.jpg",
};
export const REGION_MAP_RATIO = 3;
export const regionPins = [
  { x: 14, y: 52 },
  { x: 38, y: 64 },
  { x: 64, y: 46 },
  { x: 88, y: 58 },
];
export function regionCanvasSize(height: number) {
  return {
    width: Math.max(1, height) * REGION_MAP_RATIO,
    height: Math.max(1, height),
  };
}
