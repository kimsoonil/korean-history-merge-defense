import {unitPosition,attackRadius} from '@/lib/combat';
import type {Soldier,UnitDef} from '@/lib/game';

export default function AttackRange({soldier,unit}:{soldier:Soldier;unit:UnitDef}){
 const center=unitPosition(soldier.slot);
 return <svg className="unit-attack-range" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${unit.name} 공격 범위 · 사거리 ${unit.range}`}>
  <circle cx={center.x} cy={center.y} r={attackRadius(unit)} vectorEffect="non-scaling-stroke"/>
 </svg>;
}
