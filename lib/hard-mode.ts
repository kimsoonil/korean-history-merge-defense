import {units} from './game.ts';
export const HARD_PROGRESS_KEY='salsu-hard-campaign-v1';
export function drawBannedHeroes(random:()=>number=Math.random){
 const pool=units.filter(u=>u.tier===5&&u.name!=='을지문덕').map(u=>u.name);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,3);
}
export function validBannedHeroes(value:unknown):value is string[]{
 return Array.isArray(value)&&value.length===3&&new Set(value).size===3&&value.every(n=>typeof n==='string'&&n!=='을지문덕'&&units.some(u=>u.name===n&&u.tier===5));
}
