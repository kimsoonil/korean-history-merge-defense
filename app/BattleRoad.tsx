import {ROAD_EDGE,ROAD_PATH} from '@/lib/battlefield';
/** One closed path keeps the four corners seamless and matches pathAt's centerline. */
export default function BattleRoad(){
  const route=ROAD_PATH;
  return <svg className="battle-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id="battle-soil" width="7" height="6" patternUnits="userSpaceOnUse">
        <rect width="7" height="6" fill="#c9ac76"/>
        <ellipse cx="1.3" cy="2" rx=".32" ry=".2" fill="#eed6a0" opacity=".7"/>
        <ellipse cx="5.4" cy="4.6" rx=".23" ry=".16" fill="#aa8956" opacity=".55"/>
        <path d="m3.5 .7.5.1M2.7 4.8l.4-.15" stroke="#dfc38d" strokeWidth=".15"/>
      </pattern>
    </defs>
    <g fill="none" strokeLinejoin="round">
      {/* Centerline 5%, width 10%: outside edge 0%, flush with the inner map. */}
      <path d={route} stroke="url(#battle-soil)" strokeWidth={ROAD_EDGE*2}/>
    </g>
  </svg>;
}
