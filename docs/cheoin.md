# 처인성 전투

제6장으로 추가. 귀주대첩을 포함한 앞선 다섯 이야기의 일반 10스테이지 완료 후 개방. 자체 일반 10스테이지 완료 후 하드 개방. 기존 귀주대첩은 유지합니다.

1~3 처인부곡 길목 / 4~6 처인성 토성 / 7~9 목책 방어선 / 10 살리타 최종전. 각 스테이지 20~65라운드, 기존 인원·골드·강화·90초 보스 제한 유지. 최종 보스 일반 50,000 HP / 하드 100,000 HP. 적 SD는 기존 병종 아틀라스를 재사용합니다.

1232년 몽골의 제2차 침입과 김윤후·처인 주민의 항전을 배경으로 합니다. 대사·전선 구분·반복 보스는 게임적 각색입니다. 후대 충주성 전투와 혼동하지 않습니다. 참고: [한국민족문화대백과 처인성전투](https://encykorea.aks.ac.kr/Article/E0055720).

## 전장 자산

경로: `public/terrain/cheoin-battlefield.png`. 기존 이야기 표지 `public/story/chapters/cheoin.png` 유지.
내장 imagegen으로 제작, 원본 PNG 적용. 배경 크기는 적 순환 경로에 맞춰 CSS로 조정.

### 전체 생성 프롬프트

```text
Use case: stylized-concept
Asset type: square 1024x1024 top-down Korean historical tower-defense terrain.
Primary request: Cheoin small earthen fortress, Goryeo Korea 1232. Modest earth ramparts, sparse rough wooden palisades, bundles of stones and small thatched shelters confined to the extreme outer margins. No grand palace or masonry castle.
Composition: strictly orthographic overhead. Huge empty central 80% field of compacted pale earth and muted grass for unit placement. Continuous broad dirt patrol road close to canvas edge, centerlines x=5%,95% and y=5%,95%; gentle rounded corners radius 8%. Keep road entirely clear, all scenery outside road only. Natural soft winter daylight, hand-painted detailed strategy game style.
Constraints: no people, no characters, no units, no UI, no grid, no text, no watermark, no central props, no crossing paths. Opaque full-bleed square.
```

