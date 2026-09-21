/** One closed path keeps the four corners seamless and matches pathAt's centerline. */
export default function BattleRoad(){
  const route='M9 9H91V91H9Z';
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
      <path d={route} stroke="#49612f" strokeWidth="9.2" opacity=".65"/>
      <path d={route} stroke="#947549" strokeWidth="8.5"/>
      <path d={route} stroke="#e0c690" strokeWidth="7.9"/>
      <path d={route} stroke="url(#battle-soil)" strokeWidth="7.2"/>
    </g>
  </svg>;
}
