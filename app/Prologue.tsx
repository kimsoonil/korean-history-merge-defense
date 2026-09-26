'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,ArrowRight} from 'lucide-react';
import {nicknameError,normalizeNickname,spiritDialogue,type PlayerProfile} from '@/lib/player';
type Scene='name'|'rift'|'spirit'|'player'|'end';
export default function Prologue({profile,storageError,onCreate,onComplete,onClose}:{profile:PlayerProfile|null;storageError:boolean;onCreate:(name:string)=>void;onComplete:()=>void;onClose?:()=>void}){
 const [scene,setScene]=useState<Scene>(profile?'spirit':'name'),[name,setName]=useState(profile?.nickname??''),[error,setError]=useState('');
 const focusRef=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{focusRef.current?.focus();},[scene]);
 useEffect(()=>{
  if(scene!=='rift')return;
  const timer=window.setTimeout(()=>setScene('spirit'),1800);
  return()=>window.clearTimeout(timer);
 },[scene]);
 const create=(event:React.FormEvent)=>{
  event.preventDefault();const error=nicknameError(name);setError(error);if(error)return;
  const clean=normalizeNickname(name);setName(clean);onCreate(clean);setScene('rift');
 };
 return <main className={`prologue scene-${scene}`} aria-label="프롤로그: 봉인된 서책">
  <div className="prologue-aura" aria-hidden="true"/><div className="prologue-blackout" aria-hidden="true"/>
  <header><span>한국사 조합 디펜스</span><small>프롤로그 01 · 현대</small>{onClose&&<button onClick={onClose}>닫기</button>}</header>
  <section className="prologue-stage">
   <div className="prologue-relic" aria-hidden="true"><BookOpen strokeWidth={.8}/><span>封 印</span></div>
   <div className="prologue-copy" key={scene}>
    <p className="prologue-location">현대 · 국립중앙박물관</p>
    <h1 tabIndex={-1} ref={focusRef}>{scene==='name'?'서책에 이름을 새기다':scene==='rift'?'봉인이 깨어나다':scene==='end'?'빛 너머로': '사라져 가는 역사'}</h1>
    {scene==='name'?<>
     <p className="prologue-speaker">시스템 메시지</p>
     <p className="prologue-line">국립중앙박물관 깊은 곳, 오랜 시간 봉인되어 있던 고서가 빛을 발하기 시작합니다. 서책의 첫 장에 당신의 이름을 각인하십시오.</p>
     <form onSubmit={create} noValidate><label htmlFor="player-name">당신의 이름</label><div className="prologue-input"><input id="player-name" value={name} onChange={e=>{setName(e.target.value);setError('');}} maxLength={24} placeholder="홍길동" autoComplete="nickname" aria-describedby="nickname-hint nickname-error" aria-invalid={!!error}/><button type="submit">이름 각인 <ArrowRight size={18}/></button></div><small id="nickname-hint">한글·영문·숫자·밑줄 2~12자 · 이 브라우저에 저장됩니다.</small><p id="nickname-error" role="alert">{error}</p></form>
    </>:scene==='rift'?<><p className="prologue-speaker">쿠르릉! 구릉!</p><p className="prologue-line">서책의 빛이 번지며 시공간이 뒤틀립니다.</p><button className="prologue-next" onClick={()=>setScene('spirit')}>연출 건너뛰기</button></>:scene==='spirit'?<>
     <p className="prologue-speaker">의문의 목소리 · 책의 정령</p><p className="prologue-line">“{spiritDialogue(name)}”</p><button className="prologue-next" onClick={()=>setScene('player')}>다음 <ArrowRight size={18}/></button>
    </>:scene==='player'?<>
     <p className="prologue-speaker">플레이어 · {name}</p><p className="prologue-line">“으악, 이게 무슨 소리야?! 몸이... 몸이 빛 속으로 빨려 들어가고 있어!”</p><button className="prologue-next" onClick={()=>setScene('end')}>빛 속으로 <ArrowRight size={18}/></button>
    </>:<><p className="prologue-speaker">{name} · 천명을 이을 자</p><p className="prologue-line">당신의 이름이 서책에 새겨졌습니다.</p><p className="prologue-pending">서책이 가리키는 첫 전장으로 향합니다.</p><button className="prologue-next" onClick={onComplete}>요동성으로 <ArrowRight size={18}/></button></>}
    {storageError&&<p className="prologue-warning" role="status">프로필을 저장하지 못했습니다. 현재 창에서는 진행할 수 있지만 새로고침하면 사라질 수 있습니다.</p>}
   </div>
  </section>
  <footer>역사가 지워지기 시작한 밤, 당신의 이야기가 시작됩니다.</footer>
 </main>;
}
