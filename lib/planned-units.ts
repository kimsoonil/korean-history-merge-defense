import {units,type UnitDef} from './game.ts';

// Compatibility export for balance/tests written while tiers 6–7 were staged. The artwork
// and recipes are now live in the main registry, so these are no longer locked placeholders.
export type LockedUnitDef=UnitDef&{locked?:false};
export const plannedUpperTierUnits=units.filter(unit=>unit.tier>=6);
export const isLockedUnit=(_unit:UnitDef|LockedUnitDef):_unit is never=>false;
