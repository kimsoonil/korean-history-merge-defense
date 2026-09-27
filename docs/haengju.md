# 행주대첩 — 제8장
로컬 구현. 공개 사이트에는 배포하지 않음.
앞선 1~7장 일반 10스테이지 완료 후 개방. 일반/하드 진행도 별도 저장.
1~3 산성 진입로 / 4~6 목책 방어선 / 7~9 행주산성 본진 / 10 행주 최종 공세.
권율 안내, 5장면 프롤로그, 보스 출현·격퇴와 승리 대사.
최종 보스 우키타 히데이에: 일반 50,000 HP / 하드 100,000 HP. 기존 보상, 조합, 가방, 강화, 90초 제한 유지.
전선, 반복 보스와 대사는 게임적 창작. 최종 공세는 실제 공격 순서의 재현이 아닙니다.
역사 참고: https://encykorea.aks.ac.kr/Article/E0062859

## 이미지와 제작 모드
내장 image_gen으로 새 이미지 생성. 원본 보존 후 프로젝트로 복사.
- public/terrain/haengju-battlefield.png — 산성 전장, 불투명
- public/portraits/haengju-infantry.png — 일본군 공용 SD 스프라이트, 투명 배경 (보스는 확대 표시)
- 기존 public/story/chapters/haengju.png 표지는 유지

### 지도 프롬프트
Square top-down mobile tower defense game terrain, Haengju mountain fortress Korea 1593. Central broad unobstructed grassy dirt parade field occupies x17–83 percent y18–82 percent, enclosed by low earthen ramparts and wooden palisades at 13 and 87 percent. Outside the ramparts a continuous dirt patrol path follows a rounded square along x5 and x95 percent and y5 and y95 percent, fully visible and walkable, no buildings blocking this perimeter route. Sparse Korean pine bushes and rocks between path and earthen wall, small wooden guard platforms inset from the road, hint of mountain slopes. Painterly detailed historical strategy game environment, natural olive grass and warm earth, overhead orthographic view. No people, no units, no interface, no letters, no modern buildings, no huge tall stone castle, no frame.
### 병사 프롬프트
Single SD chibi late 16th century Japanese ashigaru infantry enemy for a Korean historical mobile tower defense game. Full body centered, short proportions and large head, simple dark jingasa conical iron hat, muted red and brown lamellar torso armor, sandals, holding one short spear upright. Painterly polished cartoon sprite with bold readable silhouette, front three-quarter view, entire weapon and feet visible with ample padding. Transparent background. No other soldiers, no atlas, no text, no ground, no watermark.
