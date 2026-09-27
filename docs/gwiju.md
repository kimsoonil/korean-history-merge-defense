# 귀주대첩 구현

제5장. 앞선 네 이야기의 일반 10스테이지 완료 후 개방됩니다. 자체 일반 10스테이지 완료 후 하드가 열리며 진도는 독립 저장합니다.

- 1~3 흥화진 / 4~6 개경 방어선 / 7~9 귀주 벌판 / 10 소배압 최종전
- 스테이지별 20~65라운드. 기존 보스 90초, 인원·보상·강화 규칙 유지.
- 최종 보스 체력 일반 50,000 / 하드 100,000.
- 기존 귀주 이야기 삽화 유지. 신규 전장 `public/terrain/gwiju-battlefield.png` 사용. 적 캐릭터는 기존 병종 아틀라스 재사용.
- 1018~1019년 제3차 거란 침입을 배경으로 하며 대사, 반복 보스 및 전선 구분은 게임적 각색입니다. 양규 등 앞선 침입 시기의 인물을 현장 NPC로 배치하지 않았습니다.

역사 참고: [국사편찬위원회 한국사연대기](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i200400), [한국민족문화대백과 구주대첩](https://encykorea.aks.ac.kr/Article/E0006043).

## 이미지 생성

내장 imagegen, 원본 PNG 적용. 전체 프롬프트:

```text
Use case: stylized-concept
Asset type: square 1024x1024 background for a Korean historical tower defense game.
Primary request: Gwiju battlefield, Goryeo in 1019, early spring northern inland plain. Muted olive and dry grass field, a few small pines, rocks and low earthen fortifications only along extreme outer edges, hints of distant hills as top-down terrain, no horizon.
Composition: exactly orthographic top down. Central 80 percent entirely empty gently textured grass for game units. Continuous broad dirt patrol road around perimeter, straight centerlines at x=5% and x=95%, y=5% and y=95%, gently rounded corners radius 8% of canvas. All road unobstructed. No cross roads. No large buildings. Hand-painted polished strategy game terrain, soft natural daylight.
Constraints: no people, no units, no text, no UI, no grid, no watermark, no snow in central field, no ocean. Opaque full-bleed square.
```

