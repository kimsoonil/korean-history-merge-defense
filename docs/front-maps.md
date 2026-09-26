# 전선 맵 (2026-09-26)

총 65라운드: 1단계 1–20, 이후 단계마다 5라운드. 지역 선택 후 해당 지역의 스테이지 선택. 이전 스테이지 클리어 시 다음 단계 개방.

| 스테이지 | 전선 | 전체 라운드 | 이미지 |
| --- | --- | --- | --- |
| 1–3 | 요동성 | 1–30 | public/terrain/front-yodong.png |
| 4–6 | 평양성 | 31–45 | public/terrain/front-pyongyang.png |
| 7–9 | 살수 | 46–60 | public/terrain/front-salsu.png |
| 10 | 수양제 최종전 | 61–65 | public/terrain/front-emperor.png |

기존 사각 순환 경로 및 배치 좌표 유지. 구 버전 저장은 유닛·골드·강화 상태를 보존하며 해당 스테이지의 새 라운드 범위로 보정. 기존 수양제 전투/최종 승리는 10스테이지로 이동.

## 이미지 생성

Built-in imagegen 사용. 각 이미지 1회씩 생성, 1254×1254 PNG. 역사적 실측 지형이 아닌 게임용 재구성.

공통 프롬프트: Use case: stylized-concept. Asset type: 1024x1024 square mobile SD tower-defense game terrain background. True overhead top-down view, polished handpainted painterly game texture, charming simplified forms, consistent soft outlines, detailed but visually readable. No perspective horizon. Terrain fills full square. Composition crucial: central 22%-78% region is empty uncluttered softly textured ground for unit placement. Game code will overlay a rectangular looping dirt road between 8%-16% inset from canvas edges, so keep this entire inset corridor open and traversable ground, do NOT draw a road. Major architecture and scenery only along extreme outer 0%-8% border. No people, no units, no weapons, no text, no letters, no UI, no grids, no icons, no watermarks.

각 프롬프트에 아래 문구를 추가:

- Yodong fortress: a grassy courtyard of muted fresh green turf with subtle worn earth patches, gray stone ramparts and little pine woodland clusters confined to extreme outer border, ancient Korean Goguryeo fortress character, cool gray stones, gentle daylight.
- Pyongyang fortified city: lush green open plaza of soft short grass, ancient Korean tiled-roof city walls confined to extreme outer border, a narrow glimpse of blue river at the very outer edge. Distinct tiled roofs with charcoal blue ceramic, pale stone wall bases, fresh greenery, clear daylight.
- Salsu river battlefield: large broad pale sand sandbar with sparse short light green grass at center, calm visible blue river hugging all outer edges, a few reeds and smooth rocks on extreme outer border. The sandbar occupies at least central 88% width and height for the traversable rectangular inset corridor. Water readable turquoise blue, pale cream sand, soft daylight.
- Emperor Yang final battle imperial encampment: broad ochre packed-earth parade ground, empty center, dark red command tents and blank red banners confined to extreme outer border, ancient Sui imperial campaign atmosphere. Dramatic warm golden lighting with clear gameplay readability, terracotta and muted burgundy edge accents, dusty golden ochre ground.

