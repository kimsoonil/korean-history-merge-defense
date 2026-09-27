import type {ChapterId} from './ansi';

// Dedicated overworld panoramas; never reuse square battlefield or portrait art.
export const regionMaps:Record<ChapterId,string>={
 1:'/terrain/campaign-panorama.png',
 2:'/regions/ansi.png',3:'/regions/hwangsan.png',4:'/regions/nadang.png',
 5:'/regions/gwiju.png',6:'/regions/cheoin.png',7:'/regions/hansando.png',
 8:'/regions/haengju.png',10:'/regions/noryang.png',
};
export const REGION_MAP_RATIO=3;
export const regionPins=[{x:14,y:52},{x:38,y:64},{x:64,y:46},{x:88,y:58}];
export function regionCanvasSize(height:number){return {width:Math.max(1,height)*REGION_MAP_RATIO,height:Math.max(1,height)};}
