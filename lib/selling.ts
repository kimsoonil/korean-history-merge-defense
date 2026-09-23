import {units,type UnitDef} from './game.ts';

const highestTier=Math.max(...units.map(unit=>unit.tier));
const prices:Record<number,number>={1:35,2:100,3:300,4:900};
// Unknown tiers are also protected until their sale price is explicitly configured.
export function salePrice(unit:UnitDef|null|undefined):number|null{
 return !unit||unit.tier>=highestTier?null:prices[unit.tier]??null;
}
