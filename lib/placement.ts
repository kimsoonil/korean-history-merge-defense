import type {Soldier} from './game.ts';
/** Move to an empty cell or exchange occupied cells without replacing identities. */
export function moveOrSwap(roster:Soldier[],id:number,slot:number):Soldier[]{
 if(!Number.isInteger(slot)||slot<0||slot>=40)return roster;
 const moving=roster.find(s=>s.id===id),other=roster.find(s=>s.slot===slot);
 if(!moving||moving.slot===slot)return roster;
 return roster.map(s=>s.id===id?{...s,slot}:s.id===other?.id?{...s,slot:moving.slot}:s);
}
