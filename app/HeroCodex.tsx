'use client';
import LoadingImage,{LoadingBackground} from './LoadingImage';
import {useEffect,useRef,useState} from 'react';
import {Images,Ticket,X} from 'lucide-react';
import {byName,units,type UnitDef} from '@/lib/game';
import {findLegendaryScene} from '@/lib/legendary';
import {storyCampaigns} from '@/lib/story-campaigns';
import LegendaryReveal from './LegendaryReveal';
import type {PlayerProfile} from '@/lib/player';
import {MAX_RECORD_STARS,shardsForNextStar} from '@/lib/hero-records';
import {heroCodexStories} from './hero-codex-stories';
import {atlasCellImageStyle} from '@/lib/portrait-crop';

type Props={selectedName:string;onSelect:(name:string)=>void;onClose:()=>void;profile:PlayerProfile|null;onDraw:()=>void;drawResult:string};
const tiers=[1,2,3,4,5,6,7] as const;
const recruitStories:Record<string,string>={
 창병:'기본 중의 기본인 보병. 언젠가 왜군에 맞섰던 한명련처럼 긴 창을 앞세워 전열을 지킬 잠재력을 품고 있습니다.',
 활병:'시위는 당길 줄 아는 애송이 사수. 고구려의 기상을 이어받아 주몽처럼 백발백중의 명궁이 될 날을 기다립니다.',
 수병:'아직은 노 젓는 일이 더 익숙한 훈련병. 거친 바다에서 살아남는다면 이순신 장군의 든든한 동료가 될지도 모릅니다.',
 포수:'화약 냄새에도 움찔하는 신참 포수. 언젠가 최무선처럼 화포로 전장의 흐름을 바꿀 한 발을 준비합니다.',
 의병:'삽과 낫을 내려놓고 나라를 지키러 나선 평범한 사람. 곽재우의 의병들처럼 위기의 순간 가장 먼저 일어섭니다.',
 기병:'아직은 말과 호흡을 맞추는 데 바쁜 젊은 기수. 신숭겸처럼 적진을 가르는 날카로운 돌격을 꿈꿉니다.',
 유생:'책장을 넘기던 손으로 병법을 펼친 풋내기. 서희처럼 한마디 말과 치밀한 계책으로 전장을 바꿀 수 있습니다.',
};
const knownActivity:Record<string,string>={
 근초고왕:'백제의 북방 진출과 평양성 전투',광개토대왕:'관미성 공략·신라 구원·동부여 원정',을지문덕:'612년 수나라 침공과 살수대첩',양만춘:'안시성 방어전의 성주로 전해지는 인물',김유신:'황산벌 전투와 신라의 삼국 통일 전쟁',대조영:'천문령 전투와 발해 건국',강감찬:'1019년 귀주대첩',김윤후:'1232년 처인성 전투',이순신:'한산도·명량 등 임진왜란 해전',김시민:'1592년 진주성 전투',권율:'1593년 행주대첩',서희:'거란과의 담판·강동 6주 확보',최무선:'고려 말 진포대첩에서 화포 운용',곽재우:'임진왜란 당시 의병 활동',장보고:'청해진 설치와 해상 교역',이성계:'황산대첩과 고려 말 왜구 격퇴',척준경:'고려의 여진 정벌',윤관:'별무반을 이끌고 여진 정벌',세종대왕:'훈민정음 창제와 조선의 국정 운영',허준:'임진왜란 중 왕실 의료와 『동의보감』 편찬',정약용:'수원 화성 축성과 조선 후기 실학',정조:'수원 화성 건설과 조선 후기 개혁',황희:'조선 전기 국정 운영과 북방 방비 정책',문무왕:'삼국 통일과 나당전쟁',연개소문:'고구려의 대당 항전',계백:'660년 황산벌 전투',온달:'고구려 장군으로 전해지는 인물',왕건:'후삼국 통일 전쟁',견훤:'후백제 건국과 후삼국 전쟁',김춘추:'백제·고구려와의 외교 및 신라 통일 과정',주몽:'고구려 건국 설화',선덕여왕:'신라의 국정 운영과 대외 방어',신숭겸:'고려 후삼국 전쟁',최영:'고려 말 홍산대첩과 왜구 격퇴',김종서:'조선 북방 6진 개척',사명대사:'임진왜란 의승군 활동',박혁거세:'신라 건국 설화',김수로왕:'가야 건국 설화',진흥왕:'신라 영토 확장',장수왕:'고구려의 평양 천도와 남진',정몽주:'고려 말 외교와 정치',정도전:'조선 건국과 제도 설계','태종 이방원':'조선 초기 왕권 강화',성왕:'백제의 사비 천도와 관산성 전투',근구수:'백제의 고구려 공략',최치원:'통일 신라의 문장가·개혁론자',
};

function UnitPortrait({unit,className}:{unit:UnitDef;className:string}){
 const sprite=unit.atlas;
 return <span className={`${className} ${sprite?'':'standalone'}`} aria-hidden="true">{sprite?<LoadingImage src={sprite.src} alt="" style={atlasCellImageStyle(sprite.col,sprite.row,unit.name)}/>:<LoadingImage src={unit.portrait??''} alt=""/>}</span>;
}

