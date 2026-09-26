import type {Soldier} from './game.ts';
export type HeroBuffs={attack:number;speed:number;boss:number;armor:number;wounded:number};
export const emptyHeroBuffs=():HeroBuffs=>({attack:0,speed:0,boss:0,armor:0,wounded:0});
// A skill resets its saved ten-second cooldown: the first five seconds are active.
export function activeHeroBuffs(roster:Soldier[],timers:Map<number,number>){
 const buffs=emptyHeroBuffs();
 for(const hero of roster){
  const remaining=timers.get(hero.id)??0;
  if(remaining<=5||remaining>10)continue;
  if(hero.name==='이순신')buffs.boss+=.4;
  if(hero.name==='세종대왕')buffs.attack+=.3;
  if(hero.name==='을지문덕')buffs.armor+=60;
  if(hero.name==='이성계')buffs.wounded+=.5;
  if(hero.name==='정조')buffs.speed+=.4;
 }
 return buffs;
}
export function buffDamageMultiplier(buffs:HeroBuffs,enemy:{boss:boolean;hp:number;maxHp:number}){
 return (1+buffs.attack)*(1+(enemy.boss?buffs.boss:0))*(1+(enemy.hp<=enemy.maxHp*.5?buffs.wounded:0));
}
