export type Difficulty='normal'|'hard';

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const roundedArmor=(value:number)=>Math.round(value*10)/10;

export function storyFinalBossHp(chapter:number){
 const safeChapter=clamp(Math.trunc(chapter),1,10);
 return 100000+Math.round((safeChapter-1)*50000/9/1000)*1000;
}

/**
 * Enemy growth is split across chapter, stage and progress inside the stage.
 * This keeps an early high-tier hero from remaining sufficient indefinitely.
 */
export function enemyStats(
 round:number,
 _index:number,
 boss:boolean,
 storyFinal=false,
 difficulty:Difficulty='normal',
 stage=1,
 chapter=1,
 stageFinal=storyFinal,
 maxRounds=20+(stage-1)*5,
){
 const safeChapter=clamp(Math.trunc(chapter),1,10),safeStage=clamp(Math.trunc(stage),1,10);
 const progress=maxRounds<=1?1:clamp((round-1)/(maxRounds-1),0,1);

 // Normal and hard share the same story-finale stats. Normal mode's later
 // historical ally is the intended assistance for this encounter.
 if(storyFinal)return {hp:storyFinalBossHp(safeChapter),armor:310+(safeChapter-1)*10};

 const chapterMultiplier=1+.12*(safeChapter-1);
 const stageMultiplier=1+.10*(safeStage-1);
 const roundMultiplier=1+3*Math.pow(progress,1.6);
 const regularHp=Math.round(200*chapterMultiplier*stageMultiplier*roundMultiplier);
 const regularArmor=8*(safeChapter-1)+8*(safeStage-1)+progress*(20+20*safeStage);

 let hardHp=regularHp,hardArmor=regularArmor;
 if(boss&&stageFinal){
  hardHp*=12+2*safeStage;
  hardArmor+=60;
 }else if(boss){
  hardHp*=8;
  hardArmor+=40;
 }

 const scale=difficulty==='hard'?1:safeStage===10?.85:.7;
 return {hp:Math.round(hardHp*scale),armor:roundedArmor(hardArmor*scale)};
}