export default function HeroCodex({selectedName,onSelect,onClose,profile,onDraw,drawResult}:Props){
 const rootRef=useRef<HTMLElement>(null),closeRef=useRef<HTMLButtonElement>(null);
 const selected=byName[selectedName]??units.find(unit=>unit.tier===7)!;
 const [tier,setTier]=useState<number>(selected.tier);
 useEffect(()=>setTier(selected.tier),[selected.tier]);
 const tierUnits=units.filter(unit=>unit.tier===tier&&unit.name!=='시민');
 const index=tierUnits.findIndex(unit=>unit.name===selected.name);
 const scene=findLegendaryScene(selected.name);
 const matchingStories=storyCampaigns.filter(campaign=>campaign.reinforcement.hero===selected.name||campaign.stages.some(stage=>stage.guide===selected.name));
 const relatedStory=matchingStories.map(campaign=>campaign.title).join(' · ');
 const record=profile?.heroRecords?.[selected.name]??{stars:0,shards:0};
 const tickets=profile?.recordTickets??0;
 const step=(direction:number)=>onSelect(tierUnits[(Math.max(0,index)+direction+tierUnits.length)%tierUnits.length].name);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  closeRef.current?.focus();
  return()=>{if(previous?.isConnected)previous.focus();else document.querySelector<HTMLButtonElement>('.hero-codex-open')?.focus();};
 },[]);
 return <div className="hero-codex-shade">
  <section ref={rootRef} className="hero-codex-modal" role="dialog" aria-modal="true" aria-labelledby="hero-codex-title" aria-describedby="hero-codex-description" onKeyDown={event=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
   if(event.key==='Tab'){const controls=Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button')??[]);const current=controls.indexOf(document.activeElement as HTMLButtonElement);event.preventDefault();controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}
  }}>
   <header className="hero-codex-header"><div><small><Images size={13}/> 1~7단계 영웅 기록</small><h2 id="hero-codex-title">영웅 도감</h2></div><button ref={closeRef} className="hero-codex-close close-icon-button" onClick={onClose} aria-label="영웅 도감 닫기"><X size={20}/></button></header>
   <nav className="hero-codex-tiers" aria-label="영웅 단계">{tiers.map(value=><button key={value} className={tier===value?'active':''} aria-pressed={tier===value} onClick={()=>{setTier(value);onSelect(units.find(unit=>unit.tier===value&&unit.name!=='시민')!.name);}}>Lv {value}</button>)}</nav>
   <p id="hero-codex-description">{selected.name} · {selected.role} · {selected.skill}</p>
   <div className="hero-codex-body">
    <nav className="hero-codex-heroes" aria-label="도감 영웅 선택">{tierUnits.map(unit=><button key={unit.name} onClick={()=>onSelect(unit.name)} className={unit.name===selected.name?'active':''} aria-label={`${unit.name} 기록 보기`} aria-pressed={unit.name===selected.name}><UnitPortrait unit={unit} className="hero-codex-portrait"/><b>{unit.name}</b><small>{unit.role}</small></button>)}</nav>
    <div className="hero-codex-canvas">{scene&&selected.tier===7?<div className="hero-codex-stage"><LoadingBackground className="codex-loading-ground" src="/terrain/forest-ground.png"/><LegendaryReveal key={scene.slug} scene={scene} preview embedded onClose={onClose}/></div>:<div className="hero-codex-character"><UnitPortrait unit={selected} className="hero-codex-large-portrait"/><strong>{selected.name}</strong><span>{selected.role} · Lv {selected.tier}</span></div>}</div>
   </div>
   <div className="hero-codex-history" aria-live="polite"><b>{selected.name}의 기록</b><span>{recruitStories[selected.name]??heroCodexStories[selected.name]??knownActivity[selected.name]??'대표적인 역사적 활동을 확인 중입니다.'}</span>{relatedStory&&<small>게임 속 관련 이야기 · {relatedStory}</small>}</div>
   <div className="hero-codex-growth"><div><b>기록 성급 <span aria-label={`${record.stars}성급`}>{'★'.repeat(record.stars)}{'☆'.repeat(MAX_RECORD_STARS-record.stars)}</span></b><small>{record.stars===MAX_RECORD_STARS?'최대 성급':`기록 ${record.shards} / ${shardsForNextStar(record.stars)} · 다음 별까지`}</small></div><button onClick={onDraw} disabled={tickets<1}><Ticket size={15}/>기록 뽑기 <b>{tickets}</b></button></div>
   {drawResult&&<p className="hero-codex-draw-result" role="status">{drawResult}</p>}
   <footer className="hero-codex-footer"><button onClick={()=>step(-1)} aria-label="이전 영웅">이전</button><span aria-live="polite"><b>{Math.max(0,index)+1} / {tierUnits.length} · {selected.name}</b><small>전투 단계 Lv {selected.tier}</small></span><button onClick={()=>step(1)} aria-label="다음 영웅">다음</button></footer>
  </section>
 </div>;
}
