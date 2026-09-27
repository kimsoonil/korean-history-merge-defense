# 남한산성 공성전 — 제10장
- 로컬 구현, 미배포. 제9장 명량대첩이 미구현이므로 정상 UI에서는 아직 잠금.
- 기존 순차 개방 유지: 1~9장 일반 10스테이지 완료 필요. 제9장 진행도 키는 myeongnyang-campaign-v1 예약.
- 겨울 산길(1~3), 성문 방어선(4~6), 설원 성벽(7~9), 최후 방어 임무(10).
- 20~65라운드, 일반/하드, 보스 90초, 기존 경제와 전투 규칙 유지.
- 산성 수비장과 청군 포위사령관은 창작 인물. 실제 조선 승리로 묘사하지 않으며 프롤로그·결말에 인조의 항복과 게임 임무를 구분.
- 역사 참고 https://encykorea.aks.ac.kr/Article/E0023151
## 에셋
내장 image_gen 생성 후 public/terrain/namhan-battlefield.png 저장.
표지는 기존 public/story/chapters/namhansan.png 유지.
청군은 기존 병사 atlas 임시 재사용. 생성한 SD 초안은 배경 제거가 되지 않아 미적용.
### 지도 프롬프트
Square top-down Korean historical tower defense terrain Namhansanseong winter mountain fortress 1636-1637. Large unobstructed snow-dusted earth courtyard in central 66 percent for units. Low Korean gray stone ramparts at x14/86 y14/86 percent, traditional small tiled guard gates inset from perimeter. Continuous snowy dirt enemy patrol path runs OUTSIDE walls along x5/95 y5/95 percent forming rounded square, clear all four sides. Sparse snow covered pines, icy rocks. Painterly polished mobile strategy game art, overhead orthographic view, cold blue-gray with earthy patches, readable quiet central area. No people, no soldiers, no UI, no text, no labels, no border.
### 미적용 병사 초안 프롬프트
One full body SD chibi early 17th century Qing infantry soldier game sprite for Korean historical tower defense. Rounded iron helmet with small red tassel and neck guard, blue-gray padded brigandine winter armor with small brass studs, dark boots, holding a short spear. Big head compact cute proportions, readable painterly cartoon mobile game style, three-quarter front view, centered full body and spear entirely visible with generous padding. Genuinely transparent background, no ground, no text, no extra figures, no atlas, no modern elements.
배경 제거 편집도 시도했으나 만족하지 못해 프로젝트에 적용하지 않음.
