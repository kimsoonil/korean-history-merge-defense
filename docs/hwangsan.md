# 황산벌 전투 (제3장)

개방 조건: 살수대첩 일반 10스테이지와 안시성 일반 10스테이지를 완료하면 이야기 선택에서 시작할 수 있다. 3-1~3-10은 20~65라운드이며, 들판(1~3), 백제 진영(4~6), 결사대 전선(7~9), 계백 최종전(10)으로 구성된다. 네 전선은 동일한 황산벌 전장 이미지를 사용한다.

기존 모집·조합·가방·강화·보상·일반/하드 규칙을 유지한다. 보스는 10/20라운드 및 이후 5라운드 간격으로 등장하고 3-10의 65라운드는 계백이다. 계백은 기존 최종 보스와 같은 일반 50,000 / 하드 100,000 HP와 방어도 규칙을 사용한다. 개방 기록은 `hwangsan-campaign-v1`, `hwangsan-hard-campaign-v1`로 분리했다. 진행 중 전투는 기존처럼 하나의 슬롯에 저장한다.

## 역사와 게임 각색

660년 황산벌에서 신라 김유신의 군대와 백제 계백의 군대가 맞섰던 사건을 바탕으로 한다. 이 장은 외세 방어가 아닌 삼국 간 전쟁이며, 신라 전선을 따라가는 게임 구성이다. 충상·상영은 기록에 나오는 백제 측 인물이다. 라운드별 출현 순서, 가상의 부대장, 모든 대사는 창작이며 실제 발언이 아니다. 백제 측을 악인이나 외국 침략군으로 묘사하지 않는다. 시대를 초월한 영웅 소환은 기존 판타지 설정을 유지한다.

참고: [한국민족문화대백과사전 황산벌전투](https://encykorea.aks.ac.kr/Article/E0065183), [국사편찬위원회 삼국사기](https://db.history.go.kr/item/compareViewer.do?levelId=sg_005r_0040_0290).

## 이미지

- 전장: `public/terrain/hwangsan-battlefield.png`
- 계백: 기존 4단계 계백 SD 초상화 재사용
- 일반 백제군과 중간 보스: 기존 투명 SD 병종 이미지 재사용
- 이야기 책: 기존 김유신 삽화 재사용

전장은 imagegen 스킬과 내장 image_gen 도구로 1회 생성했다. 생성 원본은 `/Users/kimsunul/.codex/generated_images/01a0e087-766e-7ba3-8014-f3ae69ebc5b0/exec-4ff4853a-e579-4a30-9fb8-d0a4051f9b24.png`에 보존했다.

### 최종 프롬프트

Use case: historical-scene
Asset type: square raster battlefield background for a strategy game, 1024x1024.
Primary request: Hwangsanbeol battlefield in Korea in 660 AD, Korean Three Kingdoms war camp atmosphere.
Style/medium: detailed hand-painted strategy game terrain, aerial orthographic straight top-down view.
Composition/framing: broad empty dry yellow-green grassy central field occupying the middle 80% of the canvas, reserved for game units. A continuous unobstructed dirt square patrol road follows the perimeter, its centerline at x=5% and x=95% for the vertical sides and y=5% and y=95% for the horizontal sides. Four long straight sides, only slight bends at the corners. No road crosses the center.
Peripheral details: sparse low earthen barricades, small tents, and ancient red and blue banners ONLY in the narrow peripheral margin just inside the road. All props must leave the road fully unobstructed and the central field empty. Low hills suggested only at the extreme outer edge.
Lighting/mood: warm summer earth, natural daylight.
Materials/textures: softly varied dry grass, compacted warm dirt, modest painterly detail that supports visible game units.
Constraints: one square image only; opaque background; no stone fortress walls; no soldiers; no people; no text, lettering, UI, watermark, or grid. No central roads, no central props, no perspective tilt.

## 검증

`tests/hwangsan.test.mjs`: 선행 장 개방 조건, 일반/하드 모든 라운드 적 생성 및 저장 복원, 6개 진행 기록 키 분리, 보스 대사, 계백 이미지 연결, 최종 승리 저장 확인.
