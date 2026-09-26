import type {Enemy} from './game.ts';
export const BOSS_SECONDS=90;
export function tickBossTimers(enemies:Enemy[],seconds:number){
 return enemies.map(e=>e.boss?{...e,bossSeconds:Math.max(0,(e.bossSeconds??BOSS_SECONDS)-Math.max(0,seconds))}:e);
}
export function expiredBoss(enemies:Enemy[]){return enemies.find(e=>e.boss&&e.hp>0&&(e.bossSeconds??BOSS_SECONDS)<=0);}
