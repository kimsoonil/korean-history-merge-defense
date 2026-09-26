import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {MUSIC_TRACKS,getMusicMood,readMusicSettings,shouldPlayMusic} from '../lib/music.ts';
import {createInvader} from '../lib/game.ts';

test('saved music settings are restored without allowing invalid volume',()=>{
  assert.deepEqual(readMusicSettings(null),{enabled:true,volume:30});
  assert.deepEqual(readMusicSettings('invalid'),{enabled:true,volume:30});
  assert.deepEqual(readMusicSettings('{"enabled":false,"volume":20}'),{enabled:false,volume:20});
  assert.deepEqual(readMusicSettings('{"enabled":true,"volume":120}'),{enabled:true,volume:100});
  assert.deepEqual(readMusicSettings('{"volume":-3}'),{enabled:true,volume:0});
  assert.deepEqual(readMusicSettings('{"volume":"loud"}'),{enabled:true,volume:30});
});

test('only a living boss in an active battle selects urgent music',()=>{
  for(let stage=1;stage<8;stage++)assert.equal(getMusicMood('battle',[createInvader(stage,0,stage)]),'normal');
  const boss=createInvader(10,0,10),regular=createInvader(10,1,11);
  assert.equal(getMusicMood('battle',[boss,regular]),'boss');
  assert.equal(getMusicMood('battle',[regular]),'normal');
  assert.equal(getMusicMood('battle',[{...boss,hp:0},regular]),'normal');
  assert.equal(getMusicMood('battle',[]),'normal');
  for(const phase of ['ready','cleared','won','lost'])assert.equal(getMusicMood(phase,[boss]),'silent');
});

test('clicks, volume changes and tab return cannot start music outside an active battle',()=>{
  for(const enabled of [true,false])for(const hidden of [true,false])assert.equal(shouldPlayMusic('silent',enabled,hidden),false);
  assert.equal(shouldPlayMusic('normal',true,false),true);
  assert.equal(shouldPlayMusic('normal',false,false),false);
  assert.equal(shouldPlayMusic('normal',true,true),false);
  assert.equal(shouldPlayMusic('boss',true,false),true);
  assert.equal(shouldPlayMusic('boss',false,false),false);
  assert.equal(shouldPlayMusic('boss',true,true),false);
});

test('a boss encounter switches from normal music to boss music and back',()=>{
  const boss=createInvader(10,0,1),regular=createInvader(10,1,2);
  assert.deepEqual([
    getMusicMood('ready',[]),getMusicMood('battle',[regular]),
    getMusicMood('battle',[boss,regular]),getMusicMood('battle',[{...boss,hp:0},regular]),
    getMusicMood('won',[]),
  ],['silent','normal','boss','normal','silent']);
});

for(const [mood,track] of Object.entries({boss:MUSIC_TRACKS.boss}))test(`${mood} soundtrack is non-silent, unclipped stereo PCM with a quiet loop seam`,()=>{
  const wav=readFileSync(new URL(`../public${track.src}`,import.meta.url));
  assert.equal(wav.toString('ascii',0,4),'RIFF');
  assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt16LE(20),1);
  assert.equal(wav.readUInt16LE(22),2);
  assert.equal(wav.readUInt16LE(34),16);
  const frames=wav.readUInt32LE(40)/4,rate=wav.readUInt32LE(24);
  assert.equal(frames/rate,track.seconds);
  assert.equal(wav.length,44+frames*4);
  let peak=0,energy=0;
  for(let i=44;i<wav.length;i+=2){const value=wav.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(value));energy+=value*value;}
  const rms=Math.sqrt(energy/(frames*2));
  if(mood==='normal'){
    assert.ok(peak>.2&&peak<=.65,'calm music has restrained peaks');
    assert.ok(rms>.07&&rms<.12,'calm music stays quiet but audible');
  }else{
    assert.ok(peak<.85&&peak>.5);
    assert.ok(rms>.05);
    assert.equal(createHash('sha256').update(wav).digest('hex'),'67e8980b60e733ce4b4ef30a7dfb6492856b0b5c004897e2bfb32773f6b7b606','the approved boss recording must remain unchanged');
  }
  for(const channel of [0,1])assert.ok(Math.abs(wav.readInt16LE(44+channel*2)-wav.readInt16LE(44+(frames-1)*4+channel*2))/32768<.02);
});

test('normal battle recording is the supplied MP3',()=>{
  const mp3=readFileSync(new URL(`../public${MUSIC_TRACKS.normal.src}`,import.meta.url));
  assert.equal(MUSIC_TRACKS.normal.src,'/audio/ketchaku.mp3');
  assert.ok(mp3.length>1500000);
  assert.ok(mp3.toString('ascii',0,3)==='ID3'||(mp3[0]===255&&(mp3[1]&224)===224));
});
