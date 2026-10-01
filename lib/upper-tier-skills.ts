import type {Enemy,UnitDef} from './game.ts';
import {hitDamageForUnit,roleStats} from './combat.ts';
import type {Upgrades} from './upgrades.ts';

export type TierSevenUltimate={
 title:string;
 description:string;
 multiplier:number;
 accent:string;
 bossMultiplier?:number;
 normalMultiplier?:number;
 ignoreArmor?:boolean;
 stunSeconds?:number;
 teamAttack?:number;
 teamSpeed?:number;
 teamBoss?:number;
 teamArmor?:number;
};

export const TIER_SEVEN_ULTIMATES:Record<string,TierSevenUltimate>={
 근초고왕:{title:'칠지도 왕도 제압',description:'전장 전체 500% · 보스 피해 50% 증가 · 5초간 아군 보스 피해 +50%',multiplier:5,bossMultiplier:1.5,teamBoss:.5,accent:'#e6c36a'},
 광개토대왕:{title:'영락의 대정복',description:'전장 전체 600% · 일반 적 피해 30% 증가 · 5초간 아군 공격속도 +25%',multiplier:6,normalMultiplier:1.3,teamSpeed:.25,accent:'#8f79d8'},
 을지문덕:{title:'살수 천류',description:'전장 전체 500% · 방어도 완전 무시 · 5초간 아군 방어도 관통 +140',multiplier:5,ignoreArmor:true,teamArmor:140,accent:'#58b9d0'},
 양만춘:{title:'안시성 낙석진',description:'전장 전체 450% · 모든 적 2초 스턴',multiplier:4.5,stunSeconds:2,accent:'#cb8c54'},
 김유신:{title:'화랑 천하일검',description:'전장 전체 700% · 5초간 아군 공격력 +25%',multiplier:7,teamAttack:.25,accent:'#df6058'},
 대조영:{title:'천문령 대돌격',description:'전장 전체 550% · 5초간 아군 공격속도 +35%',multiplier:5.5,teamSpeed:.35,accent:'#7eb06b'},
 강감찬:{title:'귀주대첩 역류',description:'전장 전체 500% · 모든 적 1초 스턴 · 5초간 아군 방어도 관통 +100',multiplier:5,stunSeconds:1,teamArmor:100,accent:'#658bc2'},
 이순신:{title:'필사즉생 총공세',description:'전장 전체 600% · 보스 피해 100% 증가 · 5초간 아군 보스 피해 +60%',multiplier:6,bossMultiplier:2,teamBoss:.6,accent:'#3e9eb8'},
};

export const upperTierSkillDescription=(unit:UnitDef)=>unit.tier===7&&TIER_SEVEN_ULTIMATES[unit.name]
 ?`10초마다 궁극기 · ${TIER_SEVEN_ULTIMATES[unit.name].title}: ${TIER_SEVEN_ULTIMATES[unit.name].description}`
 :unit.tier===6?`${unit.role} 완성형 · 역할 효과 ${roleStats(unit.tier).armorReduction} 기준 적용`:'';

export function tierSevenUltimateDamage(unit:UnitDef,enemy:Enemy,reduction:number,stage:number,upgrades?:Upgrades,support=0){
 const skill=unit.tier===7?TIER_SEVEN_ULTIMATES[unit.name]:undefined;
 if(!skill)return 0;
 const appliedReduction=skill.ignoreArmor?(enemy.armor??20):reduction;
 return hitDamageForUnit(unit,enemy,appliedReduction,stage,upgrades,support)*skill.multiplier
  *(enemy.boss?(skill.bossMultiplier??1):(skill.normalMultiplier??1));
}

