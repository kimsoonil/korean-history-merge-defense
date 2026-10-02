import type {CSSProperties} from 'react';

// Generated atlas characters can extend over their nominal cell boundaries.
// Keep a small safe area on both sides so a neighbouring hero cannot show through.
export const ATLAS_CELL_WIDTH=384;
export const ATLAS_CELL_HEIGHT=512;
export const ATLAS_SIDE_INSET=31;
// A spear or sword from the previous cell reaches farther into these portraits.
const heroInsets:Record<string,{left:number;right:number}>={
 정몽주:{left:96,right:16},
 왕건:{left:96,right:16},
};
export const atlasInsets=(name:string)=>heroInsets[name]??{left:ATLAS_SIDE_INSET,right:ATLAS_SIDE_INSET};
export const atlasCellViewBox=(col:number,row:number,name='')=>{
 const {left,right}=atlasInsets(name);
 return `${col*ATLAS_CELL_WIDTH+left} ${row*ATLAS_CELL_HEIGHT} ${ATLAS_CELL_WIDTH-left-right} ${ATLAS_CELL_HEIGHT}`;
};

export function atlasCellImageStyle(col:number,row:number,name=''):CSSProperties{
 const {left,right}=atlasInsets(name);
 const visibleRatio=(ATLAS_CELL_WIDTH-left-right)/ATLAS_CELL_WIDTH;
 return {
  width:`${400/visibleRatio}%`,
  height:'200%',
  left:`-${(col*100+left/ATLAS_CELL_WIDTH*100)/visibleRatio}%`,
  top:`-${row*100}%`,
 };
}
