'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,SkipForward} from 'lucide-react';
import {nicknameError,normalizeNickname,spiritDialogue,type PlayerProfile} from '@/lib/player';
import {LoadingBackground} from './LoadingImage';
type Scene='museum'|'name'|'rift'|'spirit'|'player'|'end';
export default function Prologue({profile,storageError,onCreate,onComplete,onClose}:{profile:PlayerProfile|null;storageError:boolean;onCreate:(name:string)=>void;onComplete:()=>void;onClose?:()=>void}){
 const [scene,setScene]=useState<Scene>('museum'),[name,setName]=useState(profile?.nickname??''),[error,setError]=useState('');
 const focusRef=useRef<HTMLDivElement>(null);
 const [skipRequested,setSkipRequested]=useState(false);
 const skip=()=>{if(profile){onComplete();return;}setSkipRequested(true);setScene('name');};
 useEffect(()=>{if(skipRequested&&profile&&scene==='end')onComplete();},[skipRequested,profile,scene,onComplete]);
 useEffect(()=>{focusRef.current?.focus();},[scene]);
 useEffect(()=>{
  if(scene!=='rift')return;
  const timer=window.setTimeout(()=>setScene('spirit'),1800);
  return()=>window.clearTimeout(timer);
 },[scene]);
 const create=(event:React.FormEvent)=>{
  event.preventDefault();const error=nicknameError(name);setError(error);if(error)return;
  const clean=normalizeNickname(name);setName(clean);onCreate(clean);setScene(skipRequested?'end':'rift');
 };
 return <main className={`prologue scene-${scene}`} aria-label="프롤로그: 봉인된 서책">
  <LoadingBackground className="prologue-museum" src="/cinematics/prologue-museum.png"/><div className="prologue-aura" aria-hidden="true"/><div className="prologue-blackout" aria-hidden="true"/>
  <header>{onClose&&<button onClick={onClose}>닫기</button>}<button className="prologue-skip" onClick={skip}>스킵 <SkipForward size={16}/></button></header>
  <section className="prologue-stage">
   <div className="prologue-copy" key={scene} ref={focusRef} tabIndex={-1}>
    {scene==='museum'?<><p className="prologue-line">국립중앙박물관 깊은 곳, 유리 진열장 속에 잠들어 있던 고서가 희미한 빛을 발하기 시작합니다.</p><button className="prologue-next" onClick={()=>setScene(profile?'rift':'name')}>다음 <ArrowRight size={18}/></button></>:scene==='name'?<>
     <p className="prologue-line">국립중앙박물관 깊은 곳, 오랜 시간 봉인되어 있던 고서가 빛을 발하기 시작합니다. 서책의 첫 장에 당신의 이름을 각인하십시오.</p>
     <form onSubmit={create} noValidate><label htmlFor="player-name">당신의 이름</label><div className="prologue-input"><input id="player-name" value={name} onChange={e=>{setName(e.target.value);setError('');}} maxLength={24} placeholder="홍길동" autoComplete="nickname" aria-describedby="nickname-hint nickname-error" aria-invalid={!!error}/><button type="submit">이름 각인 <ArrowRight size={18}/></button></div><small id="nickname-hint">한글·영문·숫자·밑줄 2~12자 · 이 브라우저에 저장됩니다.</small><p id="nickname-error" role="alert">{error}</p></form>
    </>:scene==='rift'?<><p className="prologue-line">서책의 빛이 번지며 시공간이 뒤틀립니다.</p></>:scene==='spirit'?<>
     <p className="prologue-line">“{spiritDialogue(name)}”</p><button className="prologue-next" onClick={()=>setScene('player')}>다음 <ArrowRight size={18}/></button>
    </>:scene==='player'?<>
     <p className="prologue-line">“으악, 이게 무슨 소리야?! 몸이... 몸이 빛 속으로 빨려 들어가고 있어!”</p><button className="prologue-next" onClick={onComplete}>빛 속으로 <ArrowRight size={18}/></button>
    </>:null}
    {storageError&&<p className="prologue-warning" role="status">프로필을 저장하지 못했습니다. 현재 창에서는 진행할 수 있지만 새로고침하면 사라질 수 있습니다.</p>}
   </div>
  </section>

 </main>;
}
