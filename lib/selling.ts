import {type UnitDef} from './game.ts';
import {isFinalUnitTier} from './unit-tiers.ts';

const prices:Record<number,number>={1:35,2:100,3:300,4:900,5:2700,6:8100};
// Unknown tiers are also protected until their sale price is explicitly configured.
export function salePrice(unit:UnitDef|null|undefined):number|null{
 return !unit||isFinalUnitTier(unit.tier)?null:prices[unit.tier]??null;
}
