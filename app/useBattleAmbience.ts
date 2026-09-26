'use client';
import {useEffect,useRef,useState} from 'react';
// Synthesized wind and distant nonverbal crowd calls; no spoken dialogue or borrowed audio.
export default function useBattleAmbience(){
 const context=useRef<AudioContext|null>(null),[enabled,setEnabled]=useState(false);
 const stop=()=>{const ctx=context.current;context.current=null;if(ctx)void ctx.close();setEnabled(false);};
 const start=()=>{
  if(context.current)return;
  try{
   const ctx=new AudioContext();context.current=ctx;
   const master=ctx.createGain();master.gain.value=.12;master.connect(ctx.destination);
   const buffer=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate),data=buffer.getChannelData(0);
   let smooth=0;for(let i=0;i<data.length;i++){smooth=smooth*.97+(Math.random()*2-1)*.03;data[i]=smooth*3;}
   const wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;
   const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;
   wind.connect(filter);filter.connect(master);wind.start();
   for(let i=0;i<7;i++){
    const voice=ctx.createOscillator(),band=ctx.createBiquadFilter(),gain=ctx.createGain(),pulse=ctx.createOscillator(),depth=ctx.createGain();
    voice.type='sawtooth';voice.frequency.value=95+i*13;band.type='bandpass';band.frequency.value=550+i*75;band.Q.value=3;
    gain.gain.value=.045;pulse.frequency.value=.18+i*.05;depth.gain.value=.035;
    pulse.connect(depth);depth.connect(gain.gain);voice.connect(band);band.connect(gain);gain.connect(master);voice.start();pulse.start();
   }
   void ctx.resume().then(()=>{if(context.current===ctx)setEnabled(ctx.state==='running');}).catch(stop);
  }catch{stop();}
 };
 useEffect(()=>{
  const hide=()=>{if(document.hidden&&context.current){void context.current.close();context.current=null;setEnabled(false);}};
  document.addEventListener('visibilitychange',hide);
  return()=>{document.removeEventListener('visibilitychange',hide);if(context.current)void context.current.close();context.current=null;};
 },[]);
 return {enabled,start,stop,toggle:()=>enabled?stop():start()};
}
