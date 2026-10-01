import LoadingImage,{LoadingBackground,useImageStatus,ImageLoadingIndicator} from './LoadingImage';
import {findLegendaryScene} from '@/lib/legendary';
import {HERO_SKILLS} from '@/lib/hero-skills';
import {byName} from '@/lib/game';
import {TIER_SEVEN_ULTIMATES} from '@/lib/upper-tier-skills';

export type SkillFlash={names:string[];serial:number;expiresAt:number};
export default function HeroSkillFlash({flash}:{flash:SkillFlash}){
 const names=[...new Set(flash.names)],scene=findLegendaryScene(names[0]);
 const tierSeven=names.some(name=>byName[name]?.tier===7),skills=names.map(name=>tierSeven?TIER_SEVEN_ULTIMATES[name]:HERO_SKILLS[name]).filter(Boolean);
 if(!skills.length)return null;
 return <div className={`hero-skill-flash ${tierSeven?'tier-seven-ultimate':''}`} style={tierSeven?{'--ultimate-accent':TIER_SEVEN_ULTIMATES[names[0]]?.accent} as React.CSSProperties:undefined} aria-hidden="true">
  {scene?<LoadingImage src={`/cinematics/${scene.slug}.png`} alt=""/>:<div className="ultimate-fallback"/>}
  <div className="hero-skill-caption"><b>{skills.map(skill=>skill.title).join(' · ')}</b><span>{names.join(' · ')} · {tierSeven?'7단계 궁극기':'전장 전체 공격'}</span></div>
 </div>;
}
