export const MUSIC_STORAGE_KEY='salsu-bgm-v1';
export const MUSIC_TRACK='/audio/forest-calm.wav';
export const MUSIC_TRACKS={
  normal:{src:MUSIC_TRACK,title:'고요한 숲길',seconds:40},
  boss:{src:'/audio/salsu-boss.wav',title:'살수 결전',seconds:25.6},
} as const;
export type MusicMood='silent'|'boss';
export function getMusicMood(phase:string,enemies:readonly {boss:boolean;hp:number}[]):MusicMood{
  return phase==='battle'&&enemies.some(enemy=>enemy.boss&&enemy.hp>0)?'boss':'silent';
}
export const DEFAULT_MUSIC_SETTINGS={enabled:true,volume:30};
export type MusicSettings={enabled:boolean;volume:number};
export function shouldPlayMusic(mood:MusicMood,enabled:boolean,hidden:boolean){
  return mood==='boss'&&enabled&&!hidden;
}

export function readMusicSettings(raw:string|null):MusicSettings{
  try{
    const value=JSON.parse(raw??'null');
    return {
      enabled:typeof value?.enabled==='boolean'?value.enabled:DEFAULT_MUSIC_SETTINGS.enabled,
      volume:typeof value?.volume==='number'&&Number.isFinite(value.volume)?Math.min(100,Math.max(0,value.volume)):DEFAULT_MUSIC_SETTINGS.volume,
    };
  }catch{return {...DEFAULT_MUSIC_SETTINGS};}
}
