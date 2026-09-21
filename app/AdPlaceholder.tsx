export default function AdPlaceholder({side}:{side:'left'|'right'}){
  return <aside className={`ad-rail ad-rail-${side}`} aria-label={`${side==='left'?'왼쪽':'오른쪽'} 광고 표시 영역`}>
    <span className="ad-rail-label">ADVERTISEMENT</span>
    <div className="ad-placeholder"><span className="ad-placeholder-mark" aria-hidden="true">AD</span><strong>광고 영역</strong><span>160 × 600</span><p>레이아웃 미리보기<br/>실제 광고는 표시되지 않습니다.</p></div>
    <small>게임과 분리된 광고 공간</small>
  </aside>;
}
