# 제10장 — 노량해전 (1598년)

남한산성 공성전을 대체한다. 제7장 한산도·제8장 행주·제9장 명량 슬롯은 그대로 유지한다.

- 1–3: 노량 해협 / 4–6: 조명 연합전선 / 7–9: 관음포 격전 / 10: 노량 최종전.
- 스테이지별 20, 25, …, 65라운드. 일반·하드 능력치, 보상, 90초 보스 제한 유지.
- 최종 보스 시마즈 요시히로: 일반 50,000 / 하드 100,000 HP. 격퇴·퇴각으로 표현.
- 일반 적과 보스는 기존 한산도 함선 스프라이트를 재사용한다.
- 대사와 방어 거점 배치는 게임적 재구성이다. 이순신과 장병들의 전사를 결말에서 기린다.
- 이전 9개 장 일반 모드 전체 클리어 조건 유지. 제9장 명량은 현재 미구현이므로 정상 UI에서는 제10장 잠금 유지.
- 진행 키는 noryang-campaign-v1 / noryang-hard-campaign-v1. 이전 남한산성 진행 키는 삭제하지 않는다. 이전 남한산성 전투 저장은 이어하기 대상으로 인식하지 않으며, 다른 장 저장은 영향 없다.
- Sites 배포는 수행하지 않음.

## 역사 참고

한국민족문화대백과사전 [노량해전](https://encykorea.aks.ac.kr/Article/E0012716): 1598년 조명 연합함대의 해전, 이순신·진린, 일본 함대 퇴각.

## 이미지

내장 image_gen 도구로 생성. 실제 지형도가 아닌 게임용 추상화.

- 전장: public/terrain/noryang-battlefield.png
- 이야기 표지: public/story/chapters/noryang.png

### 전장 생성 프롬프트

Use case: stylized-concept. Asset type: square top-down mobile defense game battlefield, Noryang naval battle 1598 Korea at blue dawn. Polished hand-painted strategy game environment. Large quiet unobstructed flat grassy coastal island occupies center x16-84%, y16-84%, subtle earth and grass for placing 25 characters. Surrounding continuous deep teal sea channel around ALL FOUR edges x0-14%, x86-100%, y0-14%, y86-100%, clear open water at x5/95 and y5/95 for moving enemy ships. Small rocky shore and sparse coastal pines only at island edge. A few tiny Korean naval watchposts and wooden jetties inset on shore, no blocking structures in central field. Dawn silver-blue water with gentle currents, restrained warm lantern accents, readable not dark. Orthographic overhead, no horizon, no perspective camera. No ships, no people, no text, no UI, no grid, no frame. Gameplay abstraction not geographical map.

### 표지 생성 프롬프트

Use case: historical-scene. Asset type: illustrated storybook chapter cover for Korean history mobile defense game. Noryang naval battle 1598, blue dawn after night battle. Joseon panokseon warships with broad wooden decks and traditional Korean command pavilions, allied fleet silhouettes in narrow Korean island strait, restrained distant cannon fire and low mist, gold dawn light through blue smoke. Heroic but solemn remembering final battle, no visible named portrait, no modern vessels, no text or UI, no flags with writing, no gore. Painterly rich polished mobile fantasy history illustration, cinematic diagonal composition, landscape 3:2, ships central but leave subdued dark lower region for HTML title overlay. Not a top-down gameplay map.
