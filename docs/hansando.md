# 한산도대첩 — 제7장
- 로컬 구현. 배포하지 않음.
- 앞선 1~6장 일반 10스테이지 완료 후 개방. 일반/하드 진행도 독립 저장.
- 1~3 견내량 유인전 / 4~6 한산도 앞바다 / 7~9 학익진 포위망 / 10 와키자카 최종전.
- 기존 20~65라운드, 소환·조합·가방·강화·보상·90초 보스 제한 유지.
- 바깥 수로의 함선과 중앙 배치 섬은 기존 게임 규칙을 유지하기 위한 추상화입니다. 전선 구분, 반복 보스, 대사는 창작이며 실제 지형·전투 순서를 그대로 재현하지 않습니다.
- 와키자카의 최종 대사는 전사 대신 후퇴로 표현합니다.
- 참고: https://encykorea.aks.ac.kr/Article/E0061676

## 이미지
기본 내장 image_gen 도구로 새 이미지 생성, map opaque / ship transparent.
- public/terrain/hansando-battlefield.png
- public/portraits/hansando-ship.png
이야기 표지는 기존 /cinematics/yi-sunsin.png 유지.

### 지도 프롬프트
Square top-down illustrated Korean historical tower defense battlefield asset, Hansando sea battle 1592. A broad quiet grassy sandy island occupies the central 66 percent square for placing small units, sparse rocks and low grass only. Continuous clear turquoise open sea surrounds it on ALL four sides and corners, outer 15 percent is unobstructed navigable water for enemy ships circling the map. Soft painterly mobile strategy game style, natural rich sea blues and muted green grass, subtle shallow waves and shoreline foam. Orthographic overhead view, no perspective horizon. No roads, no walls, no ships, no people, no text, no UI, no borders. Full bleed usable game terrain.
### 함선 프롬프트
One single cute SD chibi 16th century Japanese wooden warship game sprite, elevated three-quarter view, entire boat including oars and a small plain white banner fully visible, brown wooden hull, small raised wooden command deck, compact bold readable silhouette, painterly mobile Korean historical defense game style. Centered with generous transparent margin on all sides, genuinely transparent background. No sea, no ground, no shadow rectangle, no text, no other ships, no sprite sheet, no modern elements.
