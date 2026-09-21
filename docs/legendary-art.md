# 5단계 등장 연출 — 아트 제작 기록

내장 이미지 생성 도구로 제작한 상징 배경입니다. SD 영웅은 기존 tier-5-atlas.png의 단일 캐릭터를 별도로 겹칩니다. 모든 그림은 게임용 상징 표현이며 역사 유물의 정밀 복원도가 아닙니다.

배경 파일은 public/cinematics/에 있으며 CSS opacity 0.8(불투명도 80%, 투명도 20%)로 전장 전체에 표시됩니다. 초기 버전에서 너무 옅고 뒤쪽에 배치되어 보이지 않던 문제를 수정해, 음수 z-index 없이 배경을 전장 위에 명시적으로 배치합니다.

세종대왕 대사는 사용자가 제공한 훈민정음 서문의 현대어 문장을 사용했습니다. 이순신 대사는 [대한민국 정책브리핑의 장계 소개](https://www.korea.kr/news/policyNewsView.do?newsId=65055087)를 바탕으로 현대어로 재구성했습니다. 나머지 여섯 영웅은 실제 명언으로 오인하지 않도록 게임 창작 대사임을 화면에 표시합니다.

사용자 요청에 따라 음성 재생을 제거했습니다. 등장 연출에는 이미지와 대사 자막만 표시합니다.

## 최종 프롬프트

### sejong

저장 파일: public/cinematics/sejong.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A magnificent open Hunminjeongeum manuscript book, cream paper leaves gently unfurling in warm luminous air, wooden printing blocks, dark red palace-library wood and subtle Korean cloud motifs. Make the open book the unmistakable monumental centerpiece. Warm ivory, antique gold and royal-red accents. Leave pages blank for precise lettering added by the game.
```

### yi-sunsin

저장 파일: public/cinematics/yi-sunsin.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A majestic Joseon turtle ship with recognizable covered armored roof, dragon-head bow and wooden hull cutting through rolling jade-blue sea waves; distant Korean coast, radiant cloud break, heroic dawn. The ship large across the upper two thirds. Navy, turquoise and warm gold accents.
```

### gwanggaeto

저장 파일: public/cinematics/gwanggaeto.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A monumental Goguryeo stone victory stele and a sweeping mountain fortress stretching across vast northern mountains. Wind-swept deep purple military banners without writing, expansive golden sunrise, atmosphere of a great conquering king. Deep violet, slate and gold accents.
```

### eulji

저장 파일: public/cinematics/eulji.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A powerful curling blue river surge between Korean mountain cliffs, pale mist, an unfolded military strategy scroll near the foreground edge, evoking the Battle of Salsu through water and tactical wisdom. Teal water, ink blue mountains and silver light.
```

### kim-yusin

저장 파일: public/cinematics/kim-yusin.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A radiant ornate Silla sword rising diagonally before a majestic ancient Korean mountain fortress, golden crown-like ornamentation and white battle banners without writing, triumphant morning light. Ivory, warm bronze and gold palette.
```

### yi-seonggye

저장 파일: public/cinematics/yi-seonggye.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A magnificent traditional Korean reflex bow and one nocked arrow as the large symbolic centerpiece, mountain ridges and a distant early Joseon palace roof under sweeping green banners without writing. Emerald green, warm brown and golden dawn light.
```

### cheok

저장 파일: public/cinematics/cheok.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: A powerful polished Korean sword slashing a graceful arc of white light before a rugged Goryeo mountain fortress, wind and scattered glowing dust, heroic swordmaster atmosphere. Steel gray, jade green and bright silver light. No hands, no people.
```

### jeongjo

저장 파일: public/cinematics/jeongjo.png

```text
Use case: stylized-concept.
Asset type: square background illustration for a Korean-history SD defense game's legendary hero reveal.
Style/medium: richly painted 2D mobile RPG illustration, charming stylized proportions, crisp dark outlines, soft painterly shading, Korean historical-fantasy atmosphere, handsome and polished.
Composition: one square 1024x1024 full-bleed scene. The symbolic object is large in the upper and middle background. Keep the center lower half relatively calm because the game overlays a separate SD character there. We will add all names, quotes and UI in code.
Constraints: NO people, NO characters, NO text, NO captions, NO letters, NO logo, NO watermark, NO frames, NOT a contact sheet. One continuous scene.
Primary request: The impressive stone walls and pavilion of Suwon Hwaseong fortress, royal Joseon scroll and orderly royal guard banners without writing, early morning golden rays. Cobalt blue, aged ivory stone and imperial gold accents.
```
