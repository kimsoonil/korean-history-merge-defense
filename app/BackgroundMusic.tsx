'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Music2,VolumeX} from 'lucide-react';
import {DEFAULT_MUSIC_SETTINGS,MUSIC_STORAGE_KEY,MUSIC_TRACKS,readMusicSettings,shouldPlayMusic,type MusicMood,type MusicSettings} from '@/lib/music';

type Status='standby'|'waiting'|'playing'|'paused'|'error';
export default function BackgroundMusic({mood='silent'}:{mood?:MusicMood}){
  const track=mood==='silent'?null:MUSIC_TRACKS[mood];
  const moodRef=useRef(mood);moodRef.current=mood;
  const audioRef=useRef<HTMLAudioElement>(null);
  const settingsRef=useRef<MusicSettings>({...DEFAULT_MUSIC_SETTINGS});
  const interactedRef=useRef(false),mountedRef=useRef(false);
  const requestRef=useRef(0);
  const [settings,setSettings]=useState<MusicSettings>({...DEFAULT_MUSIC_SETTINGS});
  const [status,setStatus]=useState<Status>('standby');

  const save=useCallback((next:MusicSettings)=>{
    settingsRef.current=next;setSettings(next);
    if(audioRef.current)audioRef.current.volume=next.volume/100;
    try{localStorage.setItem(MUSIC_STORAGE_KEY,JSON.stringify(next));}catch{}
  },[]);
  const play=useCallback(async()=>{
    const audio=audioRef.current;
    if(!audio||!shouldPlayMusic(moodRef.current,settingsRef.current.enabled,document.hidden))return;
    const request=++requestRef.current;
    audio.volume=settingsRef.current.volume/100;
    try{
      await audio.play();
      if(!mountedRef.current||!shouldPlayMusic(moodRef.current,settingsRef.current.enabled,document.hidden)){audio.pause();return;}
      if(request!==requestRef.current)return;
      setStatus('playing');
    }catch{
      if(request===requestRef.current&&mountedRef.current&&shouldPlayMusic(moodRef.current,settingsRef.current.enabled,document.hidden))setStatus(audio.error?'error':'waiting');
    }
  },[]);
  useEffect(()=>{
    mountedRef.current=true;
    let restored={...DEFAULT_MUSIC_SETTINGS};
    try{restored=readMusicSettings(localStorage.getItem(MUSIC_STORAGE_KEY));}catch{}
    settingsRef.current=restored;setSettings(restored);setStatus(!restored.enabled?'paused':moodRef.current!=='silent'?'waiting':'standby');
    const audio=audioRef.current!;audio.volume=restored.volume/100;
    const interact=(event:Event)=>{
      if(event.target instanceof Element&&event.target.closest('.music-controls'))return;
      if(event instanceof KeyboardEvent&&(!['Enter',' '].includes(event.key)||event.repeat))return;
      interactedRef.current=true;
      if(settingsRef.current.enabled&&audio.paused)void play();
    };
    const visibility=()=>{
      if(document.hidden){++requestRef.current;audio.pause();}
      else if(interactedRef.current&&settingsRef.current.enabled)void play();
    };
    window.addEventListener('click',interact,true);
    window.addEventListener('keydown',interact,true);
    document.addEventListener('visibilitychange',visibility);
    return()=>{
      mountedRef.current=false;
      window.removeEventListener('click',interact,true);
      window.removeEventListener('keydown',interact,true);
      document.removeEventListener('visibilitychange',visibility);
      audio.pause();
    };
  },[play]);
  useEffect(()=>{
    // Silent screens have no audio source. All play entry points also check moodRef.
    ++requestRef.current;
    const audio=audioRef.current;if(!audio)return;
    audio.pause();audio.load();
    setStatus(!settingsRef.current.enabled?'paused':mood!=='silent'?'waiting':'standby');
    if(interactedRef.current)void play();
    return()=>{++requestRef.current;};
  },[mood,play]);
  const toggle=()=>{
    const audio=audioRef.current;if(!audio)return;
    interactedRef.current=true;
    if(settingsRef.current.enabled){
      ++requestRef.current;save({...settingsRef.current,enabled:false});audio.pause();setStatus('paused');
    }else{
      save({...settingsRef.current,enabled:true,volume:settingsRef.current.volume||30});
      if(audio.error&&mood!=='silent')audio.load();
      setStatus(mood!=='silent'?'waiting':'standby');
      void play();
    }
  };
  const playing=mood!=='silent'&&status==='playing'&&settings.enabled;
  const label=settings.enabled?'배경음악 끄기':'배경음악 켜기';
  const hint=!settings.enabled?'배경음악 꺼짐':mood==='silent'?'전투 시작 시 음악이 재생됩니다.':status==='error'?'음악을 불러오지 못했습니다. BGM을 껐다 켜서 다시 시도하세요.':status==='waiting'?'음악 재생 대기 · 화면을 클릭하면 재생됩니다.':`${label} · ${track?.title}`;
  return <div className={`music-controls ${playing?'is-playing':''}`} data-state={status} data-mood={mood}>
    <audio ref={audioRef} src={track?.src} loop preload="none" aria-label={track?`${track.title} 배경음악`:'전투 배경음악'} onPlaying={()=>{if(!shouldPlayMusic(moodRef.current,settingsRef.current.enabled,document.hidden)){audioRef.current?.pause();return;}if(mountedRef.current)setStatus('playing');}} onPause={()=>{if(mountedRef.current)setStatus(settingsRef.current.enabled&&moodRef.current==='silent'?'standby':'paused');}} onError={()=>{if(mountedRef.current&&moodRef.current!=='silent')setStatus('error');}}/>
    <button className="music-toggle" type="button" onClick={toggle} aria-label={label} aria-pressed={settings.enabled} title={hint}>
      {settings.enabled&&settings.volume>0?<Music2 size={16}/>:<VolumeX size={16}/>}<span>BGM</span><i aria-hidden="true"><b/><b/><b/></i>
    </button>
    <input className="music-volume" type="range" min="0" max="100" step="5" value={settings.volume} aria-label="배경음악 음량" aria-valuetext={`${settings.volume}%`} title={`배경음악 음량 ${settings.volume}%`} onChange={event=>{
      const volume=Number(event.target.value);save({...settingsRef.current,volume});
      interactedRef.current=true;if(settingsRef.current.enabled)void play();
    }}/>
  </div>;
}
