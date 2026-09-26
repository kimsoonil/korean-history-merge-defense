// Coordinates are percentages of the square battlefield, shared by UI and combat.
export const ROAD_EDGE=5;
export const ROAD_RADIUS=8;
export const ROAD_PATH='M13 5H87A8 8 0 0 1 95 13V87A8 8 0 0 1 87 95H13A8 8 0 0 1 5 87V13A8 8 0 0 1 13 5Z';
// Follow the same straight segments and quarter circles as the painted road.
export function roadPosition(t:number){
 const line=100-2*ROAD_EDGE-2*ROAD_RADIUS,arc=Math.PI*ROAD_RADIUS/2,side=line+arc;
 const distance=((t%1)+1)%1*side*4,index=Math.min(3,Math.floor(distance/side)),local=distance-index*side;
 let x:number,y:number;
 if(local<=line){x=ROAD_EDGE+ROAD_RADIUS+local;y=ROAD_EDGE;}
 else{const angle=-Math.PI/2+(local-line)/ROAD_RADIUS;x=100-ROAD_EDGE-ROAD_RADIUS+ROAD_RADIUS*Math.cos(angle);y=ROAD_EDGE+ROAD_RADIUS+ROAD_RADIUS*Math.sin(angle);}
 for(let i=0;i<index;i++){const previous=x;x=100-y;y=previous;}
 return {x,y};
}
export const fieldPosition=(slot:number)=>({x:17+(slot%8+.5)*66/8,y:18+(Math.floor(slot/8)+.5)*64/5});
// Preserve short-range reach as the lane moves outward from its original 9% inset.
export const LANE_RANGE_ALLOWANCE=Math.SQRT2*(9-ROAD_EDGE);
