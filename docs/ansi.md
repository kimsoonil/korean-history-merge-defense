# 안시성 전투

이야기 선택의 두 번째 장에서 시작한다. 2-1~2-10은 각각 20, 25, 30, 35, 40, 45, 50, 55, 60, 65라운드다. 일반·하드 개방 기록은 살수대첩과 별도이며 진행 중 전투 저장 슬롯은 하나다.

- 1~3: 안시성 성문
- 4~6: 안시성 공성전
- 7~9: 토산 쟁탈전
- 10: 당 태종 최종전

전장 배경: `public/terrain/ansi-battlefield.png`. 네 전선은 같은 안시성 기본 지형을 사용한다. 적 캐릭터는 기존 투명 SD 스프라이트를 재사용하고 당나라 병종·보스 이름으로 연결했다. 별도 생성한 당군 시트는 배경 투명도가 확보되지 않아 적용하지 않았다.

## 역사와 창작

645년의 공성전, 토산 공방과 당군 철수를 참고했다. 대사와 라운드별 적장 배치, 당 태종 직접 보스전은 게임용 창작이다. 성주 이름은 기본 기록에서 확정되지 않으므로 ‘안시성주’로 표기했다.

참고: https://encykorea.aks.ac.kr/Article/E0034848

## 이미지 제작 프롬프트

imagegen 스킬로 원본 생성 후 적 이동 경로에 맞추어 수정했다.

원본: Use case: historical-scene. Asset: square top-down mobile tower-defense battlefield texture for Ansi fortress, Goguryeo 645 AD. Hand-painted detailed Korean strategy game environment. Entire central 75 percent is empty grass and packed-earth courtyard for placing units, no buildings in central field. A continuous square dirt patrol road follows exactly x=5% and95%, y=5% and95% with gently curved corners, unobstructed. Low grey stone fortress walls and small Korean tiled gate roofs JUST INSIDE that perimeter path, medieval Goguryeo not modern palace. Outer edges rocky hills, sparse autumn pines. Cool blue-grey stone, muted amber grass. Orthographic near-vertical aerial viewpoint, entire map fills frame, no horizon, no characters, no soldiers, no text, no UI, no grid, no watermark. Large playable clear field. 1024x1024.

수정: Edit supplied Ansi tower defense map. Critical geometry correction: enemy patrol road must run OUTSIDE the fortress walls, centered at x=5% on left and95% on right, y=5% top and95% bottom. Continuous broad empty dirt square loop along OUTERMOST edge with corners bent, no obstacles on track. Move stone walls and gate buildings inward to approximately x=14%,86% y=14%,86%, just inside the exterior track. Keep center from20% to80% empty muted grass suitable for sprites. Preserve painterly historical Goguryeo fortress art style and square format. No characters, text, UI or painted grids. Do not put road inside walls.

최종 생성 원본: `/Users/kimsunul/.codex/generated_images/01a0aedc-abd0-71a0-b10f-c8241ab9c57d/exec-8f9afa34-8773-490b-a9e8-38ac49b0f49d.png`

검증: `node --test tests/*.test.mjs`, `npm run lint`, `SITES_EXPORT=1 npm run build`.
