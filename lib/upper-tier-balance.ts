import type {UnitDef} from './game.ts';
import {roleStats} from './combat.ts';
import {TIER_SEVEN_ULTIMATES} from './upper-tier-skills.ts';

export const NORYANG_HARD_FINAL={hp:150000,armor:400,limitSeconds:90};

const reducesArmor=(unit:UnitDef)=>['책략','수군','수성'].includes(unit.role)||unit.tier===7&&['군주','기동'].includes(unit.role);

/** Expected stationary single-target DPS with every listed aura in range. */
export function estimatedBossDps(unit:UnitDef,team:UnitDef[],armor=NORYANG_HARD_FINAL.armor){
 const reduction=team.filter(reducesArmor).reduce((sum,ally)=>sum+roleStats(ally.tier).armorReduction,0);
 const defenseFactor=100/(100+Math.max(0,armor-reduction));
 const support=team.filter(ally=>ally!==unit&&ally.role==='지원').reduce((sum,ally)=>sum+roleStats(ally.tier).support,0);
 const stats=roleStats(unit.tier),roleDamage=(['전열','화포'].includes(unit.role)?1+stats.damage:1)*(unit.role==='군주'?1+stats.boss:1);
 const rate=unit.rate*(1+(unit.role==='기동'?stats.mobility:0)+team.filter(ally=>ally!==unit&&ally.role==='기동').reduce((sum,ally)=>sum+roleStats(ally.tier).mobilityAura,0));
 const basic=unit.damage*(1+support)*roleDamage*defenseFactor*rate;
 const ultimate=unit.tier===7?TIER_SEVEN_ULTIMATES[unit.name]:undefined;
 const ultimateAverage=ultimate?unit.damage*(1+support)*roleDamage*(ultimate.ignoreArmor?1:defenseFactor)*ultimate.multiplier*(ultimate.bossMultiplier??1)/10:0;
 return basic+ultimateAverage;
}

export function estimateNoryangHardFinal(team:UnitDef[]){
 const dps=team.reduce((sum,unit)=>sum+estimatedBossDps(unit,team),0);
 return {dps,timeToKill:dps>0?NORYANG_HARD_FINAL.hp/dps:Infinity,passes:dps*NORYANG_HARD_FINAL.limitSeconds>=NORYANG_HARD_FINAL.hp};
}

