import {findLegendaryScene} from '@/lib/legendary';
import {HERO_SKILLS} from '@/lib/hero-skills';

export type SkillFlash={names:string[];serial:number;expiresAt:number};
export default function HeroSkillFlash({flash}:{flash:SkillFlash}){
 const names=[...new Set(flash.names)],scene=findLegendaryScene(names[0]);
 if(!scene)return null;
 return <div className="hero-skill-flash" aria-hidden="true">
  <img src={`/cinematics/${scene.slug}.png`} alt=""/>
  <div className="hero-skill-caption"><b>{names.map(name=>HERO_SKILLS[name].title).join(' · ')}</b><span>{names.join(' · ')} · 전장 전체 공격</span></div>
 </div>;
}
