// Original score and synthetic instruments for Salsu; no third-party recordings.
// Run with node scripts/render-bgm.mjs; add --boss for the urgent battle loop.
import {mkdirSync,writeFileSync} from 'node:fs';
const BOSS=process.argv.includes('--boss'),FILE=BOSS?'salsu-boss.wav':'forest-calm.wav';
const RATE=24000,BPM=BOSS?150:96,BEAT=60/BPM,BARS=16,LENGTH=BARS*4*BEAT;
const frames=Math.round(RATE*LENGTH),left=new Float32Array(frames),right=new Float32Array(frames);
const tau=2*Math.PI,hz=midi=>440*2**((midi-69)/12);
let seed=61729;
const noise=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2147483648-1;};
function add(start,duration,pan,level,sample){
  const at=Math.round(start*RATE),count=Math.round(duration*RATE);
  const l=Math.cos((pan+1)*Math.PI/4)*level,r=Math.sin((pan+1)*Math.PI/4)*level;
  for(let i=0;i<count;i++){
    const value=sample(i/RATE,i/count),index=(at+i)%frames;
    // Wrap instrument tails into the beginning instead of cutting the loop seam.
    left[index]+=value*l;right[index]+=value*r;
  }
}
// Short, rounded wooden notes: bright attacks without a piercing bell overtone.
function pluck(midi,beat,level=.15,pan=-.12,duration=.34){
  const f=hz(midi);
  add(beat*BEAT,duration,pan,level,(t,p)=>{
    const env=(1-Math.exp(-t*450))*Math.min(1,(1-p)*duration/.055);
    return (Math.sin(tau*f*t)*Math.exp(-t*9)
      +.25*Math.sin(tau*f*2*t)*Math.exp(-t*18)
      +.08*Math.sin(tau*f*3.99*t)*Math.exp(-t*32))*env;
  });
}
function bass(midi,beat){
  const f=hz(midi);
  add(beat*BEAT,.27,0,.115,(t,p)=>(Math.sin(tau*f*t)+.18*Math.sin(tau*f*2*t))
    *(1-Math.exp(-t*220))*Math.exp(-t*10)*Math.min(1,(1-p)*.27/.055));
}
function drum(beat,level=.065){
  add(beat*BEAT,.22,-.06,level,(t,p)=>{
    const phase=tau*(76*t+44*.018*(1-Math.exp(-t/.018)));
    return Math.sin(phase)*Math.exp(-t*24)*(1-Math.exp(-t*650))*Math.min(1,(1-p)*6);
  });
}
function wood(beat,level=.026){
  add(beat*BEAT,.09,.3,level,(t,p)=>(Math.sin(tau*720*t)+.3*Math.sin(tau*1080*t))
    *Math.exp(-t*55)*(1-Math.exp(-t*900))*Math.min(1,(1-p)*4));
}
function shaker(beat,level){
  let previous=0;
  add(beat*BEAT,.07,.18,level,(t,p)=>{
    const next=noise(),filtered=(next+previous)*.5;previous=next;
    return filtered*Math.sin(Math.PI*p)**2*Math.exp(-t*25);
  });
}
function strings(midi,beat,level=.065){
  const f=hz(midi);
  add(beat*BEAT,.19,-.22,level,(t,p)=>{
    let value=0;
    for(let h=1;h<=5;h++)value+=Math.sin(tau*f*h*t)/h**1.35;
    return value*(1-Math.exp(-t*260))*Math.exp(-t*12)*Math.min(1,(1-p)*5);
  });
}
function snare(beat){
  let previous=0;
  add(beat*BEAT,.13,.12,.055,(t,p)=>{
    const next=noise(),filtered=(next+previous)*.5;previous=next;
    return (filtered+.25*Math.sin(tau*190*t))*Math.exp(-t*27)
      *(1-Math.exp(-t*900))*Math.min(1,(1-p)*5);
  });
}
// Soft electric-piano-like tone. A rounded attack and long decay replace the
// previous wooden plucks; the normal score deliberately has no percussion.
function mellow(midi,beat,length,level=.09,pan=0){
  const f=hz(midi),duration=length*BEAT+.4;
  add(beat*BEAT,duration,pan,level,(t,p)=>{
    const attack=Math.sin(Math.min(1,t/.075)*Math.PI/2)**2;
    const release=Math.min(1,(1-p)*duration/.4)**2;
    return (Math.sin(tau*f*t)*Math.exp(-t*1.4)
      +.14*Math.sin(tau*f*2*t)*Math.exp(-t*2.8)
      +.035*Math.sin(tau*f*3*t)*Math.exp(-t*4.2))*attack*release;
  });
}
if(BOSS){
  // Fast D-minor ostinato and marching percussion, with no slow ambient layer.
  const roots=[50,46,43,45],thirds=[3,4,3,4];
  const call=[[74,0],[77,1],[76,1.5],[74,2],[72,3],[69,3.5]];
  const answer=[[74,0],[77,1],[79,1.5],[77,2],[76,3],[73,3.5]];
  for(let bar=0;bar<BARS;bar++){
    const beat=bar*4,root=roots[Math.floor(bar/2)%4],third=thirds[Math.floor(bar/2)%4];
    [0,1,2,3].forEach(offset=>bass(root-12,beat+offset));
    [0,7,12,7,third,7,12,7].forEach((note,index)=>strings(root+12+note,beat+index*.5));
    (bar%2?answer:call).forEach(([note,offset])=>pluck(note,beat+offset,.105,.1,.25));
    [0,.75,2,2.75].forEach(offset=>drum(beat+offset,.105));
    snare(beat+1);snare(beat+3);
    for(let step=0;step<16;step++)shaker(beat+step*.25,step%2?.013:.025);
    if(bar%4===3){wood(beat+3.25,.04);wood(beat+3.5,.04);wood(beat+3.75,.045);}
  }
}else{
  // Warm major harmony stays light, without the bouncy offbeat rhythm or a
  // gloomy minor drone. A sparse eight-bar melody repeats at an even level.
  const C=[48,55,60,64],F=[53,57,60,65],G=[55,59,62,67];
  const chords=[C,C,F,F,C,C,G,C];
  const melody=[
    [[72,0,1.8],[76,2,1.8]],
    [[74,0,1.8],[72,2,1.8]],
    [[69,0,3.6]],
    [[72,0,1.8],[69,2,1.8]],
    [[67,0,1.8],[72,2,1.8]],
    [[76,0,3.6]],
    [[74,0,1.8],[71,2,1.8]],
    [[72,0,3.6]],
  ];
  for(let bar=0;bar<BARS;bar++){
    const beat=bar*4,chord=chords[bar%8];
    mellow(chord[0],beat,3.5,.045,0);
    [1,2,3,2].forEach((index,offset)=>mellow(chord[index],beat+offset,1.8,.04,offset%2?-.2:.2));
    melody[bar%8].forEach(([note,offset,length])=>mellow(note,beat+offset,length,.105,.06));
  }
}
// Preserve the approved boss mix exactly; give only the calm piano a soft room.
const dryL=left.slice(),dryR=right.slice();
for(let i=0;i<frames;i++){
  left[i]+=dryR[(i-Math.round((BOSS?.075:.19)*RATE)+frames)%frames]*(BOSS?.065:.1);
  right[i]+=dryL[(i-Math.round((BOSS?.095:.23)*RATE)+frames)%frames]*(BOSS?.065:.1);
}
const meanL=left.reduce((a,b)=>a+b,0)/frames,meanR=right.reduce((a,b)=>a+b,0)/frames;
let peak=0,rawEnergy=0;
for(let i=0;i<frames;i++){left[i]-=meanL;right[i]-=meanR;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));rawEnergy+=left[i]**2+right[i]**2;}
const scale=BOSS?.8/peak:Math.min(.64/peak,.105/Math.sqrt(rawEnergy/(frames*2))),pcm=Buffer.alloc(44+frames*4);
pcm.write('RIFF',0);pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);
pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(2,22);pcm.writeUInt32LE(RATE,24);pcm.writeUInt32LE(RATE*4,28);
pcm.writeUInt16LE(4,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(frames*4,40);
let energy=0;
for(let i=0;i<frames;i++){
  const l=left[i]*scale,r=right[i]*scale;energy+=l*l+r*r;
  pcm.writeInt16LE(Math.round(l*32767),44+i*4);pcm.writeInt16LE(Math.round(r*32767),46+i*4);
}
const destination=new URL('../public/audio/',import.meta.url);mkdirSync(destination,{recursive:true});
writeFileSync(new URL(FILE,destination),pcm);
console.log(JSON.stringify({file:`public/audio/${FILE}`,seconds:LENGTH,bpm:BPM,rate:RATE,peak:peak*scale,rms:Math.sqrt(energy/(frames*2)),seamJump:Math.max(Math.abs(left[0]-left[frames-1]),Math.abs(right[0]-right[frames-1]))*scale}));
