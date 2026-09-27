'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Lock} from 'lucide-react';
import LoadingImage from './LoadingImage';
import {storyChapters} from '@/lib/story-chapters';
export default function StoryBooks({onBack,onSelect}:{onBack:()=>void;onSelect:(chapter:1|2)=>void}){
 const [page,setPage]=useState(0),[direction,setDirection]=useState('forward');
 const chapter=storyChapters[page];
 const turn=(step:number)=>{const next=page+step;if(next<0||next>=storyChapters.length)return;setDirection(step>0?'forward':'backward');setPage(next);};
 return <main className="story-library open-library">
  <header><button onClick={onBack} aria-label="홈으로"><ArrowLeft size={22}/></button><div><small>천명도첩</small><h1>이야기 선택</h1></div><BookOpen size={28}/></header>
  <div className="open-book-stage" onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turn(event.key==='ArrowRight'?1:-1);}}}>
   <button className="book-turn previous" onClick={()=>turn(-1)} disabled={page===0} aria-label="이전 장"><ArrowLeft size={26}/></button>
   <section className="open-story-book" aria-label="펼쳐진 이야기 책">
    <div key={page} className={`book-spread ${direction}`}>
     <div className="story-leaf illustrated-leaf"><span className="leaf-heading">역사의 기록</span><div className="leaf-art"><LoadingImage src={chapter.image} alt={chapter.title+' 이야기 삽화'}/></div><span className="leaf-caption">{chapter.year}</span><small className="leaf-number">{page*2+1}</small></div>
     <div className="story-leaf chapter-leaf"><small>제 {String(chapter.id).padStart(2,'0')} 장</small><span className="chapter-ornament" aria-hidden="true">✦</span><h2>{chapter.title}</h2><p>{chapter.year}</p><div className="chapter-rule" aria-hidden="true"/><button className="chapter-start" disabled={!chapter.available} onClick={()=>onSelect(chapter.id as 1|2)}>{chapter.available?<><BookOpen size={19}/><span>이야기 시작</span></>:<><Lock size={19}/><span>준비 중</span></>}</button><small className="leaf-number">{page*2+2}</small></div>
    </div>
    <div className="book-center-fold" aria-hidden="true"/>
   </section>
   <button className="book-turn next" onClick={()=>turn(1)} disabled={page===storyChapters.length-1} aria-label="다음 장"><ArrowRight size={26}/></button>
  </div>
  <p className="book-page-status" role="status" aria-live="polite">{page+1} / {storyChapters.length} · {chapter.title}</p>
 </main>;
}
