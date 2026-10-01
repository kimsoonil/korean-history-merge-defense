export const MIN_UNIT_TIER=1 as const;
export const MAX_UNIT_TIER=7 as const;
export const FIRST_COMBINATION_TIER=2 as const;
export const FIRST_HERO_SKILL_TIER=5 as const;

export type UnitTier=1|2|3|4|5|6|7;

const tierRange=(from:number,to:number)=>Array.from({length:to-from+1},(_,index)=>from+index) as UnitTier[];

export const UNIT_TIERS=tierRange(MIN_UNIT_TIER,MAX_UNIT_TIER);
export const COMBINATION_TIERS=tierRange(FIRST_COMBINATION_TIER,MAX_UNIT_TIER);
export const STORABLE_UNIT_TIERS=tierRange(MIN_UNIT_TIER,MAX_UNIT_TIER-1);

export const isUnitTier=(value:unknown):value is UnitTier=>
 typeof value==='number'&&Number.isInteger(value)&&value>=MIN_UNIT_TIER&&value<=MAX_UNIT_TIER;
export const isFinalUnitTier=(tier:number)=>tier===MAX_UNIT_TIER;
export const isStorableUnitTier=(tier:number)=>isUnitTier(tier)&&tier<MAX_UNIT_TIER;
export const hasHeroSkillTier=(tier:number)=>isUnitTier(tier)&&tier>=FIRST_HERO_SKILL_TIER;
