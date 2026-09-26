export type Difficulty='normal'|'hard';
export function enemyStats(round:number,index:number,boss:boolean,emperor=false,difficulty:Difficulty='normal'){
 const scale=difficulty==='hard'?1:.7;
 if(emperor)return {hp:difficulty==='hard'?100000:50000,armor:400*scale};
 if(round<=10){const level=Math.ceil(round/5);return {hp:boss?(55+level*38+54)*10:55+level*38+(index%4)*18,armor:0};}
 return {hp:Math.round(round*(boss?1000:100)*scale),armor:Math.round(round*(boss?5:3)*scale*10)/10};
}
