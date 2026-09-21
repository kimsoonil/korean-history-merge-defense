export const FINAL_WAVE=8;
export const CAMPAIGN_STORAGE_KEY='salsu-campaign-v1';
export const MAP_WIDTH=3000;
export const MAP_HEIGHT=720;
export const chapterOneBattles=Array.from({length:FINAL_WAVE},(_,index)=>({
  wave:index+1,code:`1-${index+1}`,name:index+1===FINAL_WAVE?'살수대첩':'수나라의 침공',boss:index+1===FINAL_WAVE,
}));
export const campaignNodes=[
  {id:1,x:200,y:382,name:'살수대첩',year:'612년',terrain:'river',setting:'강가',description:'살수의 강가를 따라 펼쳐지는 고구려의 방어전.'},
  {id:2,x:470,y:245,name:'안시성 전투',year:'645년',terrain:'mountain',setting:'산지 · 성곽',description:'산지와 능선에 둘러싸인 안시성의 방어전.'},
  {id:3,x:780,y:368,name:'황산벌 전투',year:'660년',terrain:'plain',setting:'들판',description:'넓은 황산벌을 배경으로 펼쳐지는 백제와 신라의 전투.'},
  {id:4,x:1080,y:530,name:'나당전쟁',year:'670~676년',terrain:'coast',setting:'육지 · 연안',description:'매소성의 육상 전투와 기벌포의 해전을 함께 상징하는 연안 전장.'},
  {id:5,x:1380,y:330,name:'귀주대첩',year:'1019년',terrain:'plain',setting:'내륙 평야',description:'내륙의 넓은 전장에서 거란군을 맞서는 고려의 결전.'},
  {id:6,x:1680,y:270,name:'처인성 전투',year:'1232년',terrain:'hill',setting:'낮은 구릉 · 토성',description:'낮은 구릉 위 처인성을 배경으로 한 항몽 전투.'},
  {id:7,x:1980,y:530,name:'한산도대첩',year:'1592년',terrain:'sea',setting:'섬 앞바다',description:'섬들 사이로 열린 한산도 앞바다의 해전.'},
  {id:8,x:2280,y:280,name:'행주대첩',year:'1593년',terrain:'hill',setting:'강변 언덕 · 산성',description:'한강을 바라보는 언덕과 행주산성의 방어전.'},
  {id:9,x:2590,y:420,name:'명량대첩',year:'1597년',terrain:'strait',setting:'좁은 해협',description:'두 해안 사이의 좁은 울돌목을 상징하는 해협 전장.'},
  {id:10,x:2850,y:270,name:'남한산성 공성전',year:'1636~1637년',terrain:'mountain',setting:'겨울 산악 · 산성',description:'겨울 산악 지형에 둘러싸인 남한산성의 공성전.'},
].map(node=>({...node,available:node.id===1}));
export const isChapterOneWave=(wave:number)=>Number.isInteger(wave)&&wave>=1&&wave<=FINAL_WAVE;
export const nextUnlockedWave=(cleared:number)=>Math.min(FINAL_WAVE,cleared+1);
export const isWaveUnlocked=(wave:number,cleared:number)=>isChapterOneWave(wave)&&wave<=nextUnlockedWave(cleared);
export const recordWaveClear=(cleared:number,wave:number)=>isWaveUnlocked(wave,cleared)?Math.max(cleared,wave):cleared;
export function readCampaignProgress(raw:string|null):number{
  try{const value=JSON.parse(raw??'null');return value?.version===1&&Number.isInteger(value.highestClearedWave)&&value.highestClearedWave>=0&&value.highestClearedWave<=FINAL_WAVE?value.highestClearedWave:0;}catch{return 0;}
}
export const waveEnemyCount=(wave:number)=>wave===FINAL_WAVE?23:5+wave*2;
export const waveCombatLevel=(wave:number)=>wave===FINAL_WAVE?10:wave;
export function horizontalWheelDelta(x:number,y:number,mode:number,pageWidth:number){
  const delta=Math.abs(x)>Math.abs(y)?x:y;
  return delta*(mode===1?16:mode===2?pageWidth:1);
}
